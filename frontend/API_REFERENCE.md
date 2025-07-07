# Complete API Reference - Frontend API Calls & URLs

## Base Configuration
- **Environment Variable**: `VITE_API_BASE_URL`
- **Production URL**: `https://sippy-ecommerce-web-app.onrender.com`
- **Development Fallback**: `http://localhost:5001`
- **API Endpoint**: `${VITE_API_BASE_URL}/api`

## Authentication & Authorization
- **Headers**: `Authorization: Bearer ${token}` (from localStorage)
- **Token Management**: Automatic token injection via axios interceptors

---

## API Endpoints Summary

### 1. **CMS & Content Management**
```
GET /api/cms-data
```
- **Purpose**: Fetch CMS configuration data (hero section, store info, etc.)
- **Used In**: 
  - `main.jsx` (server health check)
  - `CMSContext.jsx` (context provider)
  - `api.jsx` (fetchCMSData, fetchCMSDataV2)
- **Authentication**: None required
- **Response**: Store configuration, hero banners, hours, tax rates, etc.

### 2. **Products & Catalog**
```
GET /api/products
GET /api/products/:id
GET /api/featured-products/:type
GET /api/departments
GET /api/similar?department=X&category=Y&subcategory=Z&priceRange=N
GET /api/products/search?q=query&page=1&limit=20
GET /api/products/search/suggestions?q=query&type=all
```
- **Purpose**: Product catalog, search, and discovery
- **Used In**: 
  - `api.jsx` (fetchProducts, fetchProductById, fetchfeturedProducts, fetchDepartments, fetchSimilarProducts, searchProducts, getSearchSuggestions)
  - `Categories.jsx` (fetchDepartments)
  - `SingleProduct.jsx` (fetchProductById)
  - `Navbar.jsx` (fetchDepartments)
- **Authentication**: None required
- **Featured Product Types**: `bestseller`, `exclusive`, `staffpick`

### 3. **Authentication & User Management**
```
POST /api/auth/register
POST /api/auth/login
GET /api/users/me
PUT /api/users/me
DELETE /api/users/me
```
- **Purpose**: User authentication and profile management
- **Used In**: `api.jsx` (registerUser, loginUser, fetchUserProfile, updateUserProfile, deleteUserProfile)
- **Authentication**: Bearer token required (except register/login)

### 4. **User Addresses**
```
POST /api/users/me/addresses
PUT /api/users/me/addresses/:addressId
DELETE /api/users/me/addresses/:addressId
```
- **Purpose**: Manage user shipping addresses
- **Used In**: `api.jsx` (addAddress, updateAddress, deleteAddress)
- **Authentication**: Bearer token required

### 5. **Checkout & Payment Processing**
```
POST /api/checkout/process
POST /api/checkout/process-saved-card
POST /api/checkout/authorize
POST /api/guest/checkout
```
- **Purpose**: Process payments and create orders
- **Used In**: 
  - `api.jsx` (processCheckout, processSavedCardCheckout, processGuestCheckout)
  - `Checkout.jsx` (direct fetch to /checkout/authorize)
  - `paymentService.js` (PaymentService class)
- **Authentication**: Bearer token required (except guest checkout)
- **Payment Flow**: Authorization-only, capture handled by admin system

### 6. **Payment Methods Management**
```
POST /api/checkout/add-payment-method
DELETE /api/checkout/payment-method/:paymentMethodId
POST /api/checkout/validate-payment-methods
POST /api/checkout/sync-payment-methods
GET /api/checkout/payment-history?page=1&limit=10
```
- **Purpose**: Manage saved payment methods
- **Used In**: `api.jsx` (addPaymentMethod, deletePaymentMethod, validatePaymentMethods, syncPaymentMethods, getPaymentHistory)
- **Authentication**: Bearer token required

### 7. **Order Management**
```
GET /api/orders/me
GET /api/orders/:orderId
```
- **Purpose**: Retrieve user orders and order details
- **Used In**: `api.jsx` (fetchUserOrders, fetchOrderById)
- **Authentication**: Bearer token required

### 8. **Wishlist Management**
```
GET /api/wishlist
POST /api/wishlist
DELETE /api/wishlist/:productId
DELETE /api/wishlist
GET /api/wishlist/check/:productId
```
- **Purpose**: Manage user wishlist
- **Used In**: `api.jsx` (getWishlist, addToWishlist, removeFromWishlist, clearWishlist, isInWishlist)
- **Authentication**: Bearer token required

