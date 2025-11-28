const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Configure multer for CSV file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `csv-import-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || path.extname(file.originalname).toLowerCase() === '.csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Import controllers
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  importProductsFromCSV,
  downloadCSVTemplate
} = require('../controllers/productController');

const {
  getAllOrders,
  getOrder,
  updateOrderStatus
} = require('../controllers/orderController');

const {
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById
} = require('../controllers/userController');

const {
  getAnalyticsOverview,
  getUserInteractions,
  getProductPerformance,
  getCategoryAnalytics,
  getOrderAnalytics
} = require('../controllers/analyticsController');

const {
  getUserFavorites,
  getUserCarts
} = require('../controllers/userBehaviorController');

const {
  getCategories
} = require('../controllers/categoryController');

// Import middleware
const { authenticate, authorize } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Product management routes
router.get('/products', getProducts);
router.get('/products/:id', getProduct);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// CSV import routes
router.post('/products/import', (req, res, next) => {
  console.log('CSV import route hit');
  upload.single('csvFile')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({
        success: false,
        error: {
          message: err.message || 'File upload error'
        }
      });
    }
    console.log('File upload successful, proceeding to import');
    next();
  });
}, importProductsFromCSV);
router.get('/products/import/template', downloadCSVTemplate);

// Debug route to test if admin routes are working
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Admin routes are working',
    user: req.user ? { id: req.user.id, role: req.user.role } : null
  });
});

// Category routes for import reference
router.get('/categories', getCategories);

// Order management routes
router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrder);
router.put('/orders/:id/status', updateOrderStatus);

// User management routes
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUserById);
router.delete('/users/:id', deleteUserById);

// Analytics routes
router.get('/analytics/overview', getAnalyticsOverview);
router.get('/analytics/user-interactions', getUserInteractions);
router.get('/analytics/product-performance', getProductPerformance);
router.get('/analytics/category-analytics', getCategoryAnalytics);
router.get('/analytics/order-analytics', getOrderAnalytics);

// User behavior routes
router.get('/user-behavior/favorites', getUserFavorites);
router.get('/user-behavior/carts', getUserCarts);

module.exports = router;