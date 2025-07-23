# Deployment Instructions for Multi-Store Setup

## Backend Deployment (One Time Only)

### 1. Deploy to Render Pro
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set the following environment variables:

```
MONGO_URI_BASE=mongodb+srv://your-cluster/
NODE_ENV=production
PORT=5001
JWT_SECRET=your-super-secret-jwt-key-here
AUTHORIZE_NET_API_LOGIN_ID=your-authorize-net-login-id
AUTHORIZE_NET_TRANSACTION_KEY=your-authorize-net-transaction-key
```

### 2. Enable Auto-Deploy
Set up auto-deploy from your `master` branch so updates are automatic.

---

## Frontend Deployments (Per Store)

### Option A: Vercel Deployment (Recommended)

#### For Universal Liquors:
1. Create new Vercel project
2. Connect to your GitHub repository
3. Set Root Directory to: `frontend`
4. Copy environment variables from `store1-universal-liquors.env`
5. Set custom domain: `universalliquors.com`

#### For Wine Emporium:
1. Create new Vercel project  
2. Connect to same GitHub repository
3. Set Root Directory to: `frontend`
4. Copy environment variables from `store2-wine-emporium.env`
5. Set custom domain: `wineemporium.com`

#### For Beer Garden:
1. Create new Vercel project
2. Connect to same GitHub repository  
3. Set Root Directory to: `frontend`
4. Copy environment variables from `store3-beer-garden.env`
5. Set custom domain: `beergarden.com`

### Option B: Netlify Deployment

Similar process but use Netlify instead of Vercel.

---

## Database Setup (Per Store)

### 1. MongoDB Atlas
In your MongoDB cluster, create these databases:
- `store_universal_liquors` (existing)
- `store_wine_emporium` 
- `store_beer_garden`

### 2. Populate Store Data
For each new store database, you'll need to:
1. Create store profile in the `stores` collection
2. Import products specific to that store
3. Set up CMS data (homepage content, etc.)
4. Configure payment settings

---

## Testing the Setup

### 1. Test Database Switching
```bash
# Test Universal Liquors database
curl -H "X-Store-DB: store_universal_liquors" https://your-backend.onrender.com/api/database/test

# Test Wine Emporium database  
curl -H "X-Store-DB: store_wine_emporium" https://your-backend.onrender.com/api/database/test

# Test Beer Garden database
curl -H "X-Store-DB: store_beer_garden" https://your-backend.onrender.com/api/database/test
```

### 2. Test Frontend Configuration
Visit each deployed frontend and verify:
- ✅ Correct store name in header
- ✅ Correct theme colors
- ✅ Correct contact information
- ✅ Products loading from correct database
- ✅ Payment processing with correct credentials

---

## Scaling to More Stores

### Adding Store #4, #5, etc.:
1. Create new database: `store_new_business_name`
2. Copy `store3-beer-garden.env` → `store4-new-business.env`
3. Update all store-specific variables
4. Deploy new frontend instance with new environment variables
5. Set up custom domain

### Cost Analysis:
- **Backend**: $25/month (Render Pro) - handles all stores
- **Frontend**: $0/month (Vercel/Netlify free tier) - per store
- **Database**: ~$9/month (MongoDB Atlas) - all stores in one cluster
- **Total per store**: ~$34/month for first store, ~$0/month for additional stores

---

## Maintenance

### Code Updates:
1. Push changes to GitHub
2. Backend auto-deploys on Render
3. All frontends auto-deploy with same codebase
4. No manual updates needed per store

### Store-Specific Updates:
1. Update environment variables in deployment platform
2. Frontend will redeploy automatically
3. No code changes needed
