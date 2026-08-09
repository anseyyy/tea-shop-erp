const Expense = require('../models/Expense');

// @desc    Create a new expense
// @route   POST /api/expenses
// @access  Private/Admin
const createExpense = async (req, res) => {
  const { amount, description, category, date } = req.body;

  try {
    const expense = await Expense.create({
      amount,
      description,
      category,
      date: date || new Date(),
      createdBy: req.user._id,
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private/Admin
const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({}).sort({ date: -1 }).populate('createdBy', 'name');
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get expense by ID
// @route   GET /api/expenses/:id
// @access  Private/Admin
const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id).populate('createdBy', 'name');

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Private/Admin
const updateExpense = async (req, res) => {
  const { amount, description, category, date } = req.body;

  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    expense.amount = amount !== undefined ? amount : expense.amount;
    expense.description = description || expense.description;
    expense.category = category || expense.category;
    expense.date = date || expense.date;

    const updatedExpense = await expense.save();
    res.json(updatedExpense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private/Admin
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    await Expense.deleteOne({ _id: req.params.id });
    res.json({ message: 'Expense removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get today's expenses
// @route   GET /api/expenses/today
// @access  Private/Admin
const getTodayExpenses = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setUTCHours(23, 59, 59, 999);

    const expenses = await Expense.find({
      date: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ date: -1 }).populate('createdBy', 'name');

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getTodayExpenses,
};
