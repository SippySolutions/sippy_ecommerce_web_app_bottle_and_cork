const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { APIContracts, APIControllers, Constants } = require('authorizenet');

// Utility: Get Authorize.Net credentials and endpoint
function getAuthorizeNetConfig() {
  return {
    apiLoginId: process.env.AUTHORIZE_NET_API_LOGIN_ID,
    transactionKey: process.env.AUTHORIZE_NET_TRANSACTION_KEY,
    endpoint: process.env.NODE_ENV === 'production' 
      ? Constants.endpoint.production 
      : Constants.endpoint.sandbox,
  };
}

// Create or get Authorize.Net customer profile for a user
async function getOrCreateCustomerProfile(user) {
  if (user.authorizeNetCustomerProfileId) {
    return user.authorizeNetCustomerProfileId;
  }

  const { apiLoginId, transactionKey, endpoint } = getAuthorizeNetConfig();
  const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
  merchantAuthenticationType.setName(apiLoginId);
  merchantAuthenticationType.setTransactionKey(transactionKey);

  const profile = new APIContracts.CustomerProfileType();
  profile.setMerchantCustomerId(user._id.toString().slice(-20));
  profile.setEmail(user.email);
  profile.setDescription(user.name);

  const createRequest = new APIContracts.CreateCustomerProfileRequest();
  createRequest.setProfile(profile);
  createRequest.setMerchantAuthentication(merchantAuthenticationType);

  const ctrl = new APIControllers.CreateCustomerProfileController(createRequest.getJSON());
  ctrl.setEnvironment(endpoint);

  return new Promise((resolve, reject) => {
    ctrl.execute(() => {
      const apiResponse = ctrl.getResponse();
      const response = new APIContracts.CreateCustomerProfileResponse(apiResponse);
      
      if (response.getMessages().getResultCode() === APIContracts.MessageTypeEnum.OK) {
        const profileId = response.getCustomerProfileId();
        resolve(profileId);
      } else {
        const error = response.getMessages().getMessage()[0];
        reject(new Error(error.getText()));
      }
    });
  });
}

