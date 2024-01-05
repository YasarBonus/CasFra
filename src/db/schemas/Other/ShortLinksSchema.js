const mongoose = require('mongoose');
const generateRandomPriority = require('../../../utils/generateRandomPriority');



// Define shortLinks Schema
const shortLinksSchema = new mongoose.Schema({
    url: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 20
    },
    shortUrl: String,
    description: {
      type: String,
      maxlength: 100
    },
    tenancies: {
      type: [mongoose.Schema.Types.ObjectId],
      required: true
    },
    addedDate: {
      type: Date,
      default: Date.now,
      required: true
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    modifiedDate: Date,
    modifiedBy: mongoose.Schema.Types.ObjectId,
    active: {
      type: Boolean,
      default: true
    },
    priority: {
      type: Number,
      default: generateRandomPriority()
    },
    attachedTo: {
      type: mongoose.Schema.Types.ObjectId,
    },
    hits: {
      type: Number,
      default: 0
    }
  });
  
  const ShortLinks = mongoose.model('ShortLinks', shortLinksSchema);

module.exports = ShortLinks;