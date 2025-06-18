const Guest = require('../models/Guest');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { processAuthorizeNetPayment, getAuthorizeNetConfig } = require('./checkoutController');

// Helper function to round monetary values to 2 decimal places
const roundToTwo = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

// Process guest checkout with new payment method
exports.processGuestPayment = async (req, res) => {
  try {
    console.log('=== GUEST CHECKOUT PROCESS START ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
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
      deliveryFee = 0,
      ageVerified = false,
      ageVerifiedAt = null,
      guestInfo // { email, phone }
    } = req.body;

    console.log('Extracted data:');
    console.log('- dataDescriptor:', dataDescriptor);
    console.log('- dataValue:', dataValue ? dataValue.substring(0, 50) + '...' : 'undefined');
    console.log('- amount:', amount);
    console.log('- cartItems:', cartItems);
    console.log('- orderType:', orderType);
    console.log('- guestInfo:', guestInfo);

    // Validate required fields
    if (!dataDescriptor || !dataValue) {
      console.log('❌ Missing payment token data');
      return res.status(400).json({ 
        success: false, 
        message: 'Missing payment token data' 
      });
    }    if (!guestInfo || !guestInfo.email || !guestInfo.phone) {
      return res.status(400).json({
        success: false,
        message: 'Email and phone number are required for guest checkout'
      });
    }

    // Check for duplicate guest transactions (prevent double charging)
    const duplicateWindow = 30000; // 30 seconds
    const recentGuestOrders = await Order.find({
      'guestInfo.email': guestInfo.email,
      total: amount,
      createdAt: { $gte: new Date(Date.now() - duplicateWindow) }
    });

    if (recentGuestOrders.length > 0) {
      console.log('⚠️ Potential duplicate guest transaction detected');
      return res.status(400).json({
        success: false,
        message: 'Duplicate transaction detected. Please wait before trying again.'
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

    // Validate cart items and calculate totals
    const productIds = cartItems.map(item => item.product || item._id);
    console.log('Product IDs to validate:', productIds);
    
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
          image: product.productimg
        });
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
      });
    }

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

    console.log('Processing payment with Authorize.Net...');
    let paymentResult;
    
    try {
      paymentResult = await processAuthorizeNetPayment({
        apiLoginId,
        transactionKey,
        endpoint,
        dataDescriptor,
        dataValue,
        amount: total,
        billingAddress
      });

      console.log('Payment result:', paymentResult);

      if (!paymentResult.success) {
        return res.status(400).json({
          success: false,
          message: paymentResult.message || 'Payment failed'
        });
      }
    } catch (paymentError) {
      console.error('Payment processing error:', paymentError);
      return res.status(500).json({
        success: false,
        message: 'Payment processing failed'
      });
    }

    console.log('Payment processing completed successfully');

    // Find or create guest record
    let guest = await Guest.findOne({ email: guestInfo.email });
    if (!guest) {
      guest = new Guest({
        email: guestInfo.email,
        phone: guestInfo.phone
      });
      await guest.save();
      console.log('Created new guest record:', guest._id);
    } else {
      // Update phone if different
      if (guest.phone !== guestInfo.phone) {
        guest.phone = guestInfo.phone;
        await guest.save();
      }
      console.log('Using existing guest record:', guest._id);
    }

    // Create order
    const order = new Order({
      customer: null,
      guest: guest._id,
      customerType: 'guest',
      guestInfo: {
        email: guestInfo.email,
        phone: guestInfo.phone
      },
      items: validatedItems,
      subtotal: roundToTwo(subtotal),
      tax: roundToTwo(tax),      total: roundToTwo(total),
      shippingAddress: (orderType === 'delivery' || orderType === 'scheduled') ? shippingAddress : null,
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

    // Update guest's orders
    if (!guest.orders) {
      guest.orders = [];
    }
    guest.orders.push(order._id);
    await guest.save();

    console.log('Guest order created successfully:', order._id);

    res.json({
      success: true,
      message: 'Order placed successfully',
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status
      }
    });

  } catch (error) {
    console.error('❌ Guest checkout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during checkout'
    });
  }
};