// Process payment using Accept.js token (PCI compliant)
exports.processPayment = async (req, res) => {
  try {
    const {
      dataDescriptor,
      dataValue,
      amount,
      cartItems,
      shippingAddress,
      billingAddress,
      orderType = 'delivery',
      tip = 0,
      bagFee = 0,
      saveCard = false
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Validate cart items and calculate totals
    const productIds = cartItems.map(item => item.product);
    const products = await Product.find({ _id: { $in: productIds } });
    
    let subtotal = 0;
    const validatedItems = [];

    for (const item of cartItems) {
      const product = products.find(p => p._id.toString() === item.product);
      if (!product) {
        return res.status(400).json({ 
          success: false, 
          message: `Product not found: ${item.product}` 
        });
      }
      
      const itemTotal = (product.saleprice || product.price) * item.quantity;
      subtotal += itemTotal;
      
      validatedItems.push({
        product: product._id,
        name: product.name,
        price: product.saleprice || product.price,
        quantity: item.quantity,
        image: product.productimg
      });
    }

    const tax = subtotal * 0.08; // 8% tax rate (adjust as needed)
    const total = subtotal + tax + tip + bagFee;

    if (Math.abs(total - amount) > 0.01) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount mismatch' 
      });
    }

    const { apiLoginId, transactionKey, endpoint } = getAuthorizeNetConfig();
    const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
    merchantAuthenticationType.setName(apiLoginId);
    merchantAuthenticationType.setTransactionKey(transactionKey);

    // Create payment using opaqueData from Accept.js
    const opaqueData = new APIContracts.OpaqueDataType();
    opaqueData.setDataDescriptor(dataDescriptor);
    opaqueData.setDataValue(dataValue);

    const paymentType = new APIContracts.PaymentType();
    paymentType.setOpaqueData(opaqueData);

    // Set billing address
    const billTo = new APIContracts.CustomerAddressType();
    billTo.setFirstName(billingAddress.firstName);
    billTo.setLastName(billingAddress.lastName);
    billTo.setAddress(billingAddress.address);
    billTo.setCity(billingAddress.city);
    billTo.setState(billingAddress.state);
    billTo.setZip(billingAddress.zip);
    billTo.setCountry(billingAddress.country || 'US');

    // Set shipping address if delivery
    let shipTo = null;
    if (orderType === 'delivery' && shippingAddress) {
      shipTo = new APIContracts.CustomerAddressType();
      shipTo.setFirstName(shippingAddress.firstName);
      shipTo.setLastName(shippingAddress.lastName);
      shipTo.setAddress(shippingAddress.address);
      shipTo.setCity(shippingAddress.city);
      shipTo.setState(shippingAddress.state);
      shipTo.setZip(shippingAddress.zip);
      shipTo.setCountry(shippingAddress.country || 'US');
    }

    // Create transaction request
    const transactionRequest = new APIContracts.TransactionRequestType();
    transactionRequest.setTransactionType(APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
    transactionRequest.setPayment(paymentType);
    transactionRequest.setAmount(total.toFixed(2));
    transactionRequest.setBillTo(billTo);
    if (shipTo) transactionRequest.setShipTo(shipTo);

    // Add line items for better reporting
    const lineItems = new APIContracts.ArrayOfLineItem();
    validatedItems.forEach((item, index) => {
      const lineItem = new APIContracts.LineItemType();
      lineItem.setItemId(item.product.toString().slice(-31)); // Max 31 chars
      lineItem.setName(item.name.slice(0, 31)); // Max 31 chars
      lineItem.setQuantity(item.quantity);
      lineItem.setUnitPrice(item.price.toFixed(2));
      lineItems.getLineItem().push(lineItem);
    });
    transactionRequest.setLineItems(lineItems);

    const createRequest = new APIContracts.CreateTransactionRequest();
    createRequest.setMerchantAuthentication(merchantAuthenticationType);
    createRequest.setTransactionRequest(transactionRequest);

    const ctrl = new APIControllers.CreateTransactionController(createRequest.getJSON());
    ctrl.setEnvironment(endpoint);

    const paymentResult = await new Promise((resolve, reject) => {
      ctrl.execute(() => {
        const apiResponse = ctrl.getResponse();
        const response = new APIContracts.CreateTransactionResponse(apiResponse);
        
        if (response.getMessages().getResultCode() === APIContracts.MessageTypeEnum.OK) {
          const transactionResponse = response.getTransactionResponse();
          if (transactionResponse.getMessages().getMessage().length > 0) {
            resolve({
              success: true,
              transactionId: transactionResponse.getTransId(),
              authCode: transactionResponse.getAuthCode(),
              responseCode: transactionResponse.getResponseCode(),
              messageCode: transactionResponse.getMessages().getMessage()[0].getCode(),
              description: transactionResponse.getMessages().getMessage()[0].getDescription()
            });
          } else {
            const errors = transactionResponse.getErrors().getError();
            reject(new Error(errors[0].getErrorText()));
          }
        } else {
          const error = response.getMessages().getMessage()[0];
          reject(new Error(`Error: ${error.getCode()} - ${error.getText()}`));
        }
      });
    });

    // Create order after successful payment
    const order = new Order({
      customer: user._id,
      items: validatedItems,
      subtotal: subtotal,
      tax: tax,
      total: total,
      shippingAddress: orderType === 'delivery' ? shippingAddress : null,
      billingAddress: billingAddress,
      paymentInfo: {
        transactionId: paymentResult.transactionId,
        method: 'card',
        amount: total
      },
      orderType: orderType,
      tip: tip,
      bagFee: bagFee,
      status: 'pending'
    });

    await order.save();

    // Update user's orders
    user.orders.push(order._id);
    await user.save();

    // If user wants to save card for future use, create customer profile
    if (saveCard) {
      try {
        const customerProfileId = await getOrCreateCustomerProfile(user);
        user.authorizeNetCustomerProfileId = customerProfileId;
        await user.save();
      } catch (error) {
        console.error('Error creating customer profile:', error);
        // Don't fail the order if profile creation fails
      }
    }

    res.json({
      success: true,
      order: order,
      payment: paymentResult,
      message: 'Payment processed successfully'
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Payment processing failed'
    });
  }
};

// Create customer profile in Authorize.Net
exports.createCustomerProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.authorizeNetCustomerProfileId) {
      return res.json({
        success: true,
        customerProfileId: user.authorizeNetCustomerProfileId,
        message: 'Customer profile already exists'
      });
    }

    const customerProfileId = await getOrCreateCustomerProfile(user);
    user.authorizeNetCustomerProfileId = customerProfileId;
    await user.save();

    res.json({
      success: true,
      customerProfileId: customerProfileId,
      message: 'Customer profile created successfully'
    });

  } catch (error) {
    console.error('Error creating customer profile:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create customer profile'
    });
  }
};

