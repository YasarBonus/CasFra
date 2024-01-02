const mongoose = require('mongoose');

// Define Casino categories schema
const casinoCategoriesSchema = new mongoose.Schema({
    name: String,
    description: String,
    image: String,
    tenancies: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenancies'
    },
    active: {
      type: Boolean,
      default: true
    },
    priority: {
      type: Number
    },
    addedDate: {
      type: Date,
      default: Date.now
    },
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
  
  const CasinoCategories = mongoose.model('CasinoCategories', casinoCategoriesSchema);

  
module.exports = CasinoCategories;