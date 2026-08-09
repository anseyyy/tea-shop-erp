const express = require('express');
const { protect } = require('../../middleware/authMiddleware');
const {
  getDailyReport,
  getWeeklyReport,
  getMonthlyReport,
} = require('../../controllers/reportController');

const router = express.Router();

router.get('/daily', protect, getDailyReport);
router.get('/weekly', protect, getWeeklyReport);
router.get('/monthly', protect, getMonthlyReport);

module.exports = router;
