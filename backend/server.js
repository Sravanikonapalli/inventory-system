require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const productsRouter = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/products', productsRouter);

app.get('/api/health', (req, res) => res.json({
  ok: true,
  time: new Date().toISOString()
}));

// Start server
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
