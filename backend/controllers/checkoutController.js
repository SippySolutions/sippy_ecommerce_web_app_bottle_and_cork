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

// Helper function to retrieve card details from Authorize.Net
async function getCardDetailsFromAuthorizeNet(customerProfileId, customerPaymentProfileId) {
  try {
    const { apiLoginId, transactionKey, endpoint } = getAuthorizeNetConfig();
    const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
    merchantAuthenticationType.setName(apiLoginId);
    merchantAuthenticationType.setTransactionKey(transactionKey);

    const getRequest = new APIContracts.GetCustomerPaymentProfileRequest();
    getRequest.setMerchantAuthentication(merchantAuthenticationType);
    getRequest.setCustomerProfileId(customerProfileId);
    getRequest.setCustomerPaymentProfileId(customerPaymentProfileId);
    getRequest.setUnmaskExpirationDate(true); // Get unmasked expiration date

    const ctrl = new APIControllers.GetCustomerPaymentProfileController(getRequest.getJSON());
    ctrl.setEnvironment(endpoint);

    return new Promise((resolve, reject) => {
      ctrl.execute(() => {
        const apiResponse = ctrl.getResponse();
        const response = new APIContracts.GetCustomerPaymentProfileResponse(apiResponse);
        
        if (response.getMessages().getResultCode() === APIContracts.MessageTypeEnum.OK) {
          const paymentProfile = response.getPaymentProfile();
          const payment = paymentProfile.getPayment();
          const creditCard = payment.getCreditCard();
          const billTo = paymentProfile.getBillTo();
          
          resolve({
            cardType: creditCard.getCardType() || 'Unknown',
            lastFour: creditCard.getCardNumber().slice(-4) || '****',
            expiryMonth: creditCard.getExpirationDate().substring(5, 7) || '',
            expiryYear: creditCard.getExpirationDate().substring(0, 4) || '',
            cardholderName: `${billTo.getFirstName()} ${billTo.getLastName()}`.trim() || 'Cardholder'
          });
        } else {
          console.warn('Failed to retrieve card details from Authorize.Net');
          resolve({
            cardType: 'Unknown',
            lastFour: '****',
            expiryMonth: '',
            expiryYear: '',
            cardholderName: 'Cardholder'
          });
        }
      });
    });
  } catch (error) {
    console.error('Error retrieving card details:', error);
    return {
      cardType: 'Unknown',
      lastFour: '****',
      expiryMonth: '',
      expiryYear: '',
      cardholderName: 'Cardholder'
    };
  }
}

