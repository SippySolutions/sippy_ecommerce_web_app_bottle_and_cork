const mongoose = require('mongoose');
const dotenv = require('dotenv');
const HeroSection = require('./models/HeroSection');
const Product = require('./models/Product');

dotenv.config();
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    await HeroSection.deleteMany();
    await Product.deleteMany();

    const heroSection = new HeroSection({
      leftSection: {
        title: 'Exclusive Wine Collection',
        subtitle: 'Up to 30% Off',
        image: '/images/wine-offer.jpg',
        ctaText: 'Shop Now',
        ctaLink: '/shop/wine',
      },
      rightSections: [
        {
          title: 'Craft Beer Specials',
          subtitle: 'Buy 1 Get 1 Free',
          image: '/images/beer-offer.jpg',
          ctaText: 'Explore',
          ctaLink: '/shop/beer',
        },
        {
          title: 'Cocktail Essentials',
          subtitle: 'Starting at $19.99',
          image: '/images/cocktail-offer.jpg',
          ctaText: 'Discover',
          ctaLink: '/shop/cocktails',
        },
      ],
    });

    const products = [
      {
        name: 'Whiskey',
        description: 'A fine whiskey.',
        price: 49.99,
        image: '/images/whiskey.jpg',
        stock: 10,
        category: 'Spirits',
      },
      {
        name: 'Vodka',
        description: 'Premium vodka.',
        price: 29.99,
        image: '/images/vodka.jpg',
        stock: 15,
        category: 'Spirits',
      },
    ];

    await heroSection.save();
    await Product.insertMany(products);

    console.log('Data seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();