const mongoose = require('mongoose');

const NotificationEmailsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    subject: String,
    message: String,
    type: {
        type: String,
        default: 'info'
    },
    transporter: {
        type: String,
        default: 'all'
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    read: {
        type: Boolean,
        default: false
    },
    readDate: {
        type: Date,
    },
    emailDelivered: {
        type: Boolean,
        default: false
    },
    emailDeliveredDate: {
        type: Date,
    },
    emailDeliveredTo: {
        type: String,
    },
});

const NotificationEmails = mongoose.model('NotificationEmails', NotificationEmailsSchema);

module.exports = NotificationEmails;