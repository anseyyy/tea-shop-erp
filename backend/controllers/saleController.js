const Sale = require('../models/Sale');

// @desc    Create a new sale
// @route   POST /api/sales
// @access  Private
const createSale = async (req, res) => {
  const { items } = req.body;

  try {
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in the sale' });
    }

    let calculatedTotal = 0;
    const processedItems = items.map((item) => {
      const subtotal = item.price * item.quantity;
      calculatedTotal += subtotal;
      return {
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: subtotal,
      };
    });

    const sale = await Sale.create({
      items: processedItems,
      totalAmount: calculatedTotal,
      createdBy: req.user._id,
    });

    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private
const getSales = async (req, res) => {
  try {
    const sales = await Sale.find({}).sort({ createdAt: -1 }).populate('createdBy', 'name');
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get sale by ID
// @route   GET /api/sales/:id
// @access  Private
const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id).populate('createdBy', 'name');

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a sale
// @route   PUT /api/sales/:id
// @access  Private
const updateSale = async (req, res) => {
  const { items } = req.body;

  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    if (items) {
      let calculatedTotal = 0;
      const processedItems = items.map((item) => {
        const subtotal = item.price * item.quantity;
        calculatedTotal += subtotal;
        return {
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          subtotal: subtotal,
        };
      });
      sale.items = processedItems;
      sale.totalAmount = calculatedTotal;
    }

    const updatedSale = await sale.save();
    res.json(updatedSale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a sale
// @route   DELETE /api/sales/:id
// @access  Private/Admin
const deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    await Sale.deleteOne({ _id: req.params.id });
    res.json({ message: 'Sale removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get today's sales
// @route   GET /api/sales/today
// @access  Private
const getTodaySales = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setUTCHours(23, 59, 59, 999);

    const sales = await Sale.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ createdAt: -1 }).populate('createdBy', 'name');

    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createSale,
  getSales,
  getSaleById,
  updateSale,
  deleteSale,
  getTodaySales,
};