// Add payment method using Accept.js token
exports.addPaymentMethod = async (req, res) => {
  try {
    const { dataDescriptor, dataValue, billingAddress, isDefault = false } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Ensure user has customer profile
    let customerProfileId = user.authorizeNetCustomerProfileId;
    if (!customerProfileId) {
      customerProfileId = await getOrCreateCustomerProfile(user);
      user.authorizeNetCustomerProfileId = customerProfileId;
      await user.save();
    }

    const { apiLoginId, transactionKey, endpoint } = getAuthorizeNetConfig();
    const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
    merchantAuthenticationType.setName(apiLoginId);
    merchantAuthenticationType.setTransactionKey(transactionKey);

    // Create payment using opaqueData
    const opaqueData = new APIContracts.OpaqueDataType();
    opaqueData.setDataDescriptor(dataDescriptor);
    opaqueData.setDataValue(dataValue);

    const paymentType = new APIContracts.PaymentType();
    paymentType.setOpaqueData(opaqueData);

    // Set billing address
    const billTo = new APIContracts.CustomerAddressType();
    billTo.setFirstName(billingAddress.firstName);
    billTo.setLastName(billingAddress.lastName);
    billTo.setAddress(billingAddress.address);
    billTo.setCity(billingAddress.city);
    billTo.setState(billingAddress.state);
    billTo.setZip(billingAddress.zip);
    billTo.setCountry(billingAddress.country || 'US');

    const paymentProfile = new APIContracts.CustomerPaymentProfileType();
    paymentProfile.setCustomerType(APIContracts.CustomerTypeEnum.INDIVIDUAL);
    paymentProfile.setPayment(paymentType);
    paymentProfile.setBillTo(billTo);

    const createRequest = new APIContracts.CreateCustomerPaymentProfileRequest();
    createRequest.setMerchantAuthentication(merchantAuthenticationType);
    createRequest.setCustomerProfileId(customerProfileId);
    createRequest.setPaymentProfile(paymentProfile);
    createRequest.setValidationMode(
      endpoint === Constants.endpoint.production 
        ? APIContracts.ValidationModeEnum.LIVE 
        : APIContracts.ValidationModeEnum.TESTMODE
    );

    const ctrl = new APIControllers.CreateCustomerPaymentProfileController(createRequest.getJSON());
    ctrl.setEnvironment(endpoint);

    const paymentProfileId = await new Promise((resolve, reject) => {
      ctrl.execute(() => {
        const apiResponse = ctrl.getResponse();
        const response = new APIContracts.CreateCustomerPaymentProfileResponse(apiResponse);
        
        if (response.getMessages().getResultCode() === APIContracts.MessageTypeEnum.OK) {
          resolve(response.getCustomerPaymentProfileId());
        } else {
          const error = response.getMessages().getMessage()[0];
          reject(new Error(error.getText()));
        }
      });
    });

    // Get payment profile details for storing locally
    const getRequest = new APIContracts.GetCustomerPaymentProfileRequest();
    getRequest.setMerchantAuthentication(merchantAuthenticationType);
    getRequest.setCustomerProfileId(customerProfileId);
    getRequest.setCustomerPaymentProfileId(paymentProfileId);

    const getCtrl = new APIControllers.GetCustomerPaymentProfileController(getRequest.getJSON());
    getCtrl.setEnvironment(endpoint);

    const paymentDetails = await new Promise((resolve, reject) => {
      getCtrl.execute(() => {
        const apiResponse = getCtrl.getResponse();
        const response = new APIContracts.GetCustomerPaymentProfileResponse(apiResponse);
        
        if (response.getMessages().getResultCode() === APIContracts.MessageTypeEnum.OK) {
          const profile = response.getPaymentProfile();
          const payment = profile.getPayment();
          const card = payment.getCreditCard();
          
          resolve({
            lastFour: card.getCardNumber().slice(-4),
            cardType: card.getCardType ? card.getCardType() : 'Unknown',
            expiryMonth: card.getExpirationDate().split('-')[1],
            expiryYear: card.getExpirationDate().split('-')[0]
          });
        } else {
          reject(new Error('Failed to get payment profile details'));
        }
      });
    });

    // If this is the default card, unset other defaults
    if (isDefault) {
      user.billing.forEach(card => card.isDefault = false);
    }

    // Add to user's billing methods
    const newBillingMethod = {
      id: Date.now().toString(),
      customerProfileId: customerProfileId,
      customerPaymentProfileId: paymentProfileId,
      cardType: paymentDetails.cardType,
      lastFour: paymentDetails.lastFour,
      expiryMonth: paymentDetails.expiryMonth,
      expiryYear: paymentDetails.expiryYear,
      cardholderName: `${billingAddress.firstName} ${billingAddress.lastName}`,
      isDefault: isDefault || user.billing.length === 0
    };

    user.billing.push(newBillingMethod);
    await user.save();

    res.json({
      success: true,
      paymentMethod: newBillingMethod,
      message: 'Payment method added successfully'
    });

  } catch (error) {
    console.error('Error adding payment method:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add payment method'
    });
  }
};