// Process payment with new card
exports.processPayment = async (req, res) => {
  try {
    console.log('=== CHECKOUT PROCESS START ===');
    console.log('User ID:', req.user?.id);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    // Helper function to round monetary values to 2 decimal places
    const roundToTwo = (num) => Math.round((num + Number.EPSILON) * 100) / 100;const {
      dataDescriptor,
      dataValue,
      amount,
      cartItems,
      shippingAddress,
      billingAddress,
      orderType = 'delivery',
      tip = 0,
      bagFee = 0,
      deliveryFee = 0,
      saveCard = false,
      ageVerified = false,
      ageVerifiedAt = null
    } = req.body;

    console.log('Extracted data:');
    console.log('- dataDescriptor:', dataDescriptor);
    console.log('- dataValue:', dataValue ? dataValue.substring(0, 50) + '...' : 'undefined');
    console.log('- amount:', amount);
    console.log('- cartItems:', cartItems);
    console.log('- orderType:', orderType);

    // Validate required fields
    if (!dataDescriptor || !dataValue) {
      console.log('❌ Missing payment token data');
      return res.status(400).json({ 
        success: false, 
        message: 'Missing payment token data' 
      });
    }

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      console.log('❌ Invalid cart items');
      return res.status(400).json({ 
        success: false, 
        message: 'Cart is empty or invalid' 
      });
    }

    console.log('Cart items received:', cartItems);

    const user = await User.findById(req.user.id);
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ success: false, message: 'User not found' });    }

    console.log('✅ User found:', user.email);

    // Check for duplicate transactions (prevent double charging)
    const duplicateWindow = 30000; // 30 seconds
    const recentOrders = await Order.find({
      customer: user._id,
      total: amount,
      createdAt: { $gte: new Date(Date.now() - duplicateWindow) }
    });

    if (recentOrders.length > 0) {
      console.log('⚠️ Potential duplicate transaction detected');
      return res.status(400).json({
        success: false,
        message: 'Duplicate transaction detected. Please wait before trying again.'
      });
    }

    // Validate cart items and calculate totals
    const productIds = cartItems.map(item => {
      console.log('Processing cart item for ID extraction:', item);
      return item.product || item._id;
    });
    console.log('Product IDs to find:', productIds);
    
    // Initialize variables outside try block
    let subtotal = 0;
    let validatedItems = [];
    
    try {
      const products = await Product.find({ _id: { $in: productIds } });
      console.log('Products found:', products.length);
      console.log('Product details:', products.map(p => ({ id: p._id, name: p.name })));

      for (const item of cartItems) {
        console.log('Processing cart item:', item);
        const productId = item.product || item._id;
        const product = products.find(p => p._id.toString() === productId.toString());
        if (!product) {
          console.log('❌ Product not found for ID:', productId);
          return res.status(400).json({ 
            success: false, 
            message: `Product not found: ${productId}` 
          });
        }
        const itemTotal = roundToTwo((product.saleprice || product.price) * item.quantity);
      subtotal += itemTotal;
      
      validatedItems.push({
        product: product._id,
        name: product.name,
        price: roundToTwo(product.saleprice || product.price),
        quantity: item.quantity,
        image: product.productimg      });
    }

    } catch (productError) {
      console.log('❌ Error during product validation:', productError);
      return res.status(500).json({ 
        success: false, 
        message: 'Error validating products' 
      });
    }

    subtotal = roundToTwo(subtotal);
    const tax = roundToTwo(subtotal * 0.08); // 8% tax rate
    const total = roundToTwo(subtotal + tax + roundToTwo(tip) + roundToTwo(bagFee) + roundToTwo(deliveryFee));

    if (Math.abs(total - amount) > 0.01) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount mismatch' 
      });    }

    // Process payment with Authorize.Net
    const { apiLoginId, transactionKey, endpoint } = getAuthorizeNetConfig();
    console.log('Authorize.Net config:', { 
      apiLoginId: apiLoginId ? 'SET' : 'MISSING', 
      transactionKey: transactionKey ? 'SET' : 'MISSING',
      endpoint 
    });

    if (!apiLoginId || !transactionKey) {
      return res.status(500).json({
        success: false,
        message: 'Payment gateway configuration error'
      });
    }

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
    billTo.setFirstName(billingAddress.firstName || 'Customer');
    billTo.setLastName(billingAddress.lastName || 'Name');
    billTo.setAddress(billingAddress.address || billingAddress.street || '');
    billTo.setCity(billingAddress.city || '');
    billTo.setState(billingAddress.state || '');
    billTo.setZip(billingAddress.zip || '');
    billTo.setCountry(billingAddress.country || 'US');

    // Set shipping address if delivery
    let shipTo = null;
    if (orderType === 'delivery' && shippingAddress) {
      shipTo = new APIContracts.CustomerAddressType();
      shipTo.setFirstName(shippingAddress.firstName || 'Customer');
      shipTo.setLastName(shippingAddress.lastName || 'Name');
      shipTo.setAddress(shippingAddress.address || shippingAddress.street || '');
      shipTo.setCity(shippingAddress.city || '');
      shipTo.setState(shippingAddress.state || '');
      shipTo.setZip(shippingAddress.zip || '');
      shipTo.setCountry(shippingAddress.country || 'US');
    }

    const transactionRequest = new APIContracts.TransactionRequestType();
    transactionRequest.setTransactionType(APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
    transactionRequest.setPayment(paymentType);
    transactionRequest.setAmount(total.toFixed(2));
    transactionRequest.setBillTo(billTo);
    if (shipTo) transactionRequest.setShipTo(shipTo);    // Add line items for better reporting in Authorize.Net
    const lineItems = new APIContracts.ArrayOfLineItem();
    const lineItemList = []; // Create array to collect line items
    
    validatedItems.forEach((item, index) => {
      const lineItem = new APIContracts.LineItemType();
      lineItem.setItemId(item.product.toString().slice(-31)); // Max 31 chars
      lineItem.setName(item.name.slice(0, 31)); // Max 31 chars
      lineItem.setQuantity(item.quantity);
      lineItem.setUnitPrice(item.price.toFixed(2));
      lineItemList.push(lineItem); // Add to our array
    });
    
    // Set the line items array to the ArrayOfLineItem object
    lineItems.setLineItem(lineItemList);
    transactionRequest.setLineItems(lineItems);

    // Add order details for tracking (following official SDK pattern)
    const orderDetails = new APIContracts.OrderType();
    orderDetails.setInvoiceNumber(`ORDER-${Date.now()}`);
    orderDetails.setDescription(`Order for ${user.email}`);
    transactionRequest.setOrder(orderDetails);

    const createRequest = new APIContracts.CreateTransactionRequest();
    createRequest.setMerchantAuthentication(merchantAuthenticationType);
    createRequest.setTransactionRequest(transactionRequest);

    const ctrl = new APIControllers.CreateTransactionController(createRequest.getJSON());
    ctrl.setEnvironment(endpoint);

    console.log('Processing payment with Authorize.Net...');

    const paymentResult = await new Promise((resolve, reject) => {
      ctrl.execute(() => {
        const apiResponse = ctrl.getResponse();
        const response = new APIContracts.CreateTransactionResponse(apiResponse);
        
        console.log('Authorize.Net response result code:', response.getMessages().getResultCode());
        
        if (response.getMessages().getResultCode() === APIContracts.MessageTypeEnum.OK) {
          const transactionResponse = response.getTransactionResponse();
          
          if (transactionResponse.getMessages() && transactionResponse.getMessages().getMessage().length > 0) {
            console.log('Transaction successful:', transactionResponse.getTransId());
            resolve({
              transactionId: transactionResponse.getTransId(),
              success: true,
              message: transactionResponse.getMessages().getMessage()[0].getDescription(),
              authCode: transactionResponse.getAuthCode(),
              responseCode: transactionResponse.getResponseCode()
            });
          } else {
            console.log('Transaction failed with errors');
            const errors = transactionResponse.getErrors().getError();
            const error = errors[0];
            reject(new Error(`Transaction Error: ${error.getErrorCode()} - ${error.getErrorText()}`));
          }
        } else {
          console.log('API call failed');
          const error = response.getMessages().getMessage()[0];
          reject(new Error(`API Error: ${error.getCode()} - ${error.getText()}`));
        }
      });
    });    console.log('Payment processing completed successfully');    // Create order after successful payment
    const order = new Order({
      customer: user._id,
      customerType: 'user',
      items: validatedItems,
      subtotal: roundToTwo(subtotal),
      tax: roundToTwo(tax),
      total: roundToTwo(total),
      shippingAddress: orderType === 'delivery' ? shippingAddress : null,
      billingAddress: billingAddress,
      paymentInfo: {
        transactionId: paymentResult.transactionId,
        method: 'card',
        amount: roundToTwo(total)
      },
      orderType: orderType,
      tip: roundToTwo(tip),
      bagFee: roundToTwo(bagFee),
      deliveryFee: roundToTwo(deliveryFee),
      ageVerified: ageVerified,
      ageVerifiedAt: ageVerifiedAt,
      status: 'pending'
    });

    await order.save();

    // Update user's orders (ensure orders array exists)
    if (!user.orders) {
      user.orders = [];
    }    user.orders.push(order._id);
    await user.save();

    console.log('Order created successfully:', order._id);

    // If user wants to save card for future use, create customer profile
    if (saveCard) {
      try {
        const customerProfileId = await getOrCreateCustomerProfile(user);
        user.authorizeNetCustomerProfileId = customerProfileId;
        await user.save();
        console.log('Customer profile created/retrieved:', customerProfileId);
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

// Process payment with saved card - simplified version
exports.processPaymentWithSavedCard = async (req, res) => {
  try {
    // Helper function to round monetary values to 2 decimal places
    const roundToTwo = (num) => Math.round((num + Number.EPSILON) * 100) / 100;
    
    const {
      paymentMethodId,
      amount,
      cartItems,
      shippingAddress,
      billingAddress,
      orderType = 'delivery',
      tip = 0,
      bagFee = 0,
      deliveryFee = 0,
      ageVerified = false,
      ageVerifiedAt = null
    } = req.body;    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check for duplicate transactions (prevent double charging)
    const duplicateWindow = 30000; // 30 seconds
    const recentOrders = await Order.find({
      customer: user._id,
      total: amount,
      createdAt: { $gte: new Date(Date.now() - duplicateWindow) }
    });

    if (recentOrders.length > 0) {
      console.log('⚠️ Potential duplicate transaction detected in saved card payment');
      return res.status(400).json({
        success: false,
        message: 'Duplicate transaction detected. Please wait before trying again.'
      });
    }

    // Validate cart items and calculate totals (same as above)
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
        const itemTotal = roundToTwo((product.saleprice || product.price) * item.quantity);
      subtotal += itemTotal;
      
      validatedItems.push({
        product: product._id,
        name: product.name,
        price: roundToTwo(product.saleprice || product.price),
        quantity: item.quantity,
        image: product.productimg
      });    }

    subtotal = roundToTwo(subtotal);
    const tax = roundToTwo(subtotal * 0.08);
    const total = roundToTwo(subtotal + tax + roundToTwo(tip) + roundToTwo(bagFee) + roundToTwo(deliveryFee));

    if (Math.abs(total - amount) > 0.01) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount mismatch' 
      });    }

    // Process payment with saved card using Authorize.Net
    const { apiLoginId, transactionKey, endpoint } = getAuthorizeNetConfig();
    
    if (!apiLoginId || !transactionKey) {
      return res.status(500).json({
        success: false,
        message: 'Payment gateway configuration error'
      });
    }

    // Find the saved payment method
    const savedCard = user.billing.find(card => card.id === paymentMethodId);
    if (!savedCard) {
      return res.status(400).json({
        success: false,
        message: 'Saved payment method not found'
      });
    }

    if (!savedCard.customerProfileId || !savedCard.customerPaymentProfileId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid saved payment method - missing profile IDs'
      });
    }

    const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
    merchantAuthenticationType.setName(apiLoginId);
    merchantAuthenticationType.setTransactionKey(transactionKey);

    // Create payment profile for saved card
    const profileToCharge = new APIContracts.CustomerProfilePaymentType();
    profileToCharge.setCustomerProfileId(savedCard.customerProfileId);
    
    const paymentProfile = new APIContracts.PaymentProfile();
    paymentProfile.setPaymentProfileId(savedCard.customerPaymentProfileId);
    profileToCharge.setPaymentProfile(paymentProfile);

    // Set billing address
    const billTo = new APIContracts.CustomerAddressType();
    billTo.setFirstName(billingAddress.firstName || 'Customer');
    billTo.setLastName(billingAddress.lastName || 'Name');
    billTo.setAddress(billingAddress.address || billingAddress.street || '');
    billTo.setCity(billingAddress.city || '');
    billTo.setState(billingAddress.state || '');
    billTo.setZip(billingAddress.zip || '');
    billTo.setCountry(billingAddress.country || 'US');

    // Set shipping address if delivery
    let shipTo = null;
    if (orderType === 'delivery' && shippingAddress) {
      shipTo = new APIContracts.CustomerAddressType();
      shipTo.setFirstName(shippingAddress.firstName || 'Customer');
      shipTo.setLastName(shippingAddress.lastName || 'Name');
      shipTo.setAddress(shippingAddress.address || shippingAddress.street || '');
      shipTo.setCity(shippingAddress.city || '');
      shipTo.setState(shippingAddress.state || '');
      shipTo.setZip(shippingAddress.zip || '');
      shipTo.setCountry(shippingAddress.country || 'US');
    }    const transactionRequest = new APIContracts.TransactionRequestType();
    transactionRequest.setTransactionType(APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
    transactionRequest.setProfile(profileToCharge);
    transactionRequest.setAmount(total.toFixed(2));
    // Note: Don't set billing address when using saved payment profile - it's already in the profile
    if (shipTo) transactionRequest.setShipTo(shipTo);    // Add line items for better reporting in Authorize.Net
    const lineItems = new APIContracts.ArrayOfLineItem();
    const lineItemList = []; // Create array to collect line items
    
    validatedItems.forEach((item, index) => {
      const lineItem = new APIContracts.LineItemType();
      lineItem.setItemId(item.product.toString().slice(-31)); // Max 31 chars
      lineItem.setName(item.name.slice(0, 31)); // Max 31 chars
      lineItem.setQuantity(item.quantity);
      lineItem.setUnitPrice(item.price.toFixed(2));
      lineItemList.push(lineItem); // Add to our array
    });
      // Set the line items array to the ArrayOfLineItem object
    lineItems.setLineItem(lineItemList);
    transactionRequest.setLineItems(lineItems);

    // Add order details for tracking (following official SDK pattern)
    const orderDetails = new APIContracts.OrderType();
    orderDetails.setInvoiceNumber(`ORDER-${Date.now()}`);
    orderDetails.setDescription(`Saved card order for ${user.email}`);
    transactionRequest.setOrder(orderDetails);

    const createRequest = new APIContracts.CreateTransactionRequest();
    createRequest.setMerchantAuthentication(merchantAuthenticationType);
    createRequest.setTransactionRequest(transactionRequest);

    const ctrl = new APIControllers.CreateTransactionController(createRequest.getJSON());
    ctrl.setEnvironment(endpoint);

    console.log('Processing saved card payment with Authorize.Net...');

    const paymentResult = await new Promise((resolve, reject) => {
      ctrl.execute(() => {
        const apiResponse = ctrl.getResponse();
        const response = new APIContracts.CreateTransactionResponse(apiResponse);
        
        if (response.getMessages().getResultCode() === APIContracts.MessageTypeEnum.OK) {
          const transactionResponse = response.getTransactionResponse();
          
          if (transactionResponse.getMessages() && transactionResponse.getMessages().getMessage().length > 0) {
            resolve({
              transactionId: transactionResponse.getTransId(),
              success: true,
              message: transactionResponse.getMessages().getMessage()[0].getDescription(),
              authCode: transactionResponse.getAuthCode(),
              responseCode: transactionResponse.getResponseCode()
            });
          } else {
            const errors = transactionResponse.getErrors().getError();
            const error = errors[0];
            reject(new Error(`Transaction Error: ${error.getErrorCode()} - ${error.getErrorText()}`));
          }
        } else {
          const error = response.getMessages().getMessage()[0];
          reject(new Error(`API Error: ${error.getCode()} - ${error.getText()}`));
        }
      });    });    // Create order
    const order = new Order({
      customer: user._id,
      customerType: 'user',
      items: validatedItems,
      subtotal: roundToTwo(subtotal),
      tax: roundToTwo(tax),
      total: roundToTwo(total),
      shippingAddress: orderType === 'delivery' ? shippingAddress : null,
      billingAddress: billingAddress,
      paymentInfo: {
        transactionId: paymentResult.transactionId,
        method: 'saved_card',
        amount: roundToTwo(total)
      },
      orderType: orderType,
      tip: roundToTwo(tip),
      bagFee: roundToTwo(bagFee),
      deliveryFee: roundToTwo(deliveryFee),
      ageVerified: ageVerified,
      ageVerifiedAt: ageVerifiedAt,
      status: 'pending'
    });

    await order.save();

    // Update user's orders
    if (!user.orders) {
      user.orders = [];
    }
    user.orders.push(order._id);
    await user.save();

    // Retrieve and attach card details to user billing methods
    try {
      const cardDetails = await getCardDetailsFromAuthorizeNet(savedCard.customerProfileId, savedCard.customerPaymentProfileId);
      savedCard.cardType = cardDetails.cardType;
      savedCard.lastFour = cardDetails.lastFour;
      savedCard.expiryMonth = cardDetails.expiryMonth;
      savedCard.expiryYear = cardDetails.expiryYear;
      savedCard.cardholderName = cardDetails.cardholderName;
      await user.save();
    } catch (error) {
      console.error('Error retrieving card details:', error);
      // Continue without card details
    }

    res.json({
      success: true,
      order: order,
      payment: paymentResult,
      message: 'Payment processed successfully'
    });

  } catch (error) {
    console.error('Saved card payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Payment processing failed'
    });
  }
};

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

