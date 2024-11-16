const mongoose = require('mongoose');
const { Schema } = mongoose;

const SurveySchema = new Schema({
    title: { type: String, required: true },
    isActive: { type: Boolean, default: false }, 
    yesVotes: { type: Number, default: 0 }, 
    noVotes: { type: Number, default: 0 },  
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
},{ timestamps: true });

module.exports = mongoose.model('Survey', SurveySchema);

