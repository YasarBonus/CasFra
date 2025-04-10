const mongoose = require('mongoose');

const UserPointsHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
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
    by_ip: {
        type: String,
    },
});

const UserPointsHistory = mongoose.model('UserPointsHistory', UserPointsHistorySchema);

module.exports = UserPointsHistory;