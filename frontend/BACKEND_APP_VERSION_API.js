// Backend API endpoint example (for your backend)
// Add this to your backend routes

// routes/appRoutes.js
const express = require('express');
const router = express.Router();

// App version configuration
const APP_VERSION_CONFIG = {
  latestVersion: '1.3.0',
  minRequiredVersion: '1.2.0', // Versions below this will be forced to update
  updateMessage: 'New version available with improved mobile experience and bug fixes!',
  features: [
    'Enhanced mobile navigation',
    'Fixed scrolling issues',
    'Better hamburger menu placement',
    'Improved status bar handling',
    'Various UI/UX improvements'
  ],
  isActive: true, // Master switch to enable/disable update checking
  forceUpdate: false // Set to true to force all users to update
};

// GET /api/app-version
router.get('/app-version', (req, res) => {
  try {
    // You can add logic here to:
    // - Check user's current version from headers
    // - Return different configs for different user segments
    // - Store this in database for easy management
    
    const response = {
      ...APP_VERSION_CONFIG,
      timestamp: new Date().toISOString(),
      // Override minRequiredVersion if force update is enabled
      minRequiredVersion: APP_VERSION_CONFIG.forceUpdate 
        ? APP_VERSION_CONFIG.latestVersion 
        : APP_VERSION_CONFIG.minRequiredVersion
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching app version:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/app-version (Admin only - to update version config)
router.post('/app-version', (req, res) => {
  try {
    // Add authentication/authorization here
    // if (!req.user.isAdmin) return res.status(403).json({ error: 'Unauthorized' });
    
    const { 
      latestVersion, 
      minRequiredVersion, 
      updateMessage, 
      features, 
      forceUpdate 
    } = req.body;
    
    // Update configuration
    if (latestVersion) APP_VERSION_CONFIG.latestVersion = latestVersion;
    if (minRequiredVersion) APP_VERSION_CONFIG.minRequiredVersion = minRequiredVersion;
    if (updateMessage) APP_VERSION_CONFIG.updateMessage = updateMessage;
    if (features) APP_VERSION_CONFIG.features = features;
    if (typeof forceUpdate === 'boolean') APP_VERSION_CONFIG.forceUpdate = forceUpdate;
    
    res.json({ 
      message: 'App version config updated successfully',
      config: APP_VERSION_CONFIG 
    });
  } catch (error) {
    console.error('Error updating app version:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

// Usage in your main server file:
// const appRoutes = require('./routes/appRoutes');
// app.use('/api', appRoutes);
