# Browse-Only Mode Configuration

This document explains how to configure the browse-only mode for your e-commerce website.

## Overview

Browse-only mode allows visitors to explore your product catalog without the ability to:
- Add items to cart
- Add items to wishlist
- Create accounts or login
- Proceed to checkout

This is perfect for launching your website before you're ready to accept orders. The mode includes a beautiful UX with multiple touchpoints to encourage customers to call or visit your store.

## UX Features in Browse Mode

### 🎯 1. **Enhanced Top Banner**
- Eye-catching gradient design with animated elements
- Clear call-to-actions: "Call to Order" and "Visit Store"
- Shows store phone number and location
- Lists available features: Browse catalog, check hours, etc.
- Dismissible by users who prefer minimal UI
- Fully responsive (mobile & desktop)

### 🏠 2. **Homepage Hero Card**
- Large, prominent card explaining browse mode
- Animated shopping bag icon
- "Browse Products" CTA button
- Quick access to phone and directions
- Feature checklist showing what customers can do
- Professional gradient design matching your brand

### 🛍️ 3. **Product Cards**
Instead of "Add to Cart":
- Shows elegant "VIEW DETAILS" button in browse mode
- Purple/indigo gradient to differentiate from shopping mode
- Eye icon to indicate exploration, not purchasing
- Maintains visual hierarchy and appeal

### 📱 4. **Floating Action Button (FAB)**
- Appears after scrolling down
- Pulsing ring animation to grab attention
- Expands on hover to show "Call to Order Now"
- Always accessible without being intrusive
- Only shows when phone number is available

### 📄 5. **Product Detail Page**
Beautiful information card that:
- Explains online shopping is coming soon
- Provides direct "Call Us" and "Visit Store" buttons
- Shows store hours and current open/closed status
- Displays full address with map link
- Uses professional gradient design with glassmorphism
- No hidden functionality - everything is clear

### 🚫 6. **Protected Routes**
- Automatic redirect from Cart → Home
- Automatic redirect from Wishlist → Home
- Automatic redirect from Account → Home
- Automatic redirect from Checkout → Home
- No error messages, smooth UX

## How to Configure

All settings are controlled through a single configuration file:

**File:** `src/config/featureFlags.js`

### Enable Shopping Features (Go Live)

When you're ready to start accepting orders, simply change these flags to `true`:

```javascript
const FEATURE_FLAGS = {
  // Shopping Features
  ENABLE_SHOPPING: true,        // Master switch - enables all shopping features
  ENABLE_CART: true,            // Show cart and "Add to Cart" buttons
  ENABLE_WISHLIST: true,        // Show wishlist functionality
  ENABLE_CHECKOUT: true,        // Allow customers to checkout
  ENABLE_LOGIN: true,           // Show login/signup options
  ENABLE_ACCOUNT: true,         // Show account management
  
  // Browse Mode Banner
  SHOW_COMING_SOON_BANNER: false, // Hide the coming soon banner
  COMING_SOON_MESSAGE: "🎉 Online Shopping Coming Soon! Browse our products and get ready to order.",
  
  // Product Features
  SHOW_PRODUCT_DETAILS: true,
  SHOW_PRODUCT_PRICES: true,
  SHOW_PRODUCT_REVIEWS: true,
};
```

### Keep Browse-Only Mode (Current)

To keep the website in browse-only mode (current setting):

```javascript
const FEATURE_FLAGS = {
  // Shopping Features
  ENABLE_SHOPPING: false,       // Disables all shopping features
  ENABLE_CART: false,
  ENABLE_WISHLIST: false,
  ENABLE_CHECKOUT: false,
  ENABLE_LOGIN: false,
  ENABLE_ACCOUNT: false,
  
  // Browse Mode Banner
  SHOW_COMING_SOON_BANNER: true,  // Shows the coming soon banner
  COMING_SOON_MESSAGE: "🎉 Online Shopping Coming Soon! Browse our products and get ready to order.",
  
  // Product Features (can remain enabled in browse mode)
  SHOW_PRODUCT_DETAILS: true,
  SHOW_PRODUCT_PRICES: true,
  SHOW_PRODUCT_REVIEWS: true,
};
```

## What Changes in Browse-Only Mode

### Navigation Bar
- ❌ Cart icon hidden (desktop & mobile)
- ❌ Wishlist icon hidden (desktop & mobile)
- ❌ Login/Account icon hidden (desktop & mobile)
- ✅ Search bar remains visible
- ✅ Category navigation remains visible

### Product Cards
- ❌ "Add to Cart" button hidden
- ❌ Wishlist heart icon hidden
- ✅ Product images visible
- ✅ Product prices visible
- ✅ Product details accessible (click to view)

### Bottom Navigation (Mobile App)
- ❌ Cart tab hidden
- ❌ Wishlist tab hidden
- ❌ Account tab hidden
- ✅ Home tab visible
- ✅ Shop tab visible

### Coming Soon Banner
- ✅ Prominent banner at top of page
- ✅ Animated to grab attention
- ✅ Clear message about upcoming shopping features

## Customizing the Banner Message

You can customize the coming soon banner message:

```javascript
COMING_SOON_MESSAGE: "Your custom message here! 🚀"
```

Examples:
- `"🎉 Online Shopping Launches Next Week! Browse our exclusive collection now."`
- `"🛍️ Get Ready to Shop! Online ordering coming soon to [Your Store Name]."`
- `"📱 Download our app and be first to know when online shopping goes live!"`

## Testing Before Going Live

Before enabling shopping features:

1. ✅ Verify all product images are uploaded
2. ✅ Check product prices are correct
3. ✅ Test payment gateway integration
4. ✅ Verify delivery zones and fees
5. ✅ Set up order notification system
6. ✅ Train staff on order management

## Quick Switch Process

### Going from Browse-Only to Live:

1. Open `src/config/featureFlags.js`
2. Change `ENABLE_SHOPPING: false` to `ENABLE_SHOPPING: true`
3. Change `SHOW_COMING_SOON_BANNER: true` to `SHOW_COMING_SOON_BANNER: false`
4. Save the file
5. Rebuild and redeploy your application

### Temporary Maintenance Mode:

If you need to temporarily disable shopping (maintenance, inventory update, etc.):

1. Set `ENABLE_SHOPPING: false`
2. Set `SHOW_COMING_SOON_BANNER: true`
3. Update message: `COMING_SOON_MESSAGE: "⚙️ We're updating our inventory. Shopping will resume shortly!"`

## Files Modified

The following components respect the feature flags:

- `src/components/Navbar.jsx` - Hides cart/wishlist/account icons
- `src/components/ProductCard.jsx` - Hides add to cart/wishlist buttons
- `src/components/BottomNavigation.jsx` - Hides cart/wishlist/account tabs
- `src/components/ComingSoonBanner.jsx` - Shows/hides banner
- `src/App.jsx` - Includes the banner component

## Need Help?

If you need assistance enabling features or have questions:

1. Check this README file
2. Review the `featureFlags.js` file comments
3. Contact your development team

---

**Last Updated:** November 6, 2025
