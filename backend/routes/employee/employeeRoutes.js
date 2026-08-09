const express = require('express');
const { protect } = require('../../middleware/authMiddleware');
const router = express.Router();

// A simple profile check route for Employee (authenticated users)
router.get('/profile', protect, (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  });
});

module.exports = router;
