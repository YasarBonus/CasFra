// The request is to write a twitch bot for a casino wishlisting system
// The bot will listen to the chat and respond to commands
//
// Commands:
// !wish <wish> - adds a game to the wishlist with the twitch_user, status "pending" and the current date
// !wish list - lists all the games in the wishlist

const db = require('../db/database.js');
const logger = require('../modules/winston.js');

require('dotenv').config();

const errorHandler = require('../modules/errorHandler.js');

const tmi = require('tmi.js');

const client = new tmi.Client({
    connection: {
        secure: true,
        reconnect: true
    },
    identity: {
        username: process.env.YASAR_TWITCH_BOT_USERNAME,
        password: process.env.YASAR_TWITCH_BOT_PASSWORD,
    },
    channels: [process.env.YASAR_TWITCH_BOT_CHANNEL]
});

client.connect();

client.on('message', (channel, tags, message, self) => {
    if (self) return;

    const commandName = message.trim();

    if (commandName.startsWith('!allwishes')) {
        listWishes(channel, tags);
    } else if (commandName.startsWith('!wishes')) {
        listUserWishes(channel, tags);
    } else if (commandName.startsWith('!wish')) {
        const wish = commandName.slice(6).trim();

        if (wish.length === 0) {
            client.say(channel, `@${tags.username}, du musst einen Wunsch angeben!`);
        } else if (wish.length < 5) {
            client.say(channel, `@${tags.username}, dein Wunsch ist zu kurz!`);
        } else {
            console.log('Wish:', wish);
            addWish(channel, tags, wish);
        }
    }
});

// addWish function
// 1. get all wishes of the user from the db
// 2. check if the user has a pending wish
// 3. if yes, send a message to the chat that the user already has a pending wish
// 4. if no, check if the user has a completed wish in the last 10 minutes
// 5. if yes, send a message to the chat that the user already has a completed wish in the last 10 minutes
// 6. if no, add the wish to the db with the twitch_user, status "pending" and the current date
// 7. send a message to the chat that the wish has been added to the wishlist

async function addWish(channel, tags, wish) {
    try {
        // Get all the wishes of the user from the db
        const TwitchWishListBotEntries = await db.TwitchWishListBotEntries.find({ twitch_user: tags.username });

        // Check if the user has a pending wish
        const pendingWish = TwitchWishListBotEntries.find(wish => wish.status === 'pending' || wish.status === 'playing');

        if (pendingWish) {
            client.say(channel, `@${tags.username}, in deiner Wunschliste befindet sich bereits ein Wunsch!`);
        } else {
            // Check if the user has a completed wish in the last 10 minutes
            const completedWish = TwitchWishListBotEntries.find(wish => wish.status === 'completed' && wish.completed_at > Date.now() - 10 * 60 * 1000);

            if (completedWish) {
                client.say(channel, `@${tags.username}, dir wurde bereits ein Wunsch in den letzten 10 Minuten erfüllt!`);
            } else {
                // Add the wish to the db with the twitch_user, status "pending" and the current date
                const newWish = new db.TwitchWishListBotEntries({
                    wish: wish,
                    twitch_user: tags.username,
                    created_at: Date.now(),
                    status: 'pending',
                    status_changed: Date.now(),
                    added_manually: true,
                });
                await newWish.save();

                // Send a message to the chat that the wish has been added to the wishlist
                // client.say(channel, `@${tags.username}, dein Wunsch wurde zur Wunschliste hinzugefügt!`);
            }
        }
    } catch (error) {
        logger.error('Error adding wish:', error);
    }
}

async function listWishes(channel, tags) {
    try {
        // Get all the wishes from the db
        const TwitchWishListBotEntries = await db.TwitchWishListBotEntries.find();

        // Check if there are any wishes
        if (TwitchWishListBotEntries.length === 0) {
            client.say(channel, `@${tags.username}, in der Wunschliste befinden sich keine Wünsche!`);
        } else {
            // Loop through the wishes and send them to the chat
            TwitchWishListBotEntries.forEach(wish => {
                client.say(channel, `@${tags.username}, ${wish.twitch_user} wünscht sich ${wish.wish}!`);
            });
        }
    } catch (error) {
        logger.error('Error listing wishes:', error);
    }
}

// list user wishes by twitch username
async function listUserWishes(channel, tags) {
    try {
        // Get all the wishes from the db
        const TwitchWishListBotEntries = await db.TwitchWishListBotEntries.find({ twitch_user: tags.username, status: 'pending' });

        // Check if there are any wishes
        if (TwitchWishListBotEntries.length === 0) {
            client.say(channel, `@${tags.username}, in der Wunschliste befinden sich keine Wünsche!`);
        } else {
            // Loop through the wishes and send them to the chat
            TwitchWishListBotEntries.forEach(wish => {
                client.say(channel, `@${tags.username}, du hast dir am ${wish.created_at} "${wish.wish}" gewünscht!`);
            });
        }
    } catch (error) {
        logger.error('Error listing wishes:', error);
    }
}
