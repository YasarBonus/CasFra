const mongoose = require('mongoose');

const NotificationEmailQueueSchema = new mongoose.Schema({
    notificationId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    allDelivered: {
        type: Boolean,
        default: false
    },
    allDeliveredDate: {
        type: Date,
    },
    emailDelivered: {
        type: Boolean,
    },
    emailDeliveredDate: {
        type: Date,
    },
    emailDeliveredTo: {
        type: String,
    },
    updateTimestamp: {
        type: Date,
        default: Date.now
    },
});

const NotificationEmailQueue = mongoose.model('NotificationEmailQueue', NotificationEmailQueueSchema);

module.exports = NotificationEmailQueue;