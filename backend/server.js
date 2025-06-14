const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const cmsDataRoutes = require('./routes/CMSDataRoutes');
const cmsRoutes = require('./routes/cmsRoutes'); // Add new CMS routes
const featuredproductRoutes = require('./routes/featuredproductRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const authRoutes = require('./routes/authRoutes');
const similarProductRoutes = require('./routes/similarProductRoutes');
const userRoutes = require('./routes/userRoutes'); // Import user routes
const orderRoutes = require('./routes/orderRoutes'); // Import order routes
const checkoutRoutes = require('./routes/checkoutRoutes'); // Import checkout routes

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/featured-products', featuredproductRoutes);
app.use('/api/similar', similarProductRoutes);
app.use('/api', cmsDataRoutes);
app.use('/api/cms-data', cmsRoutes); // Add new CMS data route
app.use('/api', departmentRoutes);
app.use('/api', authRoutes);
app.use('/api/users', userRoutes); // Register user routes
app.use('/api/orders', orderRoutes); // Register order routes
app.use('/api/checkout', checkoutRoutes); // Register checkout routes
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});