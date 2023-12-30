
const mongoose = require('mongoose');
const generateRandomPriority = require('../../utils/generateRandomPriority');


// Define Casino licenses schema
const casinoLicensesSchema = new mongoose.Schema({
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
  
  const CasinoLicenses = mongoose.model('CasinoLicenses', casinoLicensesSchema);
  
    exports.CasinoLicenses = CasinoLicenses;