// Delete payment method
exports.deletePaymentMethod = async (req, res) => {
  try {
    const { paymentMethodId } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const paymentMethod = user.billing.find(method => method.id === paymentMethodId);
    if (!paymentMethod) {
      return res.status(404).json({ success: false, message: 'Payment method not found' });
    }

    // Delete from Authorize.Net
    if (paymentMethod.customerPaymentProfileId) {
      const { apiLoginId, transactionKey, endpoint } = getAuthorizeNetConfig();
      const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
      merchantAuthenticationType.setName(apiLoginId);
      merchantAuthenticationType.setTransactionKey(transactionKey);

      const deleteRequest = new APIContracts.DeleteCustomerPaymentProfileRequest();
      deleteRequest.setMerchantAuthentication(merchantAuthenticationType);
      deleteRequest.setCustomerProfileId(user.authorizeNetCustomerProfileId);
      deleteRequest.setCustomerPaymentProfileId(paymentMethod.customerPaymentProfileId);

      const ctrl = new APIControllers.DeleteCustomerPaymentProfileController(deleteRequest.getJSON());
      ctrl.setEnvironment(endpoint);

      await new Promise((resolve, reject) => {
        ctrl.execute(() => {
          const apiResponse = ctrl.getResponse();
          const response = new APIContracts.DeleteCustomerPaymentProfileResponse(apiResponse);
          
          if (response.getMessages().getResultCode() === APIContracts.MessageTypeEnum.OK) {
            resolve();
          } else {
            console.error('Failed to delete from Authorize.Net:', response.getMessages().getMessage()[0].getText());
            // Continue with local deletion even if Authorize.Net deletion fails
            resolve();
          }
        });
      });
    }

    // Remove from user's billing methods
    user.billing = user.billing.filter(method => method.id !== paymentMethodId);
    await user.save();

    res.json({
      success: true,
      message: 'Payment method deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting payment method:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete payment method'
    });
  }
};

