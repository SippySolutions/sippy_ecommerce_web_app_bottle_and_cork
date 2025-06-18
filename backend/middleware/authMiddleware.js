const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Optional auth middleware - doesn't fail if no token provided (for guest checkout)
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  // If no auth header, proceed as guest
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
  } catch (err) {
    // If token is invalid, proceed as guest rather than failing
    req.user = null;
  }
  
  next();
};

module.exports = auth;
module.exports.optionalAuth = optionalAuth;