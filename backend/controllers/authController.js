const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { getDbConnection } = require('../config/db');

// User schema definition (extracted from User model)
const addressSchema = new mongoose.Schema(
  {
    id:        { type: String, required: true },
    label:     { type: String, required: true },
    street:    { type: String, required: true },
    city:      { type: String, required: true },
    state:     { type: String, required: true },
    zip:       { type: String, required: true },
    country:   { type: String, required: true },
    isDefault: { type: Boolean, default: false }
  },
  { _id: false }
);

const billingAddressSchema = new mongoose.Schema(
  {
    street:  { type: String, required: true },
    city:    { type: String, required: true },
    state:   { type: String, required: true },
    zip:     { type: String, required: true },
    country: { type: String, required: true }
  },
  { _id: false }
);

const billingSchema = new mongoose.Schema(
  {
    token:          { type: String },
    cardType:       { type: String, required: true },
    lastFour:       { type: String, required: true },
    expiryMonth:    { type: String, required: true },
    expiryYear:     { type: String, required: true },
    cardholderName: { type: String, required: true },
    isDefault:      { type: Boolean, default: false },
    customerProfileId: { type: String },
    customerPaymentProfileId: { type: String },
    id: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name:      { type: String, required: [true, 'Name is required'] },
    email:     { type: String, required: [true, 'Email is required'], unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address'] },
    password:  { type: String, required: [true, 'Password is required'], minlength: [6, 'Password must be at least 6 characters long'] },
    phone:     { type: String },
    dob:       { type: Date },
    addresses: [addressSchema],
    orders:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    billing:   [billingSchema],
    wishlist:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    authorizeNetCustomerProfileId: { type: String },
  },
  { timestamps: true }
);

// Hash the password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Helper function to get User model for specific database
const getUserModel = async (dbName) => {
  const connection = await getDbConnection(dbName);
  
  // Check if model already exists on this connection
  if (connection.models.User) {
    return connection.models.User;
  }
  
  // Create and return the User model for this connection
  return connection.model('User', userSchema);
};

// Register a new user
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  
  // Get database name from header
  const dbName = req.headers['x-store-db'];
  if (!dbName) {
    return res.status(400).json({ message: 'Database name is required' });
  }

  try {
    const User = await getUserModel(dbName);
    
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Create a new user
    const user = await User.create({ name, email, password });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Register user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login a user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  // Get database name from header
  const dbName = req.headers['x-store-db'];
  if (!dbName) {
    return res.status(400).json({ message: 'Database name is required' });
  }
  
  try {
    const User = await getUserModel(dbName);
    
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Invalid email or password' });
    }

    // Check if the password matches
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d', // Token expires in 1 day
    });

    // Send the response with the token and all user details (except password)
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        dob: user.dob,
        addresses: user.addresses,
        orders: user.orders,
        billing: user.billing,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        __v: user.__v
      },
    });
  } catch (error) {
    console.error('Login user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { registerUser, loginUser };