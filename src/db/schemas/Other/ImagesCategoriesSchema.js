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
    addedDate: {
        type: Date,
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
    },
    users: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

const ImagesCategories = mongoose.model('ImagesCategories', imagesCategoriesSchema);

module.exports = ImagesCategories;