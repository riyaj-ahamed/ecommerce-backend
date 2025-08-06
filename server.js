require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/orders', orderRoutes);

(async () => {
  try {
    await db.query('SELECT 1');
    console.log('✅ MySQL DB connected');
  } catch (err) {
    console.error('❌ MySQL not connected:', err);
  }
})();

app.get('/', (req, res) => {
  res.send('API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
