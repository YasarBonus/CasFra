const mongoose = require('mongoose');



const TwitchWishListBotSchema = new mongoose.Schema({
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
});

const TwitchWishListBot = mongoose.model('TwitchWishListBot', TwitchWishListBotSchema);

module.exports = TwitchWishListBot;