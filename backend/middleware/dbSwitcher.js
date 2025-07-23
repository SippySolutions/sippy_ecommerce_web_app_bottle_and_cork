const { getDbConnection } = require('../config/db');

// Middleware to switch database based on request
const dbSwitcher = (req, res, next) => {
  // Get database name ONLY from frontend headers - no fallback
  const dbName = req.headers['x-store-db'];
  
  // If no database name is provided, reject the request
  if (!dbName) {
    console.error('❌ No database name provided in X-Store-DB header');
    return res.status(400).json({ 
      error: 'Database name is required', 
      message: 'Please provide X-Store-DB header with the database name' 
    });
  }
  
  // Store the database name in request for use in controllers
  req.dbName = dbName;
  
  // Get database connection and store it in request
  getDbConnection(dbName)
    .then(connection => {
      req.dbConnection = connection;
      next();
    })
    .catch(error => {
      console.error(`Database connection error for ${dbName}:`, error);
      res.status(500).json({ 
        error: 'Database connection failed', 
        dbName: dbName 
      });
    });
};

module.exports = dbSwitcher;
