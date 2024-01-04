const mongoose = require('mongoose');

const CasinoWishListBotSchema = new mongoose.Schema({
    round: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CasinoWishListRound',
    },
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

const CasinoWishListBot = mongoose.model('CasinoWishListBot', CasinoWishListBotSchema);

module.exports = CasinoWishListBot;