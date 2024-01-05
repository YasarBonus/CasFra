const mongoose = require('mongoose');

const UserPointsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    points: {
        type: Number,
        default: 0,
    },
});

const UserPoints = mongoose.model('UserPoints', UserPointsSchema);

const UserPointsHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    points: {
        type: Number,
        default: 0,
    },
    before: {
        type: Number,
        default: 0,
    },
    diff: {
        type: Number,
        default: 0,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    reason: {
        type: String,
        default: 'none',
    },
    by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
});

const UserPointsHistory = mongoose.model('UserPointsHistory', UserPointsHistorySchema);

module.exports = {
    UserPoints,
    UserPointsHistory,
};

