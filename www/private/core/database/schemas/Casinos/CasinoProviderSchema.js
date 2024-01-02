const mongoose = require('mongoose');
const generateRandomPriority = require('../../../utils/generateRandomPriority');

// Define Casino provider schema
const casinoProviderSchema = new mongoose.Schema({
    name: String,
    description: String,
    image: String,
    imageUrl: String,
    tenancies: [String],
  
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
    modifiedBy: String
  });
  
  const CasinoProvider = mongoose.model('CasinoProvider', casinoProviderSchema);

module.exports = CasinoProvider;