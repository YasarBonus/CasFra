const mongoose = require('mongoose');
const TwitchWishListBot = require('./TwitchWishListBotSchema');
const { TwitchWishListBotSettings } = require('../../database');

const TwitchCommandBotMessagesSchema = new mongoose.Schema({
    globalIdentifier: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
});

const TwitchCommandBotMessages = mongoose.model('TwitchCommandBotMessages', TwitchCommandBotMessagesSchema);

const TwitchCommandBotSettingsSchema = new mongoose.Schema({
    botEnabled:
    {
        type: Boolean,
        required: true,
    },
    twitchUsername: {
        type: String,
    },
    twitchOauth: {
        type: String,
        required: true,
    },
    twitchChannel: {
        type: String,
        required: true,
    },
    maxWishLength: {
        type: Number,
        required: true,
    },
    messages: {
        type: [TwitchCommandBotMessagesSchema],
        required: true,
    },
});