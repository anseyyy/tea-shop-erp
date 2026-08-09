const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./dbconnect/db');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

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
