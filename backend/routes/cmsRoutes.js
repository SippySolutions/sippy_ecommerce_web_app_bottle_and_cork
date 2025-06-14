const express = require('express');
const router = express.Router();

// Mock CMS data model - replace with your actual CMS model
// You might want to create a proper CMS model in your models folder
let cmsData = null;

// GET /api/cms-data - Get CMS configuration
router.get('/', async (req, res) => {
  try {
    // For now, return the static data you provided
    // In production, this should fetch from your CMS collection in MongoDB
    const data = {
      "_id": "681ad1aa11b98c57877187ca",
      "logo": "https://sippysolutionsbucket.s3.us-east-2.amazonaws.com/universal_liquors/Logo.png",
      "heroSection": {
        "leftBanner": {
          "title": "Exclusive Wine Collections",
          "subtitle": "Up to 20% Off",
          "buttonText": "SHOP NOW",
          "image": "https://qualityliquorstore.com/cdn/shop/files/elijah-pga-trophy.jpg?v=1744229403&width=537"
        },
        "rightBanners": [
          {
            "title": "Craft Beer Specials",
            "subtitle": "Buy 1 Get 1 Free",
            "buttonText": "EXPLORE",
            "image": "https://demo2.pavothemes.com/corino/wp-content/uploads/2024/05/h2-banner02.jpg"
          },
          {
            "title": "Cocktail Essentials",
            "subtitle": "Starting at $19.99",
            "buttonText": "DISCOVER",
            "image": "https://www.universalfws.com/wp-content/uploads/2023/11/wine-sect-img.jpg.webp"
          }
        ]
      },
      "banner": {
        "title": "UP TO 50% OFF",
        "subtitle": "BIG SALE OFF ALL ITEMS",
        "buttonText": "SHOP NOW",
        "description": "Coming soon on October.",
        "image": "https://sippysolutionsbucket.s3.us-east-2.amazonaws.com/universal_liquors/offerBanner/offerbanner.png"
      },
      "brandBanner": [
        {
          "name": "Absolut",
          "logo": "https://sippysolutionsbucket.s3.us-east-2.amazonaws.com/universal_liquors/brandimages/Absolut.png"
        },
        {
          "name": "Bacardi",
          "logo": "https://sippysolutionsbucket.s3.us-east-2.amazonaws.com/universal_liquors/brandimages/Bacardi.png"
        },
        {
          "name": "Jack Daniel's",
          "logo": "https://sippysolutionsbucket.s3.us-east-2.amazonaws.com/universal_liquors/brandimages/Jack-Daniel's.png"
        },
        {
          "name": "Johnnie Walker",
          "logo": "https://sippysolutionsbucket.s3.us-east-2.amazonaws.com/universal_liquors/brandimages/Johnnie-Walker.png"
        },
        {
          "name": "Hennessy",
          "logo": "https://sippysolutionsbucket.s3.us-east-2.amazonaws.com/universal_liquors/brandimages/Hennessy.png"
        },
        {
          "name": "Patron",
          "logo": "https://sippysolutionsbucket.s3.us-east-2.amazonaws.com/universal_liquors/brandimages/Patron.png"
        }
      ],
      "theme": {
        "primary": "#1E1E1E",
        "secondary": "#373737",
        "accent": "#FF5722",
        "muted": "#F2F2F2",
        "background": "#121212",
        "headingText": "#FFFFFF",
        "bodyText": "#CCCCCC",
        "linkText": "#FF5722"
      },
      "storeInfo": {
        "name": "Universal Liquors",
        "address": "2117 Bergenline Ave #1, Union City, NJ 07087",
        "email": "universalliquors@gmail.com",
        "phone": "(201) 863-96544",
        "storeHours": {
          "monday": { "open": "09:00", "close": "21:00" },
          "tuesday": { "open": "09:00", "close": "21:00" },
          "wednesday": { "open": "09:00", "close": "21:00" },
          "thursday": { "open": "09:00", "close": "21:00" },
          "friday": { "open": "09:00", "close": "23:00" },
          "saturday": { "open": "09:00", "close": "23:00" },
          "sunday": { "open": "12:00", "close": "20:00" }
        },
        "tax": {
          "rate": 6.6
        }
      },
      "bestSellers": [],
      "categories": []
    };

    res.json(data);
  } catch (error) {
    console.error('Error fetching CMS data:', error);
    res.status(500).json({ 
      message: 'Error fetching CMS data', 
      error: error.message 
    });
  }
});

// PUT /api/cms-data - Update CMS configuration (for admin panel)
router.put('/', async (req, res) => {
  try {
    // This would update your CMS data in MongoDB
    // Implementation depends on your CMS model structure
    
    res.json({ 
      message: 'CMS data updated successfully',
      data: req.body 
    });
  } catch (error) {
    console.error('Error updating CMS data:', error);
    res.status(500).json({ 
      message: 'Error updating CMS data', 
      error: error.message 
    });
  }
});

module.exports = router;
