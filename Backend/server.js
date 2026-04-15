require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/password', require('./routes/password'));
app.use('/api/admin', require('./routes/admin'));

mongoose.connect("mongodb+srv://saivarshini_db_user:ksv%402024@expense-tracker-cluster.dxrhrks.mongodb.net/?appName=expense-tracker-cluster")
  .then(() => {
    console.log('MongoDB connected ✅');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} ✅`);
    });
  })
  .catch(err => {
    console.log('DB connection error ❌:', err.message);
  });