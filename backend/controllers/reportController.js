const Sale = require('../models/Sale');
const Expense = require('../models/Expense');

// Helper to calculate report details from lists of sales and expenses
const generateReportData = (sales, expenses) => {
  const revenue = sales.reduce((acc, sale) => acc + sale.totalAmount, 0);
  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const netProfit = revenue - totalExpenses;
  const totalBills = sales.length;

  let itemsSold = 0;
  const itemCounts = {};

  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      itemsSold += item.quantity;
      if (itemCounts[item.name]) {
        itemCounts[item.name] += item.quantity;
      } else {
        itemCounts[item.name] = item.quantity;
      }
    });
  });

  // Calculate best seller
  let bestSeller = { name: 'N/A', quantity: 0 };
  for (const name in itemCounts) {
    if (itemCounts[name] > bestSeller.quantity) {
      bestSeller = { name, quantity: itemCounts[name] };
    }
  }

  return {
    revenue,
    expenses: totalExpenses,
    netProfit,
    totalBills,
    itemsSold,
    bestSeller,
  };
};

// @desc    Get Daily Report
// @route   GET /api/reports/daily
// @access  Private
const getDailyReport = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();

    const startOfDay = new Date(targetDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const sales = await Sale.find({ createdAt: { $gte: startOfDay, $lte: endOfDay } });
    const expenses = await Expense.find({ date: { $gte: startOfDay, $lte: endOfDay } });

    const report = generateReportData(sales, expenses);
    res.json({
      period: 'Daily',
      date: startOfDay.toISOString().split('T')[0],
      ...report,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Weekly Report (Last 7 Days)
// @route   GET /api/reports/weekly
// @access  Private
const getWeeklyReport = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();

    const endOfWeek = new Date(targetDate);
    endOfWeek.setUTCHours(23, 59, 59, 999);

    const startOfWeek = new Date(targetDate);
    startOfWeek.setUTCDate(startOfWeek.getUTCDate() - 6); // 7 days including targetDate
    startOfWeek.setUTCHours(0, 0, 0, 0);

    const sales = await Sale.find({ createdAt: { $gte: startOfWeek, $lte: endOfWeek } });
    const expenses = await Expense.find({ date: { $gte: startOfWeek, $lte: endOfWeek } });

    const report = generateReportData(sales, expenses);
    res.json({
      period: 'Weekly',
      startDate: startOfWeek.toISOString().split('T')[0],
      endDate: endOfWeek.toISOString().split('T')[0],
      ...report,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Monthly Report
// @route   GET /api/reports/monthly
// @access  Private
const getMonthlyReport = async (req, res) => {
  try {
    const today = new Date();
    const year = req.query.year ? parseInt(req.query.year) : today.getFullYear();
    // Months are 1-12 in query, but 0-11 in JS Date
    const month = req.query.month ? parseInt(req.query.month) - 1 : today.getMonth();

    const startOfMonth = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

    const sales = await Sale.find({ createdAt: { $gte: startOfMonth, $lte: endOfMonth } });
    const expenses = await Expense.find({ date: { $gte: startOfMonth, $lte: endOfMonth } });

    const report = generateReportData(sales, expenses);
    
    // Get month name
    const monthName = startOfMonth.toLocaleString('default', { month: 'long', timeZone: 'UTC' });

    res.json({
      period: 'Monthly',
      month: `${monthName} ${year}`,
      ...report,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDailyReport,
  getWeeklyReport,
  getMonthlyReport,
};
