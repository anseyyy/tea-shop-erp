const Sale = require('../models/Sale');
const Expense = require('../models/Expense');

// Helper to calculate report details from lists of sales and expenses
// Helper to calculate report details via MongoDB Aggregation Pipelines
const fetchAggregatedReport = async (startDate, endDate) => {
  const salesAggPromise = Sale.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    {
      $facet: {
        totals: [
          {
            $group: {
              _id: null,
              revenue: { $sum: '$totalAmount' },
              totalBills: { $sum: 1 },
            },
          },
        ],
        items: [
          { $unwind: '$items' },
          {
            $group: {
              _id: '$items.name',
              quantity: { $sum: '$items.quantity' },
            },
          },
          { $sort: { quantity: -1 } },
        ],
      },
    },
  ]);

  const expensesAggPromise = Expense.aggregate([
    { $match: { date: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: null,
        totalExpenses: { $sum: '$amount' },
      },
    },
  ]);

  const [salesResult, expensesResult] = await Promise.all([
    salesAggPromise,
    expensesAggPromise,
  ]);

  const salesTotals = salesResult[0]?.totals[0] || {};
  const itemsList = salesResult[0]?.items || [];
  const expenseTotals = expensesResult[0] || {};

  const revenue = salesTotals.revenue || 0;
  const totalBills = salesTotals.totalBills || 0;
  const expenses = expenseTotals.totalExpenses || 0;
  const netProfit = revenue - expenses;

  let itemsSold = 0;
  itemsList.forEach((item) => {
    itemsSold += item.quantity;
  });

  const bestSeller = itemsList.length > 0
    ? { name: itemsList[0]._id, quantity: itemsList[0].quantity }
    : { name: 'N/A', quantity: 0 };

  return {
    revenue,
    expenses,
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

    const report = await fetchAggregatedReport(startOfDay, endOfDay);
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

    const report = await fetchAggregatedReport(startOfWeek, endOfWeek);
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

    const report = await fetchAggregatedReport(startOfMonth, endOfMonth);

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
