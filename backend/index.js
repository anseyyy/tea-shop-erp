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

  // Attach response time header before headers are sent to the client
  const originalEnd = res.end;
  res.end = function (...args) {
    if (!res.headersSent) {
      const duration = Date.now() - start;
      res.setHeader('X-Response-Time', `${duration}ms`);
    }
    return originalEnd.apply(this, args);
  };

  // Log slow routes on response completion without setting headers
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 100) {
      console.warn(`[SLOW ROUTE WARN] ${req.method} ${req.originalUrl} - ${duration}ms`);
    }
  });

  next();
});

// Lightweight health check endpoint for monitoring and Render port scanning
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Simple root route
app.get('/', (req, res) => {
  res.send('API is running...');
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

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err);
  if (res.headersSent) {
    return next(err);
  }
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});