// Customer Profile Management
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

// Add Payment Method (Create Customer Payment Profile)
exports.addPaymentMethod = async (req, res) => {
  try {
    const { dataDescriptor, dataValue, billingAddress, setAsDefault = false } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check 3-card limit
    const currentCardCount = user.billing ? user.billing.length : 0;
    if (currentCardCount >= 3) {
      return res.status(400).json({
        success: false,
        message: 'Maximum of 3 saved cards allowed. Please delete a card first to add a new one.',
        cardCount: currentCardCount,
        maxCards: 3
      });
    }

    // Ensure customer profile exists
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

    // Create payment using opaqueData from Accept.js
    const opaqueData = new APIContracts.OpaqueDataType();
    opaqueData.setDataDescriptor(dataDescriptor);
    opaqueData.setDataValue(dataValue);

    const paymentType = new APIContracts.PaymentType();
    paymentType.setOpaqueData(opaqueData);

    // Set billing address
    const billTo = new APIContracts.CustomerAddressType();
    billTo.setFirstName(billingAddress.firstName || 'Customer');
    billTo.setLastName(billingAddress.lastName || 'Name');
    billTo.setAddress(billingAddress.address || '');
    billTo.setCity(billingAddress.city || '');
    billTo.setState(billingAddress.state || '');
    billTo.setZip(billingAddress.zip || '');
    billTo.setCountry(billingAddress.country || 'US');

    const customerPaymentProfileType = new APIContracts.CustomerPaymentProfileType();
    customerPaymentProfileType.setPayment(paymentType);
    customerPaymentProfileType.setBillTo(billTo);

    const createRequest = new APIContracts.CreateCustomerPaymentProfileRequest();
    createRequest.setMerchantAuthentication(merchantAuthenticationType);
    createRequest.setCustomerProfileId(customerProfileId);
    createRequest.setPaymentProfile(customerPaymentProfileType);

    const ctrl = new APIControllers.CreateCustomerPaymentProfileController(createRequest.getJSON());
    ctrl.setEnvironment(endpoint);    const paymentProfileResult = await new Promise((resolve, reject) => {
      ctrl.execute(() => {
        const apiResponse = ctrl.getResponse();
        const response = new APIContracts.CreateCustomerPaymentProfileResponse(apiResponse);
        
        if (response.getMessages().getResultCode() === APIContracts.MessageTypeEnum.OK) {
          resolve({
            customerPaymentProfileId: response.getCustomerPaymentProfileId(),
            success: true
          });
        } else {
          const error = response.getMessages().getMessage()[0];
          const errorCode = error.getCode();
          const errorText = error.getText();
          
          // Handle duplicate payment profile error
          if (errorCode === 'E00039') {
            reject(new Error(`This payment method is already saved to your account. Please use a different card or select from your existing payment methods.`));
          } else {
            reject(new Error(`Payment Profile Error: ${errorCode} - ${errorText}`));
          }
        }
      });    });

    // Retrieve actual card details from Authorize.Net
    const cardDetails = await getCardDetailsFromAuthorizeNet(
      customerProfileId, 
      paymentProfileResult.customerPaymentProfileId
    );

    // Add to user's billing methods with real card details
    const newBillingMethod = {
      id: `card_${Date.now()}`,
      customerProfileId: customerProfileId,
      customerPaymentProfileId: paymentProfileResult.customerPaymentProfileId,
      cardType: cardDetails.cardType,
      lastFour: cardDetails.lastFour,
      expiryMonth: cardDetails.expiryMonth,
      expiryYear: cardDetails.expiryYear,
      cardholderName: cardDetails.cardholderName,
      isDefault: setAsDefault || user.billing.length === 0,
      createdAt: new Date()
    };

    // If setting as default, unset other defaults
    if (newBillingMethod.isDefault) {
      user.billing.forEach(method => method.isDefault = false);
    }

    user.billing.push(newBillingMethod);
    await user.save();

    // Retrieve and attach card details to new billing method
    try {
      const cardDetails = await getCardDetailsFromAuthorizeNet(customerProfileId, paymentProfileResult.customerPaymentProfileId);
      newBillingMethod.cardType = cardDetails.cardType;
      newBillingMethod.lastFour = cardDetails.lastFour;
      newBillingMethod.expiryMonth = cardDetails.expiryMonth;
      newBillingMethod.expiryYear = cardDetails.expiryYear;
      newBillingMethod.cardholderName = cardDetails.cardholderName;
      await user.save();
    } catch (error) {
      console.error('Error retrieving card details:', error);
      // Continue without card details
    }

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

// Delete Payment Method
exports.deletePaymentMethod = async (req, res) => {
  try {
    const { paymentMethodId } = req.params;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const paymentMethodIndex = user.billing.findIndex(method => method.id === paymentMethodId);
    if (paymentMethodIndex === -1) {
      return res.status(404).json({ success: false, message: 'Payment method not found' });
    }

    const paymentMethod = user.billing[paymentMethodIndex];

    // Delete from Authorize.Net if it has profile IDs
    if (paymentMethod.customerProfileId && paymentMethod.customerPaymentProfileId) {
      try {
        const { apiLoginId, transactionKey, endpoint } = getAuthorizeNetConfig();
        const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
        merchantAuthenticationType.setName(apiLoginId);
        merchantAuthenticationType.setTransactionKey(transactionKey);

        const deleteRequest = new APIContracts.DeleteCustomerPaymentProfileRequest();
        deleteRequest.setMerchantAuthentication(merchantAuthenticationType);
        deleteRequest.setCustomerProfileId(paymentMethod.customerProfileId);
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
              // Log error but don't fail the deletion
              console.warn('Warning: Failed to delete payment profile from Authorize.Net:', response.getMessages().getMessage()[0].getText());
              resolve();
            }
          });
        });
      } catch (authorizeError) {
        console.warn('Warning: Error deleting from Authorize.Net:', authorizeError);
        // Continue with local deletion
      }
    }

    // Remove from user's billing methods
    user.billing.splice(paymentMethodIndex, 1);

    // If this was the default and there are other methods, set the first one as default
    if (paymentMethod.isDefault && user.billing.length > 0) {
      user.billing[0].isDefault = true;
    }

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

