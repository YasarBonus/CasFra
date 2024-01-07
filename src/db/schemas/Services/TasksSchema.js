const mongoose = require('mongoose');

const TasksLogsSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now
    },
    message: {
        type: String,
        required: true
    },
    level: {
        type: String,
        enum: ['info', 'warning', 'error'],
        default: 'info'
    }
});

const TasksSchema = new mongoose.Schema({
    id: {
        type: String,
    },
    name: {
        type: String,
    },
    description: String,
    completed: {
        type: Boolean,
        default: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenants'
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Services'
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServicesOrders'
    },
    date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['queued', 'starting', 'running', 'completed', 'failed'],
        default: 'queued'
    },
    pid: {
        type: Number,
    },
    exitCode: {
        type: Number,
    },
    exitSignal: {
        type: String,
    },
    logs: [TasksLogsSchema]
});

mongoose.model('Tasks', TasksSchema);

module.exports = mongoose.model('Tasks');