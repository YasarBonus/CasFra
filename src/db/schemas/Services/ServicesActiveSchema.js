const mongoose = require('mongoose');

const ServicesActiveStatus = new mongoose.Schema({
    active: {
        type: Boolean,
        default: false,
        required: false
    },
    locked: {
        type: Boolean,
        default: false
    },
    online: {
        type: Boolean,
        default: false
    },
    abused: {
        type: Boolean,
        default: false
    },
    updated: {
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
    next_due_date: {
        type: Date,
    },
    status: {
        type: ServicesActiveStatus
    },
});

const ServicesActive = mongoose.model('ServicesActive', ServicesActiveSchema);

module.exports = ServicesActive;