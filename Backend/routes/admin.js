const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const authMiddleware = require('../middleware/auth');

// Simple admin check — first registered user is admin
// OR you can hardcode your email
const ADMIN_EMAIL = 'saivarshinik123@gmail.com'; // ← put YOUR email here

async function adminMiddleware(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.email !== ADMIN_EMAIL) {
      return res.status(403).json({ message: 'Admin access only' });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

// GET all users with stats
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    // Add transaction count to each user
    const usersWithCount = await Promise.all(users.map(async (user) => {
      const transactionCount = await Transaction.countDocuments({ userId: user._id });
      return { ...user.toObject(), transactionCount };
    }));

    // Overall stats
    const totalTransactions = await Transaction.countDocuments();
    const allTransactions = await Transaction.find({ type: 'income' });
    const totalIncome = allTransactions.reduce((sum, t) => sum + t.amount, 0);

    res.json({
      users: usersWithCount,
      stats: {
        totalUsers: users.length,
        totalTransactions,
        totalIncome
      }
    });

  } catch (err) {
    console.error('Admin get users error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE a user and all their transactions
router.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete all their transactions first
    await Transaction.deleteMany({ userId: req.params.id });

    // Then delete the user
    await user.deleteOne();

    res.json({ message: 'User and all transactions deleted' });

  } catch (err) {
    console.error('Admin delete error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;