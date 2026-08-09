import BASE_URL from './baseURL';

// Helper to construct authorization header
const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Helper for sending JSON requests
const jsonRequest = async (url, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

// ==========================================
// 1. AUTHENTICATION MODULE
// ==========================================

export const authAPI = {
  /**
   * Login User (Admin / Employee)
   * @param {Object} credentials
   * @param {string} credentials.email
   * @param {string} credentials.password
   */
  login: (credentials) => {
    return jsonRequest(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Register User (General registration)
   * @param {Object} userData
   * @param {string} userData.name
   * @param {string} userData.email
   * @param {string} userData.password
   * @param {string} [userData.role] - 'admin' or 'employee' (defaults to 'employee')
   */
  register: (userData) => {
    return jsonRequest(`${BASE_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
};

// ==========================================
// 2. ADMIN EMPLOYEE CRUD MODULE
// ==========================================

export const adminAPI = {
  /**
   * Get all employee accounts (Admin Only)
   */
  getEmployees: () => {
    return jsonRequest(`${BASE_URL}/admin/employees`, {
      method: 'GET',
    });
  },

  /**
   * Create a new employee (Admin Only)
   * @param {Object} employeeData
   * @param {string} employeeData.name
   * @param {string} employeeData.email
   * @param {string} employeeData.password
   */
  createEmployee: (employeeData) => {
    return jsonRequest(`${BASE_URL}/admin/employees`, {
      method: 'POST',
      body: JSON.stringify(employeeData),
    });
  },

  /**
   * Update an employee (Admin Only)
   * @param {string} id - Employee User ID
   * @param {Object} updateData
   * @param {string} [updateData.name]
   * @param {string} [updateData.email]
   * @param {string} [updateData.password]
   */
  updateEmployee: (id, updateData) => {
    return jsonRequest(`${BASE_URL}/admin/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  /**
   * Delete an employee (Admin Only)
   * @param {string} id - Employee User ID
   */
  deleteEmployee: (id) => {
    return jsonRequest(`${BASE_URL}/admin/employees/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==========================================
// 3. PRODUCT CRUD MODULE
// ==========================================

export const productAPI = {
  /**
   * Get all products (Authenticated Admin / Employee)
   */
  getProducts: () => {
    return jsonRequest(`${BASE_URL}/products`, {
      method: 'GET',
    });
  },

  /**
   * Create a product (Admin Only)
   * NOTE: Expects FormData because of image file upload
   * @param {FormData} formData - Should contain keys: 'name', 'price', and 'image' (file)
   */
  createProduct: async (formData) => {
    const response = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: getAuthHeaders(), // Content-Type is set automatically by the browser for FormData
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Product creation failed');
    return data;
  },

  /**
   * Update a product (Admin Only)
   * NOTE: Expects FormData if updating image file
   * @param {string} id - Product ID
   * @param {FormData|Object} updateData - FormData (if sending file) or raw JSON Object
   */
  updateProduct: async (id, updateData) => {
    const isFormData = updateData instanceof FormData;
    const headers = isFormData ? getAuthHeaders() : { 'Content-Type': 'application/json', ...getAuthHeaders() };
    const body = isFormData ? updateData : JSON.stringify(updateData);

    const response = await fetch(`${BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers,
      body,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Product update failed');
    return data;
  },

  /**
   * Delete a product (Admin Only)
   * @param {string} id - Product ID
   */
  deleteProduct: (id) => {
    return jsonRequest(`${BASE_URL}/products/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==========================================
// 4. SALES MODULE
// ==========================================

export const salesAPI = {
  /**
   * Create a new sale (Authenticated Admin / Employee)
   * @param {Object} saleData
   * @param {Array} saleData.items
   * @param {string} saleData.items[].productId
   * @param {string} saleData.items[].name
   * @param {number} saleData.items[].price
   * @param {number} saleData.items[].quantity
   */
  createSale: (saleData) => {
    return jsonRequest(`${BASE_URL}/sales`, {
      method: 'POST',
      body: JSON.stringify(saleData),
    });
  },

  /**
   * Get all sales (Authenticated Admin / Employee)
   */
  getSales: () => {
    return jsonRequest(`${BASE_URL}/sales`, {
      method: 'GET',
    });
  },

  /**
   * Get today's sales (Authenticated Admin / Employee)
   */
  getTodaySales: () => {
    return jsonRequest(`${BASE_URL}/sales/today`, {
      method: 'GET',
    });
  },

  /**
   * Get a single sale by ID (Authenticated Admin / Employee)
   * @param {string} id - Sale ID
   */
  getSaleById: (id) => {
    return jsonRequest(`${BASE_URL}/sales/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Update a sale (Authenticated Admin / Employee)
   * @param {string} id - Sale ID
   * @param {Object} updateData
   * @param {Array} updateData.items - Updated items array
   */
  updateSale: (id, updateData) => {
    return jsonRequest(`${BASE_URL}/sales/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  /**
   * Delete a sale (Admin Only)
   * @param {string} id - Sale ID
   */
  deleteSale: (id) => {
    return jsonRequest(`${BASE_URL}/sales/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==========================================
// 5. EXPENSES MODULE
// ==========================================

export const expensesAPI = {
  /**
   * Create an expense (Admin Only)
   * @param {Object} expenseData
   * @param {number} expenseData.amount
   * @param {string} expenseData.description
   * @param {string} [expenseData.category]
   * @param {string} [expenseData.date] - Date string (YYYY-MM-DD)
   */
  createExpense: (expenseData) => {
    return jsonRequest(`${BASE_URL}/expenses`, {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  },

  /**
   * Get all expenses (Admin Only)
   */
  getExpenses: () => {
    return jsonRequest(`${BASE_URL}/expenses`, {
      method: 'GET',
    });
  },

  /**
   * Get today's expenses (Admin Only)
   */
  getTodayExpenses: () => {
    return jsonRequest(`${BASE_URL}/expenses/today`, {
      method: 'GET',
    });
  },

  /**
   * Get single expense by ID (Admin Only)
   * @param {string} id - Expense ID
   */
  getExpenseById: (id) => {
    return jsonRequest(`${BASE_URL}/expenses/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Update an expense (Admin Only)
   * @param {string} id - Expense ID
   * @param {Object} updateData
   * @param {number} [updateData.amount]
   * @param {string} [updateData.description]
   * @param {string} [updateData.category]
   * @param {string} [updateData.date]
   */
  updateExpense: (id, updateData) => {
    return jsonRequest(`${BASE_URL}/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  /**
   * Delete an expense (Admin Only)
   * @param {string} id - Expense ID
   */
  deleteExpense: (id) => {
    return jsonRequest(`${BASE_URL}/expenses/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==========================================
// 6. DASHBOARD & HISTORY MODULE
// ==========================================

export const dashboardAPI = {
  /**
   * Get today's dashboard stats (Authenticated Admin / Employee)
   * Returns: todayRevenue, todayExpenses, todayProfit, billsCount, itemsSold
   */
  getStats: () => {
    return jsonRequest(`${BASE_URL}/dashboard/stats`, {
      method: 'GET',
    });
  },

  /**
   * Get today's sales history list formatted (Authenticated Admin / Employee)
   * Returns: array of sales with formatted 'time' key
   */
  getHistory: () => {
    return jsonRequest(`${BASE_URL}/dashboard/history`, {
      method: 'GET',
    });
  },
};

// ==========================================
// 7. REPORTS MODULE
// ==========================================

export const reportsAPI = {
  /**
   * Get Daily Report (Authenticated Admin / Employee)
   * @param {string} [date] - Query date (YYYY-MM-DD), defaults to today
   */
  getDaily: (date) => {
    const query = date ? `?date=${date}` : '';
    return jsonRequest(`${BASE_URL}/reports/daily${query}`, {
      method: 'GET',
    });
  },

  /**
   * Get Weekly Report (Authenticated Admin / Employee)
   * @param {string} [date] - End-of-week query date (YYYY-MM-DD), defaults to today
   */
  getWeekly: (date) => {
    const query = date ? `?date=${date}` : '';
    return jsonRequest(`${BASE_URL}/reports/weekly${query}`, {
      method: 'GET',
    });
  },

  /**
   * Get Monthly Report (Authenticated Admin / Employee)
   * @param {number} [month] - Month number (1-12), defaults to current
   * @param {number} [year] - Year number, defaults to current
   */
  getMonthly: (month, year) => {
    const params = [];
    if (month) params.push(`month=${month}`);
    if (year) params.push(`year=${year}`);
    const query = params.length > 0 ? `?${params.join('&')}` : '';

    return jsonRequest(`${BASE_URL}/reports/monthly${query}`, {
      method: 'GET',
    });
  },
};
