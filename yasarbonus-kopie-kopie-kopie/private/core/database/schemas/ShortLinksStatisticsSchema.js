const mongoose = require('mongoose');
const generateRandomPriority = require('../../utils/generateRandomPriority');


// Define shortLinksStatistics Schema
const shortLinksStatisticsSchema = new mongoose.Schema({
    shortLink: String,
    hits: Number,
    uniqueHits: Number,
    hits1h: Number,
    hits3h: Number,
    hits6h: Number,
    hits12h: Number,
    hits24h: Number,
    hits7d: Number,
    hits30d: Number,
    hits12m: Number,
    timestamp: {
      type: Date,
      default: Date.now
    },
    tenancies: [String],
  });
  
  const ShortLinksStatistics = mongoose.model('ShortLinksStatistics', shortLinksStatisticsSchema);

module.exports = ShortLinksStatistics;