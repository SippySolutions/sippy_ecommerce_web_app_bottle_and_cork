#!/bin/bash

# New Store Setup Script
# Minimal configuration - store branding comes from CMS database

echo "🏪 Multi-Store Setup Helper"
echo "=========================="

# Get essential information only
read -p "Enter database name (e.g., 'store_wine_emporium'): " DB_NAME
read -p "Enter store slug for filename (e.g., 'wine-emporium'): " STORE_SLUG
read -p "Enter Authorize.Net Public Key: " AUTH_PUBLIC_KEY
read -p "Enter Authorize.Net Login ID: " AUTH_LOGIN_ID

# Generate minimal environment file
ENV_FILE="store-${STORE_SLUG}.env"

cat > "$ENV_FILE" << EOF
# Frontend Environment Variables for ${STORE_SLUG}
# Minimal configuration - store branding comes from CMS database

# API Configuration (Points to shared backend)
VITE_API_BASE_URL=https://sippy-ecommerce-web-app.onrender.com
VITE_API_URL=https://sippy-ecommerce-web-app.onrender.com
VITE_MODE=production

# Database Connection (REQUIRED - Unique per store)
VITE_STORE_DB_NAME=${DB_NAME}

# Payment Configuration (REQUIRED - Store-specific Authorize.Net account)
VITE_AUTHORIZE_NET_PUBLIC_KEY=${AUTH_PUBLIC_KEY}
VITE_AUTHORIZE_NET_API_LOGIN_ID=${AUTH_LOGIN_ID}

# All other store data comes from CMS database:
# - Store name, business name, logo, theme colors
# - Contact info, address, phone, email
# - Store hours, social media links
# - Feature flags and settings
# - All content and copy
EOF

echo ""
echo "✅ Created minimal environment file: $ENV_FILE"
echo ""
echo "Next Steps:"
echo "1. Create database '${DB_NAME}' in MongoDB Atlas"
echo "2. Populate CMS collection with store branding data"
echo "3. Deploy frontend with environment variables from $ENV_FILE"
echo "4. Set up custom domain pointing to the frontend"
echo ""
echo "📋 Database Setup Required:"
echo "□ Create '${DB_NAME}' database in MongoDB"
echo "□ Import/create CMS document with:"
echo "  - Store name, business info"
echo "  - Logo URL, theme colors"
echo "  - Contact info, address"
echo "  - Store hours, social media"
echo "  - Feature flags, settings"
echo ""
echo "📋 Deployment Checklist:"
echo "□ MongoDB database created"
echo "□ CMS data populated"
echo "□ Frontend deployed (Vercel/Netlify)"
echo "□ Environment variables configured"
echo "□ Custom domain configured"
echo "□ Test database connection"
echo "□ Test payment processing"
EOF
