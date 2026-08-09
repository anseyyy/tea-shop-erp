const express = require('express');
const { protect } = require('../../middleware/authMiddleware');
const { getDashboardStats, getTodayHistory } = require('../../controllers/dashboardController');

const router = express.Router();

router.get('/stats', protect, getDashboardStats);
router.get('/history', protect, getTodayHistory);

module.exports = router;
