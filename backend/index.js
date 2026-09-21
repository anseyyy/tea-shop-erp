const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./dbconnect/db');

const compression = require('compression');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json());

// Response-time instrumentation middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    res.setHeader('X-Response-Time', `${duration}ms`);
    if (duration > 100) {
      console.warn(`[SLOW ROUTE WARN] ${req.method} ${req.originalUrl} - ${duration}ms`);
    }
  });
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth/authRoutes'));
app.use('/api/admin', require('./routes/admin/adminRoutes'));
app.use('/api/employee', require('./routes/employee/employeeRoutes'));
app.use('/api/products', require('./routes/product/productRoutes'));
app.use('/api/sales', require('./routes/sale/saleRoutes'));
app.use('/api/expenses', require('./routes/expense/expenseRoutes'));
app.use('/api/dashboard', require('./routes/dashboard/dashboardRoutes'));
app.use('/api/reports', require('./routes/report/reportRoutes'));

// Simple root route
app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
