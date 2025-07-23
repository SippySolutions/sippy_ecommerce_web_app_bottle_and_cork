const mongoose = require('mongoose');

// Store for database connections
const connections = new Map();

// Get database connection for a specific store (dbName is required)
const getDbConnection = async (dbName) => {
  if (!dbName) {
    throw new Error('Database name is required - no default database configured');
  }
  
  if (connections.has(dbName)) {
    return connections.get(dbName);
  }
  
  try {
    const mongoUri = `${process.env.MONGO_URI_BASE}${dbName}`;
    const conn = await mongoose.createConnection(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    connections.set(dbName, conn);
    return conn;
  } catch (error) {
    console.error(`Error connecting to database ${dbName}: ${error.message}`);
    throw error;
  }
};

// Legacy function - no longer needed since all requests require explicit database
// Kept for backward compatibility but will throw error if used
const connectDB = async () => {
  throw new Error('connectDB is deprecated - all requests must specify database via X-Store-DB header');
};

// Get model from specific database (dbName is required)
const getModel = async (modelName, schema, dbName) => {
  if (!dbName) {
    throw new Error('Database name is required - no default database configured');
  }
  const connection = await getDbConnection(dbName);
  return connection.model(modelName, schema);
};

// Close all connections
const closeAllConnections = async () => {
  for (const [dbName, connection] of connections) {
    await connection.close();
  }
  connections.clear();
};

module.exports = { 
  connectDB, 
  getDbConnection, 
  getModel, 
  closeAllConnections 
};