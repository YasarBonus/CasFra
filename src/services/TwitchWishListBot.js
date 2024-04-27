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

// retrieve the messages from the database and store them in an array

const messages = [];

async function getMessages() {
    try {
        const twitchWishListBotMessages = await db.TwitchWishListBotMessages.find();

        twitchWishListBotMessages.forEach(message => {
            messages.push(message.message);
            messages.push(message.identifier);
        });
    } catch (error) {
        logger.error('Error getting messages:', error);
    } finally {
        console.log('Messages:', messages);
    }
}

getMessages();


client.on('message', (channel, tags, message, self) => {
    if (self) return;

    if (process.env.NODE_ENV === 'development') {
        botPrefix = "!dev";
        botInfo = "[DEV] ";
      } else if (process.env.NODE_ENV === 'production') {
        botPrefix = "!";
        botInfo = "";
      }

    const commandName = message.trim();

    if (commandName.startsWith(botPrefix + 'help')) {
        client.say(channel, `${botInfo}@${tags.username}, die Befehle sind: !wish <Wunsch>, !wishes, !allwishes, !deletewish`);
    }
    } else if (commandName.startsWith(botPrefix + 'wishes')) {
        listUserWishes(channel, tags);
    } else if (commandName.startsWith(botPrefix + 'wish')) {
        const wish = commandName.slice(6).trim();

        if (wish.length === 0) {
            client.say(channel, `${botInfo}@${tags.username}, du musst einen Wunsch angeben!`);
        } else if (wish.length < 1) {
            client.say(channel, `${botInfo}@${tags.username}, dein Wunsch ist zu kurz (min. 1 Zeichen)!`);
        } else if (wish.length > 25) {
            client.say(channel, `${botInfo}@${tags.username}, Bitte wünsch dir eine Slot, einen Roman kannst du privat verfassen.`);
        } else {
            console.log('Wish:', wish);
            addWish(channel, tags, wish);
        }
    } else if (commandName.startsWith(botPrefix + 'deletewish')) {
        deleteWish(channel, tags);
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
        const twitchWishListBot = await db.TwitchWishListBot.find({ twitch_user: tags.username });

        // Check if the user has a pending wish
        const pendingWish = twitchWishListBot.find(wish => wish.status === 'pending' || wish.status === 'playing');

        if (pendingWish) {
            client.say(channel, `${botInfo}@${tags.username}, in der Wunschliste befindet sich bereits ein Wunsch von dir! Verwende !wishes um deine Wünsche anzuzeigen, oder !deletewish um deinen Wunsch aus der Warteschlange zu löschen!`);
        } else {
            // Check if the user has a completed wish in the last 10 minutes
            const completedWish = twitchWishListBot.find(wish => wish.status === 'completed' && wish.completed_at > Date.now() - 10 * 60 * 1000);

            if (completedWish) {
                client.say(channel, `${botInfo}@${tags.username}, dir wurde bereits ein Wunsch in den letzten 10 Minuten erfüllt!`);
            } else {
                // Add the wish to the db with the twitch_user, status "pending" and the current date
                const newWish = new db.TwitchWishListBot({
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
        const twitchWishListBot = await db.TwitchWishListBot.find();

        // Check if there are any wishes
        if (twitchWishListBot.length === 0) {
            client.say(channel, `${botInfo}@${tags.username}, in der Wunschliste befinden sich keine Wünsche!`);
        } else {
            // Loop through the wishes and send them to the chat
            twitchWishListBot.forEach(wish => {
                client.say(channel, `${botInfo}@${tags.username}, ${wish.twitch_user} wünscht sich ${wish.wish}!`);
            });
        }
    } catch (error) {
        logger.error('Error listing wishes:', error);
    }
}

// list user wishes by twitch username
async function listUserWishes(channel, tags) {
    try {
        // Get all the wishes from the db with status pending or playing
        const twitchWishListBot = await db.TwitchWishListBot.find({ twitch_user: tags.username, status: { $in: ['pending', 'playing'] } });

        // Check if there are any wishes
        if (twitchWishListBot.length === 0) {
            client.say(channel, `${botInfo}@${tags.username}, in deiner Wunschliste befinden sich keine Wünsche!`);
        } else {
            // Loop through the wishes and send them to the chat
            twitchWishListBot.forEach(wish => {
                if (wish.status === 'playing') {
                    client.say(channel, `${botInfo}@${tags.username}, dein Wunsch "${wish.wish}" wird gerade gespielt!`);
                } else  if (wish.status === 'pending') {
                    client.say(channel, `${botInfo}@${tags.username}, du hast dir am ${wish.created_at} "${wish.wish}" gewünscht!`);
                }
            });
        }
    } catch (error) {
        logger.error('Error listing wishes:', error);
    }
}

// Delete the pending wish of the user
async function deleteWish(channel, tags) {
    try {
        // Get the pending wish of the user from the db
        const twitchWishListBot = await db.TwitchWishListBot.find({ twitch_user: tags.username, status: 'pending' });

        // Check if the user has a pending wish
        if (twitchWishListBot.length === 0) {
            client.say(channel, `${botInfo}@${tags.username}, in der Wunschliste befindet sich kein Wunsch von dir!`);
        } else {
            // Delete the pending wish of the user from the db
            await db.TwitchWishListBot.deleteOne({ twitch_user: tags.username, status: 'pending' });

            // Send a message to the chat that the wish has been deleted from the wishlist
            client.say(channel, `${botInfo}@${tags.username}, dein Wunsch wurde aus der Wunschliste gelöscht!`);
        }
    } catch (error) {
        logger.error('Error deleting wish:', error);
    }
}
