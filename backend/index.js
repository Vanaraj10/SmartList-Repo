require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const https = require('https');
const http = require('http');
const connectDB = require('./config/db');
const smartlistRoutes = require('./routes/smartlist');
const List = require('./models/List');
const Entry = require('./models/Entry');

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

// Manual cleanup endpoint (for testing/admin purposes)
app.post('/admin/cleanup', async (req, res) => {
  try {
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    
    // Find lists older than 5 days
    const oldLists = await List.find({ createdAt: { $lt: fiveDaysAgo } });
    const listIds = oldLists.map(list => list._id);
    
    if (listIds.length === 0) {
      return res.json({
        message: 'No old lists found for cleanup',
        deletedLists: 0,
        deletedEntries: 0,
        timestamp: new Date().toISOString()
      });
    }
    
    // Delete associated entries first
    const deletedEntries = await Entry.deleteMany({ listId: { $in: listIds } });
    
    // Delete the old lists
    const deletedLists = await List.deleteMany({ _id: { $in: listIds } });
    
    res.json({
      message: 'Cleanup completed successfully',
      deletedLists: deletedLists.deletedCount,
      deletedEntries: deletedEntries.deletedCount,
      cutoffDate: fiveDaysAgo.toISOString(),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Manual cleanup error:', error);
    res.status(500).json({
      error: 'Cleanup failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
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

  // Database cleanup function to delete lists older than 5 days
  const cleanupOldLists = async () => {
    try {
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
      
      console.log(`Starting cleanup of lists older than ${fiveDaysAgo.toISOString()}`);
      
      // Find lists older than 5 days
      const oldLists = await List.find({ createdAt: { $lt: fiveDaysAgo } });
      const listIds = oldLists.map(list => list._id);
      
      if (listIds.length === 0) {
        console.log('No old lists found for cleanup');
        return;
      }
      
      // Delete associated entries first
      const deletedEntries = await Entry.deleteMany({ listId: { $in: listIds } });
      console.log(`Deleted ${deletedEntries.deletedCount} entries from old lists`);
      
      // Delete the old lists
      const deletedLists = await List.deleteMany({ _id: { $in: listIds } });
      console.log(`Deleted ${deletedLists.deletedCount} lists older than 5 days`);
      
      // Log cleanup summary
      console.log(`Cleanup completed - Lists: ${deletedLists.deletedCount}, Entries: ${deletedEntries.deletedCount}`);
      
    } catch (error) {
      console.error('Database cleanup error:', error);
    }
  };

  // Schedule cron job to run every 14 minutes for keep-alive
  cron.schedule('*/14 * * * *', () => {
    console.log('Running keep-alive ping at:', new Date().toISOString());
    keepAlive();
  });

  // Schedule daily cleanup at 2:00 AM
  // Cron pattern: 0 2 * * * (At 2:00 AM every day)
  cron.schedule('0 2 * * *', () => {
    console.log('Running daily database cleanup at:', new Date().toISOString());
    cleanupOldLists();
  });

  console.log('Keep-alive cron job scheduled to run every 14 minutes');
  console.log('Database cleanup scheduled to run daily at 2:00 AM');
});
