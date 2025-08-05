require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db'); // using mysql2/promise
const orderRoutes = require('./routes/orderRoutes'); // assuming you placed your placeOrder logic here

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/orders', orderRoutes);

// Test DB connection
(async () => {
  try {
    await db.query('SELECT 1');
    console.log('✅ MySQL DB connected');
  } catch (err) {
    console.error('❌ MySQL not connected:', err);
  }
})();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
