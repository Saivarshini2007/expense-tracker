require('dotenv').config({ path: __dirname + '/.env' });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors({
  origin: "https://monumental-centaur-fd1d96.netlify.app"
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../Frontend')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/password', require('./routes/password'));
app.use('/api/admin', require('./routes/admin'));

app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/index.html'));
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected ✅');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000} ✅`);
    });
  })
  .catch(err => {
    console.log('DB connection error ❌:', err.message);
  });