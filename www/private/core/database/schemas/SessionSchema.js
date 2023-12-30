const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
    userId: String,
    username: String,
    ip: String,
    userAgent: String,
    timestamp: {
        type: Date,
        default: Date.now
    },
    socketId: String,
});

const Session = mongoose.model('Session', SessionSchema);

module.exports = Session;