// Validate Payment Methods (check if they still exist in Authorize.Net)
exports.validatePaymentMethods = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.billing.length) {
      return res.json({
        success: true,
        validMethods: [],
        invalidMethods: [],
        message: 'No payment methods to validate'
      });
    }

    const { apiLoginId, transactionKey, endpoint } = getAuthorizeNetConfig();
    const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
    merchantAuthenticationType.setName(apiLoginId);
    merchantAuthenticationType.setTransactionKey(transactionKey);

    const validMethods = [];
    const invalidMethods = [];

    for (const method of user.billing) {
      if (!method.customerProfileId || !method.customerPaymentProfileId) {
        invalidMethods.push(method.id);
        continue;
      }

      try {
        const getRequest = new APIContracts.GetCustomerPaymentProfileRequest();
        getRequest.setMerchantAuthentication(merchantAuthenticationType);
        getRequest.setCustomerProfileId(method.customerProfileId);
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
        console.warn(`Error validating payment method ${method.id}:`, error);
        invalidMethods.push(method.id);
      }
    }

    // Remove invalid methods from user profile
    if (invalidMethods.length > 0) {
      user.billing = user.billing.filter(method => !invalidMethods.includes(method.id));
      await user.save();
    }

    res.json({
      success: true,
      validMethods,
      invalidMethods,
      message: `Validated ${user.billing.length} payment methods. Removed ${invalidMethods.length} invalid methods.`
    });

  } catch (error) {
    console.error('Error validating payment methods:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to validate payment methods'
    });
  }
};

