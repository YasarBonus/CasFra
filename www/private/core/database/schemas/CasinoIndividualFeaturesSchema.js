const mongoose = require('mongoose');
const generateRandomPriority = require('../../utils/generateRandomPriority');

// Define Casino individual features schema
const casinoIndividualFeaturesSchema = new mongoose.Schema({
    name: String,
    description: String,
    image: String,
    casino: String,
    active: {
      type: Boolean,
      default: true
    },
    priority: {
      type: Number,
      default: 0
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
  
  const CasinoIndividualFeatures = mongoose.model('CasinoIndividualFeatures', casinoIndividualFeaturesSchema);

    exports.CasinoIndividualFeatures = CasinoIndividualFeatures;