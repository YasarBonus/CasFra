const mongoose = require('mongoose');

// Define Casino features schema
const casinoFeaturesSchema = new mongoose.Schema({
    name: String,
    description: {
      type: String,
      default: ''
    },
    image: String,
    active: {
      type: Boolean,
      default: true
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