### 9. **Product Groups**
```
GET /api/product-groups
GET /api/product-groups/:id
GET /api/product-groups/:id/products?page=1&limit=20&sort=createdAt&order=desc
```
- **Purpose**: Organized product collections
- **Used In**: `api.jsx` (fetchProductGroups, fetchProductGroupById, fetchProductsByGroupId)
- **Authentication**: None required

### 10. **App Version & Updates**
```
GET /api/app-version
```
- **Purpose**: Check for app updates (mobile only)
- **Used In**: 
  - `useAppUpdate.js` (checkForUpdates)
  - `AppUpdateManager.js` (version checking)
- **Authentication**: None required
- **Response**: Latest version, min required version, update message, features

### 11. **Health & Debugging**
```
GET /api/health/payment-config
GET /api/health/user-billing
```
- **Purpose**: System health checks and debugging
- **Used In**: Backend health monitoring
- **Authentication**: Bearer token required for user-billing

### 12. **CSS Proxy (Development)**
```
GET /api/proxy-css
```
- **Purpose**: CSS injection for theme preview
- **Used In**: `cssInjector.js` (loadFromProxy)
- **Authentication**: None required

---

## API Client Configuration

### Standard API Client (`api.jsx`)
```javascript
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}/api`;

// Axios instance with automatic auth headers
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});
```

### Mobile API Client (`mobileApi.js`)
```javascript
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'https://sippy-ecommerce-web-app.onrender.com'}/api`;

// Enhanced for mobile with retry logic and Render.com cold start handling
const mobileApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'UniversalLiquors-Mobile/1.0.0'
  }
});
```

### Payment Service (`paymentService.js`)
```javascript
export class PaymentService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}/api`,
      timeout: 30000,
    });
  }
}
```

---

## Error Handling Patterns

### Standard Error Handling
```javascript
// Consistent error object creation
const errorObj = new Error(errorMessage);
errorObj.status = error.response?.status;
errorObj.data = error.response?.data;
throw errorObj;
```

### Authentication Error Handling
```javascript
// 401 handling in axios interceptor
if (error.response?.status === 401) {
  // Only clear token if not on login/account pages
  const currentUrl = window.location.pathname;
  if (currentUrl !== '/account' && currentUrl !== '/login') {
    console.warn('Authentication error detected');
  }
}
```

### Mobile-Specific Error Handling
```javascript
// Render.com cold start detection
if (error.code === 'ECONNABORTED' || error.response?.status >= 500) {
  console.log('🔄 API warming up (Render.com cold start detected)...');
  // Automatic retry logic
}
```

---

## Environment Variables Used

### API Configuration
- `VITE_API_BASE_URL`: Base server URL (without /api suffix)
- `VITE_API_TIMEOUT`: Request timeout (default: 15000ms)
- `VITE_API_RETRY_ATTEMPTS`: Retry attempts (default: 3)
- `VITE_API_RETRY_DELAY`: Retry delay (default: 2000ms)

### Payment Configuration
- `VITE_AUTHORIZE_NET_PUBLIC_KEY`: Authorize.Net public key
- `VITE_AUTHORIZE_NET_API_LOGIN_ID`: Authorize.Net API login ID

### Mobile App Configuration
- `VITE_IS_MOBILE_APP`: Flag to identify mobile app context
- `VITE_ENABLE_API_WARMUP`: Enable API warmup for Render.com
- `VITE_DEBUG_MODE`: Enable debug logging

---

## API Usage Patterns

### Authentication Flow
1. User logs in via `POST /api/auth/login`
2. Token stored in localStorage
3. Token automatically included in subsequent requests
4. 401 responses handled by interceptors

### Checkout Flow
1. **Guest**: `POST /api/guest/checkout`
2. **User**: `POST /api/checkout/authorize` (authorization-only)
3. **Saved Card**: `POST /api/checkout/process-saved-card`

### Product Discovery Flow
1. Fetch departments: `GET /api/departments`
2. Fetch products: `GET /api/products`
3. Search products: `GET /api/products/search`
4. Get similar products: `GET /api/similar`

### Mobile App Update Flow
1. Check version: `GET /api/app-version`
2. Compare with current version
3. Show update dialog if needed
4. Handle force updates vs optional updates

---

## Notes
- All API calls use HTTPS in production
- Automatic token refresh not implemented (users must re-login)
- Payment processing is authorization-only (capture handled separately)
- Mobile app includes retry logic for Render.com cold starts
- CMS data is cached and fetched on app initialization
- Search supports pagination and filtering
- Wishlist and orders require authentication
- Product groups support sorting and pagination