// Process payment with saved card
exports.processPaymentWithSavedCard = async (req, res) => {
  try {
    const {
      paymentMethodId,
      amount,
      cartItems,
      shippingAddress,
      billingAddress,
      orderType = 'delivery',
      tip = 0,
      bagFee = 0
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const paymentMethod = user.billing.find(method => method.id === paymentMethodId);
    if (!paymentMethod) {
      return res.status(404).json({ success: false, message: 'Payment method not found' });
    }

    // Validate cart items and calculate totals
    const productIds = cartItems.map(item => item.product);
    const products = await Product.find({ _id: { $in: productIds } });
    
    let subtotal = 0;
    const validatedItems = [];

    for (const item of cartItems) {
      const product = products.find(p => p._id.toString() === item.product);
      if (!product) {
        return res.status(400).json({ 
          success: false, 
          message: `Product not found: ${item.product}` 
        });
      }
      
      const itemTotal = (product.saleprice || product.price) * item.quantity;
      subtotal += itemTotal;
      
      validatedItems.push({
        product: product._id,
        name: product.name,
        price: product.saleprice || product.price,
        quantity: item.quantity,
        image: product.productimg
      });
    }

    const tax = subtotal * 0.08; // 8% tax rate
    const total = subtotal + tax + tip + bagFee;

    if (Math.abs(total - amount) > 0.01) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount mismatch' 
      });
    }

    const { apiLoginId, transactionKey, endpoint } = getAuthorizeNetConfig();
    const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
    merchantAuthenticationType.setName(apiLoginId);
    merchantAuthenticationType.setTransactionKey(transactionKey);

    // Create customer profile transaction request
    const profileTransAuthCapture = new APIContracts.CreateTransactionRequest();
    profileTransAuthCapture.setMerchantAuthentication(merchantAuthenticationType);

    const transactionRequest = new APIContracts.TransactionRequestType();
    transactionRequest.setTransactionType(APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
    transactionRequest.setAmount(total.toFixed(2));

    const customerProfilePayment = new APIContracts.CustomerProfilePaymentType();
    customerProfilePayment.setCustomerProfileId(user.authorizeNetCustomerProfileId);
    
    const paymentProfile = new APIContracts.PaymentProfile();
    paymentProfile.setPaymentProfileId(paymentMethod.customerPaymentProfileId);
    customerProfilePayment.setPaymentProfile(paymentProfile);

    transactionRequest.setProfile(customerProfilePayment);

    // Set addresses
    const billTo = new APIContracts.CustomerAddressType();
    billTo.setFirstName(billingAddress.firstName);
    billTo.setLastName(billingAddress.lastName);
    billTo.setAddress(billingAddress.address);
    billTo.setCity(billingAddress.city);
    billTo.setState(billingAddress.state);
    billTo.setZip(billingAddress.zip);
    billTo.setCountry(billingAddress.country || 'US');
    transactionRequest.setBillTo(billTo);

    if (orderType === 'delivery' && shippingAddress) {
      const shipTo = new APIContracts.CustomerAddressType();
      shipTo.setFirstName(shippingAddress.firstName);
      shipTo.setLastName(shippingAddress.lastName);
      shipTo.setAddress(shippingAddress.address);
      shipTo.setCity(shippingAddress.city);
      shipTo.setState(shippingAddress.state);
      shipTo.setZip(shippingAddress.zip);
      shipTo.setCountry(shippingAddress.country || 'US');
      transactionRequest.setShipTo(shipTo);
    }

    profileTransAuthCapture.setTransactionRequest(transactionRequest);

    const ctrl = new APIControllers.CreateTransactionController(profileTransAuthCapture.getJSON());
    ctrl.setEnvironment(endpoint);

    const paymentResult = await new Promise((resolve, reject) => {
      ctrl.execute(() => {
        const apiResponse = ctrl.getResponse();
        const response = new APIContracts.CreateTransactionResponse(apiResponse);
        
        if (response.getMessages().getResultCode() === APIContracts.MessageTypeEnum.OK) {
          const transactionResponse = response.getTransactionResponse();
          if (transactionResponse.getMessages().getMessage().length > 0) {
            resolve({
              success: true,
              transactionId: transactionResponse.getTransId(),
              authCode: transactionResponse.getAuthCode(),
              responseCode: transactionResponse.getResponseCode(),
              messageCode: transactionResponse.getMessages().getMessage()[0].getCode(),
              description: transactionResponse.getMessages().getMessage()[0].getDescription(),
              method: 'saved_card',
              lastFour: paymentMethod.lastFour,
              cardType: paymentMethod.cardType
            });
          } else {
            const errors = transactionResponse.getErrors().getError();
            reject(new Error(errors[0].getErrorText()));
          }
        } else {
          const error = response.getMessages().getMessage()[0];
          reject(new Error(`Error: ${error.getCode()} - ${error.getText()}`));
        }
      });
    });

    // Create order after successful payment
    const order = new Order({
      customer: user._id,
      items: validatedItems,
      subtotal: subtotal,
      tax: tax,
      total: total,
      shippingAddress: orderType === 'delivery' ? shippingAddress : null,
      billingAddress: billingAddress,
      paymentInfo: {
        transactionId: paymentResult.transactionId,
        method: 'saved_card',
        lastFour: paymentMethod.lastFour,
        cardType: paymentMethod.cardType,
        amount: total
      },
      orderType: orderType,
      tip: tip,
      bagFee: bagFee,
      status: 'pending'
    });

    await order.save();

    // Update user's orders
    user.orders.push(order._id);
    await user.save();

    res.json({
      success: true,
      order: order,
      payment: paymentResult,
      message: 'Payment processed successfully'
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Payment processing failed'
    });
  }
};

