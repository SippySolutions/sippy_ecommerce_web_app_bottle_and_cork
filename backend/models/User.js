const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema(
  {
    id:        { type: String, required: true }, // unique per address (can use uuid or Date.now())
    label:     { type: String, required: true }, // e.g. Home, Work
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
    // For legacy/fake token support (optional, can be removed in prod)
    token:          { type: String }, // Token from payment gateway (opaqueData, legacy)
    cardType:       { type: String, required: true },
    lastFour:       { type: String, required: true },
    expiryMonth:    { type: String, required: true },
    expiryYear:     { type: String, required: true },
    cardholderName: { type: String, required: true },
    isDefault:      { type: Boolean, default: false },
    // Authorize.Net profile IDs for real saved card support
    customerProfileId: { type: String },
    customerPaymentProfileId: { type: String },
    id: { type: String, required: true }, // Unique per billing method
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
    addresses: [addressSchema], // <-- Added for delivery support
    orders:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    billing:   [billingSchema],
    authorizeNetCustomerProfileId: { type: String }, // For Authorize.Net saved cards
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

module.exports = mongoose.model('User', userSchema);