// Get Payment History (from orders)
exports.getPaymentHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const orders = await Order.find({ customer: user._id })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('items.product', 'name productimg')
      .exec();

    const totalOrders = await Order.countDocuments({ customer: user._id });

    const paymentHistory = orders.map(order => ({
      orderId: order._id,
      transactionId: order.paymentInfo?.transactionId,
      amount: order.total,
      paymentMethod: order.paymentInfo?.method || 'unknown',
      status: order.status,
      date: order.createdAt,
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.product?.productimg
      })),
      refundInfo: order.refundInfo
    }));

    res.json({
      success: true,
      payments: paymentHistory,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        hasNext: page * limit < totalOrders,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch payment history'
    });
  }
};

exports.refundTransaction = async (req, res) => {
  try {
    const { transactionId, amount, reason } = req.body;
    
    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID is required'
      });
    }

    const { apiLoginId, transactionKey, endpoint } = getAuthorizeNetConfig();
    
    const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
    merchantAuthenticationType.setName(apiLoginId);
    merchantAuthenticationType.setTransactionKey(transactionKey);

    // Create credit card with last 4 digits (required for refund)
    const creditCard = new APIContracts.CreditCardType();
    creditCard.setCardNumber('XXXX'); // Only last 4 digits needed for refund
    creditCard.setExpirationDate('XXXX');

    const paymentType = new APIContracts.PaymentType();
    paymentType.setCreditCard(creditCard);

    const transactionRequest = new APIContracts.TransactionRequestType();
    transactionRequest.setTransactionType(APIContracts.TransactionTypeEnum.REFUNDTRANSACTION);
    transactionRequest.setRefTransId(transactionId);
    transactionRequest.setPayment(paymentType);
    
    if (amount) {
      transactionRequest.setAmount(parseFloat(amount).toFixed(2));
    }

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
          
          if (transactionResponse.getMessages() && transactionResponse.getMessages().getMessage().length > 0) {
            resolve({
              refundTransactionId: transactionResponse.getTransId(),
              originalTransactionId: transactionId,
              success: true,
              message: transactionResponse.getMessages().getMessage()[0].getDescription(),
              responseCode: transactionResponse.getResponseCode()
            });
          } else {
            const errors = transactionResponse.getErrors().getError();
            const error = errors[0];
            reject(new Error(`Refund Error: ${error.getErrorCode()} - ${error.getErrorText()}`));
          }
        } else {
          const error = response.getMessages().getMessage()[0];
          reject(new Error(`API Error: ${error.getCode()} - ${error.getText()}`));
        }
      });
    });

    // Update order status to refunded if needed
    try {
      const order = await Order.findOne({ 'paymentInfo.transactionId': transactionId });
      if (order) {
        order.status = 'refunded';
        order.refundInfo = {
          refundTransactionId: refundResult.refundTransactionId,
          refundAmount: amount || order.total,
          refundDate: new Date(),
          reason: reason || 'Customer request'
        };
        await order.save();
      }
    } catch (orderError) {
      console.error('Error updating order status:', orderError);
      // Don't fail the refund if order update fails
    }

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

