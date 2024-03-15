const mongoose = require('mongoose');

// Define Casino provider schema
const casinoProviderSchema = new mongoose.Schema({
    name: String,
    description: String,
    image: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Images'
    },
    tenancies: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Tenancies'
    },
    active: {
      type: Boolean,
      default: true
    },
    addedDate: {
      type: Date,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    modifiedDate: Date,
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
  });
  
  const CasinoProvider = mongoose.model('CasinoProvider', casinoProviderSchema);

module.exports = CasinoProvider;