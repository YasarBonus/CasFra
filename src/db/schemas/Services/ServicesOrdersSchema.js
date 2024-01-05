const mongoose = require('mongoose');

const ServicesOrdersStatusSchema = new mongoose.Schema({
    status: {
        type: String,
        required: true,
        enum: ['new', 'confirmed', 'awaitingVerification', 'verificationInProgres',
        'awaitingManualVerification', 'manualVerificationInProgress',
        'verified', 'awaitingPayment', 'paid',
        'processing', 'completed', 'cancelled'
        ],
        default: 'new',
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
});

const ServicesOrdersSchema = new mongoose.Schema({
    order_number: {
        type: String,
        required: true,
        unique: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenancies'
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Services'
    },
    interval: {
        type: String,
        required: true,
        enum: ['once', 'hourly', 'daily', 'weekly', 'monthly', 'yearly'],
    },
    creation_date: {
        type: Date,
    },
    creation_ip: {
        type: String,
    },
    creation_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
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