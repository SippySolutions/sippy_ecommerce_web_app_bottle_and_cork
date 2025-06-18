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
  total: { type: Number, required: true },  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'shipped', 'delivered', 'cancelled'], 
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
    transactionId: String, // Made optional for authorization workflow
    method: String, // 'card', 'saved_card', 'tokenized'
    lastFour: String,
    cardType: String,
    amount: Number
  },
  // Authorization workflow fields
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'authorized', 'partially_captured', 'paid', 'voided', 'refunded'], 
    default: 'pending' 
  },
  transactionId: String, // Main transaction ID for authorization
  authorizationCode: String, // Auth code from payment processor
  captureTransactionId: String, // Transaction ID for capture
  capturedAmount: Number, // Amount actually captured (for partial captures)
  capturedAt: Date, // When payment was captured
  voidedAt: Date, // When authorization was voided
  customerProfileId: String, // Authorize.Net customer profile ID  customerPaymentProfileId: String, // Authorize.Net payment profile ID

  orderNumber: { type: String, unique: true },
  orderType: { type: String, enum: ['pickup', 'delivery', 'scheduled'], default: 'delivery' },
  
  // Scheduled delivery fields
  scheduledDelivery: {
    date: { type: Date }, // Scheduled delivery date
    timeSlot: { type: String }, // e.g., "10:00 AM - 12:00 PM"
    instructions: { type: String }, // Special delivery instructions
    isScheduled: { type: Boolean, default: false }
  },
  
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
