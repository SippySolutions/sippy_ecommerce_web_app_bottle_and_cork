# Multi-Store Deployment Guide

## Overview
This system allows you to deploy one backend server and multiple frontend instances, each connecting to different MongoDB databases for different stores.

## Architecture
```
┌─────────────────┐    ┌─────────────────────────────────┐
│                 │    │                                 │
│   Backend       │◄───┤  MongoDB Cluster                │
│   (One Instance)│    │                                 │
│   Render Pro    │    │  ├── store_universal_liquors    │
│                 │    │  ├── store_wine_emporium        │
└─────────────────┘    │  ├── store_beer_garden          │
         ▲              │  └── store_spirits_corner       │
         │              │                                 │
    ┌────┴───────────────┴─────────────────────────────────┐
    │                                                      │
    ▼                                                      ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Frontend 1 │  │  Frontend 2 │  │  Frontend 3 │  │  Frontend N │
│ Universal   │  │ Wine        │  │ Beer        │  │ Custom      │
│ Liquors     │  │ Emporium    │  │ Garden      │  │ Store       │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

## Step-by-Step Deployment

### 1. Backend Deployment (One Time)
Deploy your backend to Render Pro with these environment variables:

```env
MONGO_URI_BASE=mongodb+srv://your-cluster/
DEFAULT_STORE_DB=store_universal_liquors
NODE_ENV=production
PORT=5001
JWT_SECRET=your-jwt-secret
```

### 2. Database Setup (Per Store)
For each new store, create a new database in your MongoDB cluster:
- `store_universal_liquors` (existing)
- `store_wine_emporium` (new store 1)
- `store_beer_garden` (new store 2)
- `store_spirits_corner` (new store 3)

### 3. Frontend Deployment (Per Store)
Deploy each frontend instance with different environment variables.

## Benefits
- ✅ **Cost Efficient**: One backend server handles all stores
- ✅ **Scalable**: Backend can scale on Render Pro
- ✅ **Isolated Data**: Each store has its own database
- ✅ **Customizable**: Each frontend can have different branding
- ✅ **Maintainable**: Same codebase for all stores
- ✅ **Multi-tenant**: Support unlimited stores

## Database Switching
The system automatically:
1. Frontend sends `X-Store-DB` header with database name
2. Backend middleware creates connection to specified database
3. All operations use store-specific database
4. No data mixing between stores

## Next Steps
1. Use the templates in this folder for each store deployment
2. Customize branding and configuration per store
3. Deploy frontend instances to Vercel/Netlify
4. Point custom domains to each frontend
