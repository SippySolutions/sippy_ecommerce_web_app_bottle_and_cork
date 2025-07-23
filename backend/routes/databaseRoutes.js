const express = require('express');
const { getDbConnection } = require('../config/db');
const dbSwitcher = require('../middleware/dbSwitcher');
const router = express.Router();

// Apply database switching middleware
router.use(dbSwitcher);

// Test endpoint to verify database switching
router.get('/test', async (req, res) => {
  try {
    const dbName = req.dbName;
    const connection = req.dbConnection;
    
        
    // Get database information safely
    let collections = [];
    try {
      // Use the connection's db property correctly
      const db = connection.db;
      if (db) {
        collections = await db.listCollections().toArray();
      } else {
              }
    } catch (collectionError) {
          }
    
    const dbInfo = {
      requestedDb: dbName,
      connectedDb: connection.name,
      collections: collections.map(col => col.name),
      collectionCount: collections.length,
      connectionState: connection.readyState,
      frontendHeader: req.headers['x-store-db'],
      timestamp: new Date().toISOString(),
      dbExists: collections.length > 0
    };
    
        
    res.json({
      success: true,
      message: 'Database connection successful',
      dbInfo
    });
  } catch (error) {
    console.error(`❌ Database Test Failed:`, error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Test database write capability
router.post('/test-write', async (req, res) => {
  try {
    const dbName = req.dbName;
    const connection = req.dbConnection;
    
        
    // Get the native database object from Mongoose connection
    const db = connection.useDb(dbName);
    const testCollection = db.collection('test_connection');
    
    // Insert a test document
    const testDoc = {
      message: 'Database connection test',
      timestamp: new Date(),
      dbName: dbName,
      frontendHeader: req.headers['x-store-db']
    };
    
    const result = await testCollection.insertOne(testDoc);
    
    // Verify the document was inserted
    const insertedDoc = await testCollection.findOne({ _id: result.insertedId });
    
    // Clean up - delete the test document
    await testCollection.deleteOne({ _id: result.insertedId });
    
        
    res.json({
      success: true,
      message: 'Database write test successful',
      testResult: {
        insertedId: result.insertedId,
        insertedDoc: insertedDoc,
        dbName: dbName,
        frontendHeader: req.headers['x-store-db'],
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error(`❌ Database Write Test Failed:`, error);
    res.status(500).json({
      success: false,
      message: 'Database write test failed',
      error: error.message
    });
  }
});

// Get available databases
router.get('/databases', async (req, res) => {
  try {
    // This is a simple list of available databases
    // In a real app, you might want to fetch this from a configuration or admin database
    const availableDatabases = [
      'store_universal_liquors',
      'store_example_store',
      'store_another_store'
    ];
    
    res.json({
      success: true,
      databases: availableDatabases
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get available databases',
      error: error.message
    });
  }
});

module.exports = router;

