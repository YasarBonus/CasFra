const mongoose = require('mongoose');

const imagesSchema = new mongoose.Schema({
    name: String,
    filename: String,
    originalname: String,
    image_url: String,
    size: Number,
    mimetype: String,
    description: String,
    addedDate: {
      type: Date,
    },
    added_by: String,
    modified_date: Date,
    modified_user: String,
    category: String,
    description: String,
    active: {
      type: Boolean,
      default: true
    },
    priority: {
      type: Number,
      default: 0
    },
    tenancies: [String],
  });
  
  const Images = mongoose.model('Images', imagesSchema);

module.exports = Images;