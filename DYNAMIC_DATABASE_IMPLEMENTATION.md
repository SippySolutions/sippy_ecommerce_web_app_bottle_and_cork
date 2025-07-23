# Dynamic Database Configuration via Environment Variables

## Summary of Changes

This implementation allows the frontend to specify which database to use via environment variables, enabling multi-store support with separate databases for each store. Each deployment can be configured to use a specific store database.

## Backend Changes

### 1. Environment Variables (.env)
- Changed `MONGO_URI` to `MONGO_URI_BASE` (base URL without database name)
- Added `DEFAULT_STORE_DB` for fallback database name

### 2. Database Configuration (config/db.js)
- Added `getDbConnection(dbName)` function for dynamic database connections
- Added connection caching to avoid creating multiple connections to the same database
- Added `getModel(modelName, schema, dbName)` helper function
- Maintained backward compatibility with existing `connectDB()` function

### 3. Middleware (middleware/dbSwitcher.js)
- New middleware that extracts database name from request headers (`X-Store-DB`)
- Automatically creates database connection and adds it to the request object
- Handles connection errors gracefully

### 4. Controllers (controllers/ProductController.js)
- Updated to use dynamic database connections
- Uses `req.dbConnection` or `req.dbName` to get the appropriate database
- Backward compatible with existing code

### 5. Routes
- Added `dbSwitcher` middleware to routes that need database switching
- New database routes for testing and management

## Frontend Changes

### 1. Environment Variables (.env)
- Added `VITE_STORE_DB_NAME` to specify which store database to use
- Each deployment can have a different database name

### 2. API Service (services/api.jsx)
- Added axios request interceptor that automatically includes `X-Store-DB` header
- Headers are automatically added to all API requests
- No manual header management needed

## How It Works

1. **Frontend Configuration**: Set `VITE_STORE_DB_NAME` in the environment variables
2. **Automatic Headers**: Axios interceptor automatically adds `X-Store-DB` header to all requests
3. **Backend Processing**: The `dbSwitcher` middleware extracts the database name and creates the appropriate connection
4. **Controller Logic**: Controllers use the database connection to query the correct database

## Configuration

### Backend Environment Variables:
```env
MONGO_URI_BASE=mongodb+srv://username:password@cluster.mongodb.net/
DEFAULT_STORE_DB=store_universal_liquors
```

### Frontend Environment Variables:
```env
# For Universal Liquors store
VITE_STORE_DB_NAME=store_universal_liquors

# For Another Store
VITE_STORE_DB_NAME=store_another_store
```

## Deployment Strategy

### For Different Stores:
1. **Universal Liquors Deployment**:
   ```env
   VITE_STORE_DB_NAME=store_universal_liquors
   ```

2. **Example Store Deployment**:
   ```env
   VITE_STORE_DB_NAME=store_example_store
   ```

3. **Another Store Deployment**:
   ```env
   VITE_STORE_DB_NAME=store_another_store
   ```

## Database Name Format:
- Use format: `store_[store_name]`
- Examples: `store_universal_liquors`, `store_example_store`

## Benefits

1. **Multi-Store Support**: Each deployment serves a specific store
2. **Simple Configuration**: Just change environment variable per deployment
3. **Data Isolation**: Complete separation between store databases
4. **No Runtime Switching**: Fixed configuration per deployment
5. **Automatic Headers**: No manual header management needed
6. **Scalability**: Easy to deploy new stores

## Testing

1. Change `VITE_STORE_DB_NAME` in frontend `.env`
2. Restart the frontend development server
3. All API calls will automatically use the specified database
4. Backend will connect to the appropriate database based on the header

## Production Deployment

### For Universal Liquors:
```env
# Frontend .env
VITE_API_BASE_URL=https://api.universalliquors.com
VITE_STORE_DB_NAME=store_universal_liquors

# Backend .env  
MONGO_URI_BASE=mongodb+srv://username:password@cluster.mongodb.net/
DEFAULT_STORE_DB=store_universal_liquors
```

### For Another Store:
```env
# Frontend .env
VITE_API_BASE_URL=https://api.anotherstore.com
VITE_STORE_DB_NAME=store_another_store

# Backend .env
MONGO_URI_BASE=mongodb+srv://username:password@cluster.mongodb.net/
DEFAULT_STORE_DB=store_another_store
```
