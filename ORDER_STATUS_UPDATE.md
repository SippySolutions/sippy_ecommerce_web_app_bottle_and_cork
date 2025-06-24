# Order Status System Update

## Overview
Updated the order status system to match the store-side workflow with more granular status tracking.

## New Order Status Flow

### Status Definitions:
- **new**: Newly placed orders awaiting acceptance
- **accepted**: Orders accepted and ready for packing  
- **packing**: Orders currently being packed
- **ready**: Orders packed and ready for delivery/pickup
- **out_for_delivery**: Orders dispatched for delivery (or available for pickup)
- **completed**: Successfully delivered/picked up orders
- **cancelled**: Cancelled orders

### Status Transitions:
- `new` → `accepted` (when store owner accepts the order)
- `accepted` → `packing` (when packing starts)
- `packing` → `ready` (when packed and ready for pickup/delivery)
- `ready` → `out_for_delivery` (when dispatched for delivery)
- `out_for_delivery` → `completed` (when delivery is completed)
- Any status → `cancelled`

## Updated Files

### Backend:
1. **models/Order.js**: Updated status enum and default value
2. **controllers/orderController.js**: 
   - Added status transition validation
   - Added new methods: `getOrdersByStatus`, `acceptOrder`, `getOrderStatusHistory`
3. **routes/orderRoutes.js**: Added new routes for order management
4. **controllers/checkoutController.js**: Updated to use 'new' status for new orders
5. **controllers/guestController.js**: Updated to use 'new' status for guest orders

### Frontend:
1. **pages/OrderTracking.jsx**: Updated status colors, icons, and tracking steps
2. **hooks/useOrderPaymentWorkflow.js**: Updated default status to 'new'
3. **components/OrderStatusManager.jsx**: New component for order status management
4. **pages/OrdersDashboard.jsx**: New admin dashboard for order management

## New API Endpoints

### GET /api/orders/status/:status
Get all orders with a specific status (for store management)

### PUT /api/orders/:orderId/accept
Quick action to accept a new order (transition from 'new' to 'accepted')

### GET /api/orders/:orderId/history
Get order status timeline/history

### PUT /api/orders/:orderId/status
Update order status with transition validation

## Store Management Features

### Order Dashboard (`/orders-dashboard`)
- View orders by status
- Real-time status updates
- Order details view
- Status transition management

### Status Manager Component
- Validates status transitions
- Quick accept button for new orders
- Status update buttons for valid transitions
- Prevents invalid status changes

## Usage Examples

### Accept an Order:
```javascript
PUT /api/orders/123/accept
Authorization: Bearer <token>
```

### Update Order Status:
```javascript
PUT /api/orders/123/status
Content-Type: application/json
Authorization: Bearer <token>

{
  "status": "packing"
}
```

### Get Orders by Status:
```javascript
GET /api/orders/status/new
Authorization: Bearer <token>
```

## Migration Notes

- All existing orders with old status values will need to be migrated
- Default status for new orders changed from 'pending' to 'new'
- Frontend components updated to handle new status flow
- Admin authentication required for status management endpoints

## Future Enhancements

- Real-time notifications for status changes
- Estimated delivery times based on status
- Batch status updates
- Status change history logging
- Customer notifications for status updates
