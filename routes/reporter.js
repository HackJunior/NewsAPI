const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Reporter = require('../models/reporter');


router.post('/reporters', async (req, res) => {
  const { image, email, name } = req.body;

  if (!image || !email || !name) {
    return res.status(400).json({ message: 'Image, email, and name are required' });
  }

  try {
    const newReporter = new Reporter({ image, email, name });
    await newReporter.save();
    res.status(201).json({ message: 'Reporter created successfully', reporter: newReporter });
  } catch (err) {
    res.status(500).json({ message: 'Error creating reporter', error: err.message });
  }
});
router.get('/reporters', async (req, res) => {
  try {
    const reporters = await Reporter.find();
    res.status(200).json(reporters);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reporters', error: err.message });
  }
});
router.get('/reporters/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    const reporter = await Reporter.findById(id);
    if (!reporter) {
      return res.status(404).json({ message: 'Reporter not found' });
    }
    res.status(200).json(reporter);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reporter', error: err.message });
  }
});
router.put('/reporters/:id', async (req, res) => {
  const { id } = req.params;
  const { image, email, name } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    const updatedReporter = await Reporter.findByIdAndUpdate(
      id,
      { image, email, name },
      { new: true, runValidators: true }
    );

    if (!updatedReporter) {
      return res.status(404).json({ message: 'Reporter not found' });
    }

    res.status(200).json({ message: 'Reporter updated successfully', reporter: updatedReporter });
  } catch (err) {
    res.status(500).json({ message: 'Error updating reporter', error: err.message });
  }
});
router.delete('/reporters/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    const deletedReporter = await Reporter.findByIdAndDelete(id);

    if (!deletedReporter) {
      return res.status(404).json({ message: 'Reporter not found' });
    }

    res.status(200).json({ message: 'Reporter deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting reporter', error: err.message });
  }
});

module.exports = router;
