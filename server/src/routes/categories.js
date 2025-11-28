const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  getCategoryTree,
  getFeaturedCategories
} = require('../controllers/categoryController');

// Get all categories
router.get('/', getCategories);

// Get featured categories
router.get('/featured', getFeaturedCategories);

// Get category tree
router.get('/tree', getCategoryTree);

// Get category by ID or slug
router.get('/:id', getCategoryById);

module.exports = router;