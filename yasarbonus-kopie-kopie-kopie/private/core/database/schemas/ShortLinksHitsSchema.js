const mongoose = require('mongoose');
const generateRandomPriority = require('../../utils/generateRandomPriority');


// Define shortLinksHits Schema
const shortLinksHitsSchema = new mongoose.Schema({
    shortLink: String,
    ip: String,
    userAgent: String,
    tenancies: [String],
  
    timestamp: {
      type: Date,
      default: Date.now
    }
  });
  
  const ShortLinksHits = mongoose.model('ShortLinksHits', shortLinksHitsSchema);

module.exports = ShortLinksHits;