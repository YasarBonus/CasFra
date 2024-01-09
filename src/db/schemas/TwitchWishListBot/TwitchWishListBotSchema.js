const mongoose = require('mongoose');

const TwitchWishListBotSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    twitchUsername: {
        type: String,
        },
    twitchToken: {
        type: String,
        },
    status: {
        type: String,
        required: true,
    },
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenancies',
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
});

const TwitchWishListBot = mongoose.model('TwitchWishListBot', TwitchWishListBotSchema);

module.exports = TwitchWishListBot;
