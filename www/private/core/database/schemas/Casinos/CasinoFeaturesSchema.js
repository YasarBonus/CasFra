const mongoose = require('mongoose');
const generateRandomPriority = require('../../../utils/generateRandomPriority');

// Define Casino features schema
const casinoFeaturesSchema = new mongoose.Schema({
    name: String,
    description: String,
    image: String,
    active: {
      type: Boolean,
      default: true
    },
    priority: {
      type: Number,
      default: generateRandomPriority()
    },
    addedDate: {
      type: Date,
      default: Date.now
    },
    addedBy: String,
    modifiedDate: Date,
    modifiedBy: String,
    tenancies: [String],
  });
  
  const CasinoFeatures = mongoose.model('CasinoFeatures', casinoFeaturesSchema);


module.exports = CasinoFeatures;