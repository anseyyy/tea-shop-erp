const Sale = require('../models/Sale');
const Expense = require('../models/Expense');

// @desc    Get dashboard stats for today
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setUTCHours(23, 59, 59, 999);

    const salesAggPromise = Sale.aggregate([
      { $match: { createdAt: { $gte: startOfDay, $lte: endOfDay } } },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                todayRevenue: { $sum: '$totalAmount' },
                billsCount: { $sum: 1 },
              },
            },
          ],
          items: [
            { $unwind: '$items' },
            {
              $group: {
                _id: null,
                itemsSold: { $sum: '$items.quantity' },
              },
            },
          ],
        },
      },
    ]);

    const expensesAggPromise = Expense.aggregate([
      { $match: { date: { $gte: startOfDay, $lte: endOfDay } } },
      {
        $group: {
          _id: null,
          todayExpenses: { $sum: '$amount' },
        },
      },
    ]);

    const [salesResult, expensesResult] = await Promise.all([
      salesAggPromise,
      expensesAggPromise,
    ]);

    const salesTotals = salesResult[0]?.totals[0] || {};
    const salesItems = salesResult[0]?.items[0] || {};
    const expenseTotals = expensesResult[0] || {};

    const todayRevenue = salesTotals.todayRevenue || 0;
    const billsCount = salesTotals.billsCount || 0;
    const itemsSold = salesItems.itemsSold || 0;
    const todayExpenses = expenseTotals.todayExpenses || 0;
    const todayProfit = todayRevenue - todayExpenses;

    res.json({
      todayRevenue,
      todayExpenses,
      todayProfit,
      billsCount,
      itemsSold,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get formatted today's sales history
// @route   GET /api/dashboard/history
// @access  Private
const getTodayHistory = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setUTCHours(23, 59, 59, 999);

    const sales = await Sale.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    })
      .sort({ createdAt: -1 })
      .select('_id createdAt items totalAmount')
      .lean();

    const formattedHistory = sales.map((sale) => {
      // Format time (e.g. 10:42 AM)
      const timeStr = new Date(sale.createdAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC',
      });

      return {
        _id: sale._id,
        time: timeStr,
        items: sale.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal,
        })),
        totalAmount: sale.totalAmount,
      };
    });

    res.json(formattedHistory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getTodayHistory,
};
