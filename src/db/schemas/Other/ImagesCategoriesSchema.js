const mongoose = require('mongoose');
const generateRandomPriority = require('../../../utils/generateRandomPriority');

const imagesCategoriesSchema = new mongoose.Schema({
    name: String,
    description: String,
    image: String,
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
    addedBy: {
        type: String,
        ref: 'User'
    },
    modifiedDate: Date,
    modifiedBy: {
        type: String,
        ref: 'User'
    },
    tenancies: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenancies'
    }
});

const ImagesCategories = mongoose.model('ImagesCategories', imagesCategoriesSchema);

module.exports = ImagesCategories;