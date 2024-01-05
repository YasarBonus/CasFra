const mongoose = require('mongoose');

const ServicesActiveStatus = new mongoose.Schema({
    active: {
        type: Boolean,
        default: false,
        required: false
    },
    active_date: {
        type: Date,
        maxlength: 50
    },
    locked: {
        type: Boolean,
        default: false
    },
    locked_date: {
        type: Date,
        maxlength: 50
    },
    abused: {
        type: Boolean,
        default: false
    },
    abused_date: {
        type: Date,
        maxlength: 50
    },
    cancelled: {
        type: Boolean,
        default: false
    },
    cancelled_date: {
        type: Date,
        maxlength: 50
    },
    terminated: {
        type: Boolean,
        default: false
    },
    terminated_date: {
        type: Date,
        maxlength: 50
    },
});

const ServicesActiveSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenancies'
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Services',
        required: true,
    },
    creation_date: {
        type: Date,
    },
    start_date: {
        type: Date,
    },
    end_date: {
        type: Date,
    },
    interval: {
        type: String,
        enum: ['once', 'second', 'minute', 'hour', 'day', 'week', 'month', 'year'],
    },
    next_due_date: {
        type: Date,
    },
    status: {
        type: ServicesActiveStatus
    },
});

const ServicesActive = mongoose.model('ServicesActive', ServicesActiveSchema);

module.exports = ServicesActive;