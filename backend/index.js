require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const https = require('https');
const http = require('http');
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

// Keep-alive endpoint
app.get('/keep-alive', (req, res) => {
  res.json({ 
    message: 'Server is alive!', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
    // Keep-alive function to prevent server from sleeping
  const keepAlive = () => {
    const baseUrl = process.env.RENDER_EXTERNAL_URL || process.env.HEROKU_APP_URL || `http://localhost:${PORT}`;
    const url = `${baseUrl}/keep-alive`;
    
    try {
      const protocol = url.startsWith('https') ? https : http;
      
      protocol.get(url, (res) => {
        console.log(`Keep-alive ping successful - Status: ${res.statusCode}`);
      }).on('error', (err) => {
        console.log('Keep-alive ping failed:', err.message);
      });
    } catch (error) {
      console.log('Keep-alive error:', error.message);
    }
  };

  // Schedule cron job to run every 14 minutes
  // Cron pattern: */14 * * * * (every 14 minutes)
  cron.schedule('*/14 * * * *', () => {
    console.log('Running keep-alive ping at:', new Date().toISOString());
    keepAlive();
  });

  console.log('Keep-alive cron job scheduled to run every 14 minutes');
});