// Sync Payment Methods with Authorize.Net (retrieve actual card details)
exports.syncPaymentMethods = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let updatedCount = 0;
    const updatedMethods = [];

    for (const method of user.billing) {
      if (method.customerProfileId && method.customerPaymentProfileId) {
        try {
          const cardDetails = await getCardDetailsFromAuthorizeNet(
            method.customerProfileId,
            method.customerPaymentProfileId
          );
          
          // Update the payment method with real card details
          method.cardType = cardDetails.cardType;
          method.lastFour = cardDetails.lastFour;
          method.expiryMonth = cardDetails.expiryMonth;
          method.expiryYear = cardDetails.expiryYear;
          method.cardholderName = cardDetails.cardholderName;
          
          updatedMethods.push(method);
          updatedCount++;
        } catch (error) {
          console.error(`Error syncing payment method ${method.id}:`, error);
          updatedMethods.push(method); // Keep original if sync fails
        }
      } else {
        updatedMethods.push(method); // Keep methods without Authorize.Net IDs
      }
    }

    user.billing = updatedMethods;
    await user.save();

    res.json({
      success: true,
      message: `Synced ${updatedCount} payment methods`,
      paymentMethods: user.billing
    });

  } catch (error) {
    console.error('Error syncing payment methods:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to sync payment methods'
    });
  }
};

