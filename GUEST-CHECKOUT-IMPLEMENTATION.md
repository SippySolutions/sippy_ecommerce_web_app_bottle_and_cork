# Guest Checkout Implementation

## Overview
This implementation enables guest checkout functionality, allowing users to place orders without creating an account. Only an email address and phone number are required for guest checkout.

## Backend Changes

### 1. Guest Model (`models/Guest.js`)
- Stores guest information (email, phone)
- Links to orders placed by the guest
- Automatically created when guest places first order

### 2. Guest Controller (`controllers/guestController.js`)
- `processGuestPayment`: Handles guest checkout process
- Validates email and phone number
- Creates guest record if doesn't exist
- Processes payment through Authorize.Net
- Creates order linked to guest

### 3. Guest Routes (`routes/guestRoutes.js`)
- `POST /api/guest/checkout`: Process guest checkout

### 4. Server Configuration (`server.js`)
- Added guest routes to the server
- Route: `/api/guest/*`

## Frontend Changes

### 1. API Service (`services/api.jsx`)
- Added `processGuestCheckout` function
- Calls `/api/guest/checkout` endpoint
- Handles guest-specific error messages

### 2. Checkout Component (`pages/Checkout.jsx`)
- Removed authentication requirement
- Added guest information form (email, phone)
- Modified payment submission to handle both authenticated and guest users
- Added validation for guest information
- Shows account creation encouragement for guests
- Hides saved card options for guests
- Redirects guests to home page after successful order

### 3. Order Model Updates (`models/Order.js`)
- Added support for guest orders
- Fields: `guest`, `customerType`, `guestInfo`
- Can be linked to either a user or guest

## Features

### Guest Checkout Flow
1. **Cart to Checkout**: No authentication required
2. **Contact Information**: Email and phone number required
3. **Address Information**: Same as authenticated users
4. **Payment**: Credit card only (no saved cards)
5. **Order Confirmation**: Success message and redirect to home

### Validation
- Email format validation
- Phone number required
- All address fields validated
- Age verification still enforced

### Security & Privacy
- Guest information stored securely
- Payment processed through Authorize.Net
- No sensitive data stored unnecessarily
- Guest orders include age verification status

## Usage Instructions

### For Guests
1. Add items to cart
2. Go to checkout (no login required)
3. Fill in email and phone number
4. Complete address and payment information
5. Submit order

### For Developers
```javascript
// Guest checkout API call
const guestOrderData = {
  dataDescriptor: tokenData.dataDescriptor,
  dataValue: tokenData.dataValue,
  amount: total,
  cartItems: [...],
  shippingAddress: {...},
  billingAddress: {...},
  orderType: 'delivery',
  tip: 0,
  bagFee: 0.5,
  deliveryFee: 5,
  ageVerified: true,
  ageVerifiedAt: new Date(),
  guestInfo: {
    email: 'guest@example.com',
    phone: '555-123-4567'
  }
};

const response = await processGuestCheckout(guestOrderData);
```

## Testing

### Test Cases
1. **Happy Path**: Guest places order successfully
2. **Validation**: Missing email/phone shows error
3. **Payment**: Integration with Authorize.Net works
4. **Age Verification**: Still enforced for guests
5. **Order Storage**: Guest order saved correctly

### Manual Testing
1. Clear localStorage (logout)
2. Add items to cart
3. Go to `/checkout`
4. Fill in guest info and complete checkout
5. Verify order confirmation
6. Check backend logs for order creation

## Database Schema

### Guest Collection
```javascript
{
  _id: ObjectId,
  email: String (required),
  phone: String (required),
  orders: [ObjectId] (references Order),
  createdAt: Date,
  updatedAt: Date
}
```

### Order Collection Updates
```javascript
{
  // ... existing fields
  customer: ObjectId (references User, optional),
  guest: ObjectId (references Guest, optional),
  customerType: String ('user' | 'guest'),
  guestInfo: {
    email: String,
    phone: String
  }
}
```

## Future Enhancements

1. **Guest Order Tracking**: Allow guests to look up orders by email
2. **Account Conversion**: Offer to convert guest checkout to account
3. **Guest Wishlist**: Temporary wishlist for guests (session-based)
4. **Email Marketing**: Option to subscribe to newsletter during checkout
5. **Order History**: Limited order history for guests via email lookup

## Security Considerations

- Guest data is stored securely with same encryption as user data
- No passwords stored for guests
- Guest orders include all necessary audit trails
- Age verification is enforced regardless of authentication status
- Payment processing follows same security standards as authenticated users
