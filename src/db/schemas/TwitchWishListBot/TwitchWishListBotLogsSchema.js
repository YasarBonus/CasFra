const mongoose = require('mongoose');

const TwitchWishListBotLogsSchema = new mongoose.Schema({
    bot: {
        type: Object,
        required: false,
    },
    date: {
        type: Date,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    level: {
        type: String,
        required: true,
    },
});

const TwitchWishListBotLogs = mongoose.model('TwitchWishListBotLogs', TwitchWishListBotLogsSchema);

module.exports = TwitchWishListBotLogs;