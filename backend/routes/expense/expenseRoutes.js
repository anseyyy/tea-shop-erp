const express = require('express');
const { protect, adminOnly } = require('../../middleware/authMiddleware');
const {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getTodayExpenses,
} = require('../../controllers/expenseController');

const router = express.Router();

// All routes here require verification of JWT and Admin role
router.use(protect);
router.use(adminOnly);

router.get('/today', getTodayExpenses);

router.route('/')
  .get(getExpenses)
  .post(createExpense);

router.route('/:id')
  .get(getExpenseById)
  .put(updateExpense)
  .delete(deleteExpense);

module.exports = router;
