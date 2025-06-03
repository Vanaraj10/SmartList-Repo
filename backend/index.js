require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const smartlistRoutes = require('./routes/smartlist');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', smartlistRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'SmartList API is running!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
