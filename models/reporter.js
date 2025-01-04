const mongoose = require('mongoose');

const reporterSchema = new mongoose.Schema({
  image: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Reporter', reporterSchema);
