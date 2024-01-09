const mongoose = require('mongoose');

const TwitchWishListBotEntriesSchema = new mongoose.Schema({
    twitch_user: {
        type: String,
        },
    wish: {
        type: String,
        required: true,
    },
    created_at: {
        type: Date,
        required: true,
    },
    completed_at: {
        type: Date,
        required: false,
    },
    status: {
        type: String,
        required: true,
    },
    status_changed: {
        type: Date,
        required: true,
    },
    added_manually: Boolean,
    bot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TwitchWishListBot',
    },
});

const TwitchWishListBotEntries = mongoose.model('TwitchWishListBotEntries', TwitchWishListBotEntriesSchema);

module.exports = TwitchWishListBotEntries;