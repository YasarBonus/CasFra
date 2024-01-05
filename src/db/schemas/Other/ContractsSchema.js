const mongoose = require('mongoose');
const generateRandomPriority = require('../../../utils/generateRandomPriority');

const ContractsSchema = new mongoose.Schema({
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
    orderDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    tenancy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Tenancies'
    },
    modifiedDate: Date,
    modifiedBy: mongoose.Schema.Types.ObjectId,
    active: {
        type: Boolean,
        default: false
    },
    startDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    endDate: Date,
    recurringProduct: {
        type: Boolean,
        default: false
    },
    label: {
        type: String,
        maxlength: 100
    },
});