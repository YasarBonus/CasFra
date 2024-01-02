const mongoose = require('mongoose');
const generateRandomPriority = require('../../utils/generateRandomPriority');

const ProductsSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3,
        maxlength: 100
    },
    description: {
        type: String,
        maxlength: 1000
    },
    priority: {
        type: Number,
        default: generateRandomPriority()
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
        default: false
    },
    newProduct: {
        type: Boolean,
        default: false
    },
    label: {
        type: String,
        maxlength: 100
    },
});

const ProductsRecurring = mongoose.model('Products', ProductsSchema);

module.exports = ProductsRecurring;