const mongoose = require('mongoose');

const TwitchWishListBotMessagesSchema = new mongoose.Schema({
    identifier: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
});

const TwitchWishListBotMessages = mongoose.model('TwitchWishListBotMessages', TwitchWishListBotMessagesSchema);

const TwitchWishListBotSettingsSchema = new mongoose.Schema({
    twitch_username: {
        type: String,
        },
    twitch_oauth: {
        type: String,
        required: true,
    },
    twitch_channel: {
        type: String,
        required: true,
    },
    messages: {
        type: [TwitchWishListBotMessagesSchema],
        required: true,
    },
});

const TwitchWishListBotSettings = mongoose.model('TwitchWishListBotSettings', TwitchWishListBotSettingsSchema);

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
    archived: {
        type: Boolean,
        default: false,
    }
});

const TwitchWishListBot = mongoose.model('TwitchWishListBot', TwitchWishListBotSchema);

// add default messages and settings to the database

const defaultMessages = [
    {
        identifier: 'wishAdded',
        message: '@{twitch_user}, dein Wunsch wurde zur Wunschliste hinzugefügt!',
    },
    {
        identifier: 'wishListEmpty',
        message: '@{twitch_user}, in der Wunschliste befinden sich keine Wünsche!',
    },
    {
        identifier: 'wishList',
        message: '@{twitch_user}, {wish.twitch_user} wünscht sich {wish.wish}!',
    },
    {
        identifier: 'wishPlaying',
        message: '@{twitch_user}, dein Wunsch "{wish.wish}" wird gerade gespielt!',
    },
    {
        identifier: 'wishPending',
        message: '@{twitch_user}, du hast dir am {wish.created_at} "{wish.wish}" gewünscht!',
    },
    {
        identifier: 'help',
        message: '@${tags.username}, die Befehle sind: !wish <Wunsch>, !wishes, !allwishes, !help',
    }
];  

const defaultSettings = {
    twitch_username: 'yasaramadeusslotzart',
    twitch_oauth: 'oauth:qp3nsvl2sjl5ng0ju6bm3cw08ebvg5',
    twitch_channel: 'yasar92',
    messages: defaultMessages,
};

async function addDefaultMessages() {
    try {
        // Check if there are any messages
        const twitchWishListBotMessages = await TwitchWishListBotMessages.find();
        if (twitchWishListBotMessages.length === 0) {
            // Add the default messages to the database
            defaultMessages.forEach(async message => {
                const newMessage = new TwitchWishListBotMessages({
                    identifier: message.identifier,
                    message: message.message,
                });
                await newMessage.save();
            });
        }
    } catch (error) {
        console.error('Error adding default messages:', error);
    }
}

async function addDefaultSettings() {
    try {
        // Check if there are any settings
        const twitchWishListBotSettings = await TwitchWishListBotSettings.find();
        if (twitchWishListBotSettings.length === 0) {
            // Add the default settings to the database
            const newSettings = new TwitchWishListBotSettings({
                twitch_username: defaultSettings.twitch_username,
                twitch_oauth: defaultSettings.twitch_oauth,
                twitch_channel: defaultSettings.twitch_channel,
                messages: defaultSettings.messages,
            });
            await newSettings.save();
        }
    } catch (error) {
        console.error('Error adding default settings:', error);
    }
}

addDefaultMessages();
addDefaultSettings();

module.exports = TwitchWishListBot, TwitchWishListBotMessages, TwitchWishListBotSettings;