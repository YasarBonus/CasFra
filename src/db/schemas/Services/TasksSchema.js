const mongoose = require('mongoose');

const TasksStatusSchema = new mongoose.Schema({
    status: {
        type: String,
        required: true,
        enum: ['queued', 'starting', 'running', 'completed', 'failed'],
        default: 'queued',
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
});

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
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServicesOrders'
    },
    date: {
        type: Date,
        default: Date.now
    },
    status: TasksStatusSchema,
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