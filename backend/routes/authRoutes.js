const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');

const router = express.Router();

// Route for user registration
router.post('/auth/register', registerUser);
router.post('/auth/login', loginUser);
module.exports = router;