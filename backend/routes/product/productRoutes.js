const express = require('express');
const { protect, adminOnly } = require('../../middleware/authMiddleware');
const upload = require('../../middleware/uploadMiddleware');
const {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} = require('../../controllers/productController');

const router = express.Router();

// GET is accessible by any authenticated user (admin or employee)
// POST is admin-only, and processes multipart file uploads under parameter name 'image'
router.route('/')
  .get(protect, getProducts)
  .post(protect, adminOnly, upload.single('image'), createProduct);

router.route('/:id')
  .put(protect, adminOnly, upload.single('image'), updateProduct)
  .delete(protect, adminOnly, deleteProduct);

module.exports = router;