// Validate payment methods (check if they still exist in Authorize.Net)
exports.validatePaymentMethods = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.authorizeNetCustomerProfileId || user.billing.length === 0) {
      return res.json({ success: true, validMethods: [], invalidMethods: [] });
    }

    const { apiLoginId, transactionKey, endpoint } = getAuthorizeNetConfig();
    const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
    merchantAuthenticationType.setName(apiLoginId);
    merchantAuthenticationType.setTransactionKey(transactionKey);

    const validMethods = [];
    const invalidMethods = [];

    for (const method of user.billing) {
      if (!method.customerPaymentProfileId) {
        invalidMethods.push(method.id);
        continue;
      }

      try {
        const getRequest = new APIContracts.GetCustomerPaymentProfileRequest();
        getRequest.setMerchantAuthentication(merchantAuthenticationType);
        getRequest.setCustomerProfileId(user.authorizeNetCustomerProfileId);
        getRequest.setCustomerPaymentProfileId(method.customerPaymentProfileId);

        const ctrl = new APIControllers.GetCustomerPaymentProfileController(getRequest.getJSON());
        ctrl.setEnvironment(endpoint);

        const isValid = await new Promise((resolve) => {
          ctrl.execute(() => {
            const apiResponse = ctrl.getResponse();
            const response = new APIContracts.GetCustomerPaymentProfileResponse(apiResponse);
            resolve(response.getMessages().getResultCode() === APIContracts.MessageTypeEnum.OK);
          });
        });

        if (isValid) {
          validMethods.push(method.id);
        } else {
          invalidMethods.push(method.id);
        }
      } catch (error) {
        invalidMethods.push(method.id);
      }
    }

    // Remove invalid methods from user record
    if (invalidMethods.length > 0) {
      user.billing = user.billing.filter(method => !invalidMethods.includes(method.id));
      await user.save();
    }

    res.json({
      success: true,
      validMethods,
      invalidMethods,
      message: `Validated ${user.billing.length} payment methods`
    });

  } catch (error) {
    console.error('Error validating payment methods:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to validate payment methods'
    });
  }
};

// Get payment history
exports.getPaymentHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'orders',
      select: 'orderNumber total paymentInfo status createdAt',
      options: { sort: { createdAt: -1 } }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      paymentHistory: user.orders
    });

  } catch (error) {
    console.error('Error getting payment history:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get payment history'
    });
  }
};

// Refund transaction
exports.refundTransaction = async (req, res) => {
  try {
    const { transactionId, amount, reason } = req.body;

    // Find the order
    const order = await Order.findOne({ 'paymentInfo.transactionId': transactionId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check if user owns this order
    if (order.customer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const { apiLoginId, transactionKey, endpoint } = getAuthorizeNetConfig();
    const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
    merchantAuthenticationType.setName(apiLoginId);
    merchantAuthenticationType.setTransactionKey(transactionKey);

    const transactionRequest = new APIContracts.TransactionRequestType();
    transactionRequest.setTransactionType(APIContracts.TransactionTypeEnum.REFUNDTRANSACTION);
    transactionRequest.setAmount(amount.toFixed(2));
    transactionRequest.setRefTransId(transactionId);

    const createRequest = new APIContracts.CreateTransactionRequest();
    createRequest.setMerchantAuthentication(merchantAuthenticationType);
    createRequest.setTransactionRequest(transactionRequest);

    const ctrl = new APIControllers.CreateTransactionController(createRequest.getJSON());
    ctrl.setEnvironment(endpoint);

    const refundResult = await new Promise((resolve, reject) => {
      ctrl.execute(() => {
        const apiResponse = ctrl.getResponse();
        const response = new APIContracts.CreateTransactionResponse(apiResponse);
        
        if (response.getMessages().getResultCode() === APIContracts.MessageTypeEnum.OK) {
          const transactionResponse = response.getTransactionResponse();
          if (transactionResponse.getMessages().getMessage().length > 0) {
            resolve({
              success: true,
              refundTransactionId: transactionResponse.getTransId(),
              authCode: transactionResponse.getAuthCode(),
              responseCode: transactionResponse.getResponseCode()
            });
          } else {
            const errors = transactionResponse.getErrors().getError();
            reject(new Error(errors[0].getErrorText()));
          }
        } else {
          const error = response.getMessages().getMessage()[0];
          reject(new Error(`Error: ${error.getCode()} - ${error.getText()}`));
        }
      });
    });

    // Update order status
    order.status = 'cancelled';
    await order.save();

    res.json({
      success: true,
      refund: refundResult,
      message: 'Refund processed successfully'
    });

  } catch (error) {
    console.error('Refund processing error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Refund processing failed'
    });
  }
};