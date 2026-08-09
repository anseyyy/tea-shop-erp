const express = require('express');
const { protect, adminOnly } = require('../../middleware/authMiddleware');
const {
  createSale,
  getSales,
  getSaleById,
  updateSale,
  deleteSale,
  getTodaySales,
} = require('../../controllers/saleController');

const router = express.Router();

router.get('/today', protect, getTodaySales);

router.route('/')
  .get(protect, getSales)
  .post(protect, createSale);

router.route('/:id')
  .get(protect, getSaleById)
  .put(protect, updateSale)
  .delete(protect, adminOnly, deleteSale);

module.exports = router;
