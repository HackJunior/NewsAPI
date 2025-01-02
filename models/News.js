const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  tags: [{type: String,required: true}],
  image: {type: String, required: true},
  timesreaded: {type: Number,default:0},
  urlIdTitle: {type: String},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
},{ timestamps: true });

module.exports = mongoose.model('News', newsSchema);
