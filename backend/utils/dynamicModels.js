const { getDbConnection } = require('../config/db');

// Import all model schemas
const UserSchema = require('../models/User').schema;
const ProductSchema = require('../models/Product').schema;
const OrderSchema = require('../models/Order').schema;
const GuestSchema = require('../models/Guest').schema;
const ProductGroupSchema = require('../models/ProductGroup').schema;
const CMSDataSchema = require('../models/CMSdata').schema;

// Helper function to get model from specific database
const getModelFromDb = async (modelName, dbName = null) => {
  const connection = await getDbConnection(dbName);
  
  let schema, collectionName;
  switch (modelName) {
    case 'User':
      schema = UserSchema;
      collectionName = 'users';
      break;
    case 'Product':
      schema = ProductSchema;
      collectionName = 'products';
      break;
    case 'Order':
      schema = OrderSchema;
      collectionName = 'orders';
      break;
    case 'Guest':
      schema = GuestSchema;
      collectionName = 'guests';
      break;
    case 'ProductGroup':
      schema = ProductGroupSchema;
      collectionName = 'productgroups';
      break;
    case 'CMSData':
      schema = CMSDataSchema;
      collectionName = 'cms'; // Explicitly use 'cms' not 'cmsdatas'
      break;
    default:
      throw new Error(`Unknown model: ${modelName}`);
  }
  
  return connection.model(modelName, schema, collectionName);
};

// Helper function to get multiple models from specific database
const getModelsFromDb = async (modelNames, dbName = null) => {
  const models = {};
  
  for (const modelName of modelNames) {
    models[modelName] = await getModelFromDb(modelName, dbName);
  }
  
  return models;
};

module.exports = {
  getModelFromDb,
  getModelsFromDb
};
