const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const User = require('../models/User');

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ─── FORGOT PASSWORD ─────────────────────────────────────
router.post('/forgot', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    // Always return success even if email not found (security best practice)
    if (!user) {
      return res.json({ message: 'If this email exists, a reset link has been sent' });
    }

    // Generate a random reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    // Save token to user
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // Build reset URL
    const resetURL = `http://localhost:5000/reset-password.html?token=${resetToken}`;

    // Send email
    await transporter.sendMail({
      from: `"Expense Tracker" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
          <h2 style="color: #667eea;">Reset Your Password</h2>
          <p>Hi ${user.name},</p>
          <p>You requested to reset your password. Click the button below:</p>
          <a href="${resetURL}" 
             style="display: inline-block; padding: 12px 24px; 
                    background: linear-gradient(135deg, #667eea, #764ba2); 
                    color: white; text-decoration: none; 
                    border-radius: 8px; margin: 16px 0;">
            Reset Password
          </a>
          <p style="color: #888;">This link expires in <strong>1 hour</strong>.</p>
          <p style="color: #888;">If you didn't request this, ignore this email.</p>
        </div>
      `
    });

    res.json({ message: 'If this email exists, a reset link has been sent' });

  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── RESET PASSWORD ───────────────────────────────────────
router.post('/reset', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Find user with valid token that hasn't expired
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Clear reset token
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.json({ message: 'Password reset successful! You can now login.' });

  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;