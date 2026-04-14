require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: "https://monumental-centaur-fd1d96.netlify.app",
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/password', require('./routes/password'));
app.use('/api/admin', require('./routes/admin'));

mongoose.connect(process.env.MONGO_URI)
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