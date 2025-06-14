const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guest: { type: mongoose.Schema.Types.ObjectId, ref: 'Guest' },
  customerType: { type: String, enum: ['user', 'guest'], required: true },
  guestInfo: {
    email: String,
    phone: String
  },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
  shippingAddress: {
    firstName: String,
    lastName: String,
    address: String,
    city: String,
    state: String,
    zip: String,
    country: String
  },
  billingAddress: {
    firstName: String,
    lastName: String,
    address: String,
    city: String,
    state: String,
    zip: String,
    country: String
  },  paymentInfo: {
    transactionId: { type: String, required: true },
    method: { type: String, required: true }, // 'card', 'saved_card', 'tokenized'
    lastFour: String,
    cardType: String,
    amount: { type: Number, required: true }
  },  orderNumber: { type: String, unique: true },
  orderType: { type: String, enum: ['pickup', 'delivery'], default: 'delivery' },
  tip: { type: Number, default: 0 },
  bagFee: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 0 },
  ageVerified: { type: Boolean, default: false },
  ageVerifiedAt: { type: Date }
}, { timestamps: true });

// Generate order number before validation
orderSchema.pre('validate', function(next) {
  if (this.isNew && !this.orderNumber) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
