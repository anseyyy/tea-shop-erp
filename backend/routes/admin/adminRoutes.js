const express = require('express');
const { protect, adminOnly } = require('../../middleware/authMiddleware');
const {
  createEmployee,
  getEmployees,
  updateEmployee,
  deleteEmployee,
} = require('../../controllers/adminController');

const router = express.Router();

// All routes here require verification of JWT and Admin role
router.use(protect);
router.use(adminOnly);

router.route('/employees')
  .post(createEmployee)
  .get(getEmployees);

router.route('/employees/:id')
  .put(updateEmployee)
  .delete(deleteEmployee);

module.exports = router;
