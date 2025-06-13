const User = require('../models/User');
const { APIContracts, APIControllers, Constants } = require('authorizenet');

// Utility: Get Authorize.Net credentials and endpoint for current environment
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

// Delete payment profile from Authorize.Net
async function deleteCustomerPaymentProfile(customerProfileId, customerPaymentProfileId) {
  const { apiLoginId, transactionKey, endpoint } = getAuthorizeNetConfig();
  const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
  merchantAuthenticationType.setName(apiLoginId);
  merchantAuthenticationType.setTransactionKey(transactionKey);

  const deleteRequest = new APIContracts.DeleteCustomerPaymentProfileRequest();
  deleteRequest.setMerchantAuthentication(merchantAuthenticationType);
  deleteRequest.setCustomerProfileId(customerProfileId);
  deleteRequest.setCustomerPaymentProfileId(customerPaymentProfileId);

  const ctrl = new APIControllers.DeleteCustomerPaymentProfileController(deleteRequest.getJSON());
  ctrl.setEnvironment(endpoint);
  
  return new Promise((resolve, reject) => {
    ctrl.execute(() => {
      const apiResponse = ctrl.getResponse();
      const response = new APIContracts.DeleteCustomerPaymentProfileResponse(apiResponse);
      if (response.getMessages().getResultCode() === APIContracts.MessageTypeEnum.OK) {
        console.log('✅ Payment profile deleted from Authorize.Net:', customerPaymentProfileId);
        resolve(true);
      } else {
        console.log('❌ Failed to delete payment profile:', response.getMessages().getMessage()[0].getText());
        reject(new Error(response.getMessages().getMessage()[0].getText()));
      }
    });
  });
}

// Get user profile (by ID)
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user details (name, phone, dob, etc.)
const updateUserDetails = async (req, res) => {
  try {
    const updates = {};
    const allowedFields = ['name', 'phone', 'dob', 'email'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete user account
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// --- ADDRESS MANAGEMENT ---

// Add address
const addAddress = async (req, res) => {
  try {
    console.log('req.user:', req.user);
    console.log('req.body:', req.body);
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const address = req.body;
    // Validate required fields
    const required = ['label', 'street', 'city', 'state', 'zip', 'country'];
    for (const field of required) {
      if (!address[field]) {
        return res.status(400).json({ message: `Missing field: ${field}` });
      }
    }
    address.id = Date.now().toString();
    if (address.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }
    user.addresses.push(address);
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (error) {
    console.error('Add address error:', error); // <--- Add this
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update address
const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user.id);
    const idx = user.addresses.findIndex(addr => addr.id === addressId);
    if (idx === -1) return res.status(404).json({ message: 'Address not found' });
    if (req.body.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }
    user.addresses[idx] = { ...user.addresses[idx], ...req.body, id: addressId };
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete address
const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user.id);
    user.addresses = user.addresses.filter(addr => addr.id !== addressId);
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// --- BILLING/PAYMENT METHODS MANAGEMENT ---

// Add billing method (save card)
const addBillingMethod = async (req, res) => {
  try {
    const { dataDescriptor, dataValue, billingAddress, isDefault = false } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

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

    res.json({ success: true, billing: user.billing });
  } catch (error) {
    console.error('Error adding billing method:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update billing method
const updateBillingMethod = async (req, res) => {
  try {
    const { billingId } = req.params;
    const { isDefault } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const billingIndex = user.billing.findIndex(b => b.id === billingId);
    if (billingIndex === -1) return res.status(404).json({ message: 'Billing method not found' });

    if (isDefault !== undefined) {
      if (isDefault) {
        user.billing.forEach(b => b.isDefault = false);
      }
      user.billing[billingIndex].isDefault = isDefault;
    }

    await user.save();
    res.json({ success: true, billing: user.billing });
  } catch (error) {
    console.error('Error updating billing method:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete billing method
const deleteBillingMethod = async (req, res) => {
  try {
    const { billingId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const billingMethod = user.billing.find(method => method.id === billingId);
    if (!billingMethod) {
      return res.status(404).json({ message: 'Billing method not found' });
    }

    // Delete from Authorize.Net
    if (billingMethod.customerPaymentProfileId && user.authorizeNetCustomerProfileId) {
      try {
        await deleteCustomerPaymentProfile(user.authorizeNetCustomerProfileId, billingMethod.customerPaymentProfileId);
      } catch (error) {
        console.error('Failed to delete from Authorize.Net:', error);
        // Continue with local deletion even if Authorize.Net deletion fails
      }
    }

    // Remove from user's billing methods
    user.billing = user.billing.filter(method => method.id !== billingId);
    await user.save();

    res.json({ success: true, billing: user.billing });
  } catch (error) {
    console.error('Error deleting billing method:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserDetails,
  deleteUser,
  addAddress,
  updateAddress,
  deleteAddress,
  addBillingMethod,
  updateBillingMethod,
  deleteBillingMethod,
};