const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ServicesOrdersStatusSchema = new Schema({
    status: {
        type: String,
        required: true,
        default: 'pending',
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
});

const ServicesOrders = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    service: {
        type: Schema.Types.ObjectId,
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
});

module.exports = ServicesOrders = mongoose.model('servicesOrders', ServicesOrders);