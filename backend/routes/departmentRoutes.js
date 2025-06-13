const express = require('express');
const { getDepartmentsWithCategories } = require('../controllers/departmentController');

const router = express.Router();

// Route to get unique departments
router.get('/departments', getDepartmentsWithCategories);

module.exports = router;