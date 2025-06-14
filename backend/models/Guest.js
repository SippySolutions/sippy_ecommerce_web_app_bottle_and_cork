const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema(
  {
    email: { 
      type: String, 
      required: [true, 'Email is required'],
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
    },
    phone: { 
      type: String, 
      required: [true, 'Phone number is required']
    },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Guest', guestSchema);
