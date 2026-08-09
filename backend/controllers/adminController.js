const User = require('../models/User');

// @desc    Create a new employee
// @route   POST /api/admin/employees
// @access  Private/Admin
const createEmployee = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const employeeExists = await User.findOne({ email });

    if (employeeExists) {
      return res.status(400).json({ message: 'Employee with this email already exists' });
    }

    const employee = await User.create({
      name,
      email,
      password,
      role: 'employee', // Force role to employee
    });

    res.status(201).json({
      _id: employee._id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all employees
// @route   GET /api/admin/employees
// @access  Private/Admin
const getEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee' }).select('-password');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update employee
// @route   PUT /api/admin/employees/:id
// @access  Private/Admin
const updateEmployee = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const employee = await User.findById(req.params.id);

    if (employee && employee.role === 'employee') {
      employee.name = name || employee.name;
      employee.email = email || employee.email;
      
      if (password) {
        employee.password = password;
      }

      const updatedEmployee = await employee.save();
      res.json({
        _id: updatedEmployee._id,
        name: updatedEmployee.name,
        email: updatedEmployee.email,
        role: updatedEmployee.role,
      });
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete employee
// @route   DELETE /api/admin/employees/:id
// @access  Private/Admin
const deleteEmployee = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);

    if (employee && employee.role === 'employee') {
      await User.deleteOne({ _id: employee._id });
      res.json({ message: 'Employee removed successfully' });
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createEmployee,
  getEmployees,
  updateEmployee,
  deleteEmployee,
};
