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

    // Fetch today's data
    const sales = await Sale.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    const expenses = await Expense.find({
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    // Calculations
    const todayRevenue = sales.reduce((acc, sale) => acc + sale.totalAmount, 0);
    const todayExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
    const todayProfit = todayRevenue - todayExpenses;
    
    const billsCount = sales.length;
    
    let itemsSold = 0;
    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        itemsSold += item.quantity;
      });
    });

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
    }).sort({ createdAt: -1 });

    const formattedHistory = sales.map((sale) => {
      // Format time (e.g. 10:42 AM)
      const timeStr = sale.createdAt.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC',
      });

      return {
        _id: sale._id,
        time: timeStr,
        items: sale.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal
        })),
        totalAmount: sale.totalAmount
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
