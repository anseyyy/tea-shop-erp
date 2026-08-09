/**
   ==========================================================================
   TEASHOP ERP - API TO PAGE CONNECTIONS GUIDE
   ==========================================================================
   This file documents the exact mapping between frontend User Interface pages
   and the corresponding service functions from 'apiService.js'.
   
   Use this map as a guide to connect views/pages to the backend.
*/

import {
  authAPI,
  adminAPI,
  productAPI,
  salesAPI,
  expensesAPI,
  dashboardAPI,
  reportsAPI
} from './apiService';

export const PAGE_API_CONNECTIONS = {
  
  // 1. LOGIN & REGISTRATION VIEW
  // Target: /login or root landing page
  loginPage: {
    actions: {
      submitLogin: authAPI.login,       // Trigger on login button submit
      submitRegister: authAPI.register  // Trigger on user signup submit (if enabled)
    },
    storedState: {
      jwtToken: 'localStorage.setItem("token", response.token)',
      userData: 'localStorage.setItem("user", JSON.stringify(response))'
    }
  },

  // 2. ADMIN DASHBOARD VIEW
  // Target: /admin/dashboard
  adminDashboard: {
    queries: {
      loadStats: dashboardAPI.getStats,      // Renders: Revenue, Expenses, Net Profit, Bill Count, Items Sold
      loadHistory: dashboardAPI.getHistory   // Renders: Today's chronological sales timeline
    }
  },

  // 3. POINT OF SALE (POS) / BILLING VIEW
  // Target: /sales or /billing
  salesPOSPage: {
    queries: {
      loadProducts: productAPI.getProducts   // Loads tea/coffee item choices to compile bills
    },
    actions: {
      checkoutBill: salesAPI.createSale      // Submits selected items & quantities to backend
    }
  },

  // 4. ADMIN EXPENSES MANAGEMENT VIEW
  // Target: /admin/expenses
  expensesPage: {
    queries: {
      loadAllExpenses: expensesAPI.getExpenses,        // Renders complete expense history table
      loadTodayExpenses: expensesAPI.getTodayExpenses  // Renders today's business expenses count
    },
    actions: {
      addNewExpense: expensesAPI.createExpense,        // Submit new expense form
      modifyExpense: expensesAPI.updateExpense,        // Edit an existing expense
      removeExpense: expensesAPI.deleteExpense         // Delete an expense record
    }
  },

  // 5. REPORTS VIEW
  // Target: /admin/reports
  reportsPage: {
    queries: {
      fetchDaily: reportsAPI.getDaily,     // Daily summary metrics
      fetchWeekly: reportsAPI.getWeekly,   // Weekly (7 days) charts data
      fetchMonthly: reportsAPI.getMonthly  // Monthly revenue, expenses, net profit, & best seller
    }
  },

  // 6. ADMIN EMPLOYEE MANAGEMENT VIEW
  // Target: /admin/employees
  employeeManagementPage: {
    queries: {
      loadEmployees: adminAPI.getEmployees    // Fetch all employee accounts
    },
    actions: {
      addEmployee: adminAPI.createEmployee,   // Create new employee credentials
      editEmployee: adminAPI.updateEmployee,  // Modify employee credentials
      deleteEmployee: adminAPI.deleteEmployee // Remove employee credentials
    }
  }
};
