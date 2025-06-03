const express = require('express');
const router = express.Router();
const List = require('../models/List');
const Entry = require('../models/Entry');

// Create a new list
router.post('/lists', async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const list = new List({ title, description });
    await list.save();
    
    res.status(201).json(list);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create list' });
  }
});

// Get list by shareable ID
router.get('/lists/:shareableId', async (req, res) => {
  try {
    const list = await List.findOne({ shareableId: req.params.shareableId });
    
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }
    
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch list' });
  }
});

// Submit entry to a list
router.post('/lists/:shareableId/entries', async (req, res) => {
  try {
    const { name, rollNo } = req.body;
    const shareableId = req.params.shareableId;
    
    if (!name || !rollNo) {
      return res.status(400).json({ error: 'Name and roll number are required' });
    }

    // Check if list exists and get its _id
    const list = await List.findOne({ shareableId });
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    // Check for duplicate entry using the list's MongoDB _id
    const existingEntry = await Entry.findOne({ listId: list._id, rollNo });
    if (existingEntry) {
      return res.status(400).json({ error: 'Roll number already submitted' });
    }

    const entry = new Entry({ listId: list._id, name, rollNo });
    await entry.save();
    
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit entry' });
  }
});

// Get entries for a list
router.get('/lists/:shareableId/entries', async (req, res) => {
  try {
    // Find the list by shareable ID first
    const list = await List.findOne({ shareableId: req.params.shareableId });
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    const entries = await Entry.find({ listId: list._id })
      .sort({ submittedAt: 1 }); // Oldest first (first submitted appears first)
    
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

module.exports = router;