// Export utility functions for use in other controllers
exports.getAuthorizeNetConfig = getAuthorizeNetConfig;

// Process Authorize.Net payment (for guest checkout)
exports.processAuthorizeNetPayment = async ({ apiLoginId, transactionKey, endpoint, dataDescriptor, dataValue, amount, billingAddress }) => {
  return new Promise((resolve, reject) => {
    try {
      const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
      merchantAuthenticationType.setName(apiLoginId);
      merchantAuthenticationType.setTransactionKey(transactionKey);

      const opaqueData = new APIContracts.OpaqueDataType();
      opaqueData.setDataDescriptor(dataDescriptor);
      opaqueData.setDataValue(dataValue);      const paymentType = new APIContracts.PaymentType();
      paymentType.setOpaqueData(opaqueData);

      const transactionRequest = new APIContracts.TransactionRequestType();
      transactionRequest.setTransactionType(APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
      transactionRequest.setPayment(paymentType);
      transactionRequest.setAmount(amount.toFixed(2));
      
      // Only set billing address if provided
      if (billingAddress) {
        const billTo = new APIContracts.CustomerAddressType();
        billTo.setFirstName(billingAddress.firstName);
        billTo.setLastName(billingAddress.lastName);
        billTo.setAddress(billingAddress.address);
        billTo.setCity(billingAddress.city);
        billTo.setState(billingAddress.state);
        billTo.setZip(billingAddress.zip);
        billTo.setCountry(billingAddress.country);
        transactionRequest.setBillTo(billTo);
      }

      const createRequest = new APIContracts.CreateTransactionRequest();
      createRequest.setMerchantAuthentication(merchantAuthenticationType);
      createRequest.setTransactionRequest(transactionRequest);

      const ctrl = new APIControllers.CreateTransactionController(createRequest.getJSON());
      ctrl.setEnvironment(endpoint);

      ctrl.execute(() => {
        const apiResponse = ctrl.getResponse();
        const response = new APIContracts.CreateTransactionResponse(apiResponse);
        
        if (response.getMessages().getResultCode() === APIContracts.MessageTypeEnum.OK) {
          const transactionResponse = response.getTransactionResponse();
          
          if (transactionResponse.getMessages() && transactionResponse.getMessages().getMessage().length > 0) {
            resolve({
              transactionId: transactionResponse.getTransId(),
              success: true,
              message: transactionResponse.getMessages().getMessage()[0].getDescription(),
              authCode: transactionResponse.getAuthCode(),
              responseCode: transactionResponse.getResponseCode()
            });
          } else {
            const errors = transactionResponse.getErrors().getError();
            const error = errors[0];
            reject(new Error(`Transaction Error: ${error.getErrorCode()} - ${error.getErrorText()}`));
          }
        } else {
          const errors = response.getMessages().getMessage();
          const error = errors[0];
          reject(new Error(`Payment Error: ${error.getCode()} - ${error.getText()}`));
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};
