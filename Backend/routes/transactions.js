const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const authMiddleware = require('../middleware/auth');

// GET all transactions
router.get('/', authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id })
      .sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    console.error('Get transactions error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET summary
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id });

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    res.json({
      income,
      expense,
      balance: income - expense
    });
  } catch (err) {
    console.error('Summary error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST add transaction
router.post('/', authMiddleware, async (req, res) => {
  const { type, amount, category, description, date } = req.body;

  try {
    const transaction = new Transaction({
      userId: req.user.id,
      type,
      amount,
      category,
      description,
      date: date || Date.now()
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    console.error('Add transaction error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE transaction
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await transaction.deleteOne();
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    console.error('Delete transaction error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;