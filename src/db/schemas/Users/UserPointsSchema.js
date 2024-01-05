const mongoose = require('mongoose');

const UserPointsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    points: {
        type: Number,
        default: 0,
    },
    last_update: {
        type: Date,
        default: Date.now,
    },
    last_tx: {
        type: mongoose.Schema.Types.ObjectId,
    },
});

const UserPoints = mongoose.model('UserPoints', UserPointsSchema);

module.exports = UserPoints;
