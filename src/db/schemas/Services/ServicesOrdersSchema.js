const mongoose = require('mongoose');

const ServicesOrdersStatusSchema = new mongoose.Schema({
    status: {
        type: String,
        required: true,
        default: 'new',
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
});

const ServicesOrdersSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'services'
    },
    creation_date: {
        type: Date,
    },
    creation_ip: {
        type: String,
    },
    status: ServicesOrdersStatusSchema,
    completed: {
        type: Boolean,
        default: false,
    },
    completed_date: {
        type: Date,
    },
});

const ServicesOrders = mongoose.model('ServicesOrders', ServicesOrdersSchema);

module.exports = ServicesOrders;