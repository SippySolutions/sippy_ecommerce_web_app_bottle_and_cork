// Helper function to get models for specific database connection
const getModels = (connection) => {
  try {
    const User = connection.model('User');
    return { User };
  } catch (error) {
    console.error('Error getting models:', error);
    throw error;
  }
};

// --- USER PROFILE MANAGEMENT ---

// Get user profile (by ID)
const getUserProfile = async (req, res) => {
  try {
    const { User } = getModels(req.dbConnection);
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
    const { User } = getModels(req.dbConnection);
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
    const { User } = getModels(req.dbConnection);
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
    const { User } = getModels(req.dbConnection);
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
    const { User } = getModels(req.dbConnection);
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
    const { User } = getModels(req.dbConnection);
    const { addressId } = req.params;
    const user = await User.findById(req.user.id);
    user.addresses = user.addresses.filter(addr => addr.id !== addressId);
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// --- LEGACY BILLING METHODS REMOVED ---
// All billing/payment methods now handled through checkoutController.js

module.exports = {
  getUserProfile,
  updateUserDetails,
  deleteUser,
  addAddress,
  updateAddress,
  deleteAddress,
};
