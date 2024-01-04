const mongoose = require('mongoose');

const ServicesOrdersLogsSchema = new mongoose.Schema({
    order: {
        type: Schema.Types.ObjectId,
        ref: 'servicesOrders'
    },
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
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    message: {
        type: String,
    },
});

const ServicesOrdersLogs = mongoose.model('ServicesOrdersLogs', ServicesOrdersLogsSchema);

module.exports = ServicesOrdersLogs;