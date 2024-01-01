
const mongoose = require('mongoose');
const generateRandomPriority = require('../../utils/generateRandomPriority');


// Define Casino licenses schema
const casinoLicensesSchema = new mongoose.Schema({
    name: String,
    description: String,
    image: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Images'
    },
    imageUrl: String,
    tenancies: {
      type: [mongoose.Schema.Types.ObjectId],
      embed: 'Tenancies'
    },
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
    // addedBy user (embedded)
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    modifiedDate: Date,
    modifiedBy: {
      type: String,
      ref: 'User'
    }
  });
  
  const CasinoLicenses = mongoose.model('CasinoLicenses', casinoLicensesSchema);
  
module.exports = CasinoLicenses;