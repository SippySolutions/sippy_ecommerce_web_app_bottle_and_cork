const mongoose = require('mongoose');
const ProductGroup = require('./models/ProductGroup');
require('dotenv').config();

const testData = [
  {
    name: "Premium Whiskey Collection",
    description: "A curated selection of the finest whiskeys from around the world",
    bannerImage: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    isActive: true,
    products: [], // You can add product IDs here later
    displayOrder: 1
  },
  {
    name: "Wine Enthusiast Collection",
    description: "Exceptional wines for the discerning palate",
    bannerImage: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    isActive: true,
    products: [], // You can add product IDs here later
    displayOrder: 2
  },
  {
    name: "Craft Beer Selection",
    description: "Local and international craft beers for every taste",
    bannerImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    isActive: true,
    products: [], // You can add product IDs here later
    displayOrder: 3
  },
  {
    name: "Premium Spirits",
    description: "Top-shelf spirits for special occasions",
    bannerImage: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    isActive: true,
    products: [], // You can add product IDs here later
    displayOrder: 4
  }
];

async function seedProductGroups() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Clear existing product groups
    await ProductGroup.deleteMany({});
    console.log('Cleared existing product groups');

    // Insert test data
    await ProductGroup.insertMany(testData);
    console.log('Inserted test product groups');

    console.log('Product Groups seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding product groups:', error);
    process.exit(1);
  }
}

seedProductGroups();
