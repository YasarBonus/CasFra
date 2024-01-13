const mongoose = require('mongoose');
const generateRandomPriority = require('../../../utils/generateRandomPriority');


// Define Casino tags schema
const casinoTagsSchema = new mongoose.Schema({
    name: String,
    description: String,
    image: String,
    imageUrl: String,
    active: {
      type: Boolean,
      default: true
    },
    tenancies: [String],
  });
  
  const CasinoTags = mongoose.model('CasinoTags', casinoTagsSchema);

  module.exports = CasinoTags;