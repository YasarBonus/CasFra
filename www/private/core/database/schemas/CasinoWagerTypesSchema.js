const mongoose = require('mongoose');
const generateRandomPriority = require('../../utils/generateRandomPriority');


// Define Casino wager types schema
const casinoWagerTypesSchema = new mongoose.Schema({
    name: String,
    short: String,
    description: String,
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
  
  const CasinoWagerTypes = mongoose.model('CasinoWagerTypes', casinoWagerTypesSchema);

  
module.exports = CasinoWagerTypes;