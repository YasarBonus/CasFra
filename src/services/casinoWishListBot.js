// The request is to write a twitch bot for a casino wishlisting system
// The bot will listen to the chat and respond to commands
//
// Commands:
// !wish <wish> - adds a game to the wishlist with the twitch_user, status "pending" and the current date
// !wish list - lists all the games in the wishlist

const db = require('../db/database.js');
const logger = require('../modules/winston.js');

const errorHandler = require('../modules/errorHandler.js');

const tmi = require('tmi.js');

const client = new tmi.Client({
    connection: {
        secure: true,
        reconnect: true
    },
    identity: {
        username: 'yasaramadeusslotzart',
        password: 'oauth:b4mhxfwoqnwnf7amlstwgzu8j4xayn'
    },
    channels: ['yasar92']
    });

client.connect();

client.on('message', (channel, tags, message, self) => {
    if (self) return;

    const commandName = message.trim();

    if (commandName.startsWith('!wishlist')) {
        listWishes(channel, tags);
        
    } else if (commandName.startsWith('!wish')) {
        const wish = commandName.slice(6).trim();

        if (wish.length === 0) {
            client.say(channel, `@${tags.username}, you need to specify a wish!`);
        } else {
            console.log('Wish:', wish);
            addWish(channel, tags, wish);
        }
    }
} );

// addWish function
// a user can only add one wish at a time
// and only one wish per 10 minutes
async function addWish(channel, tags, wish) {
    try {
        // Check if the user already has a wish in the db
        const casinoWishListBot = await db.CasinoWishListBot.findOne({
            twitch_user: tags.username
        });

        // Check if the user has a wish in the db and if it's been 10 minutes since the last wish
        if (casinoWishListBot && (Date.now() - casinoWishListBot.created_at) < 600000) {
            client.say(channel, `@${tags.username}, you can only add one wish per 10 minutes! Please wait ${Math.round((600000 - (Date.now() - casinoWishListBot.created_at)) / 60000)} minutes and ${Math.round((600000 - (Date.now() - casinoWishListBot.created_at)) / 1000) % 60} seconds!`);
        } else
        if (casinoWishListBot) {
            client.say(channel, `@${tags.username}, you already have a pending wish in the wishlist: ${casinoWishListBot.wish}!`);
        } else {
            // Create a new wish in the db
            await db.CasinoWishListBot.create({
                twitch_user: tags.username,
                wish,
                created_at: Date.now(),
                status: 'pending',
                status_changed: Date.now(),
            });

            client.say(channel, `@${tags.username}, your wish has been added to the wishlist!`);
        }
    }
    catch (error) {
        logger.error('Error adding wish:', error);
    }
}

async function listWishes(channel, tags) {
    try {
        // Get all the wishes from the db
        const casinoWishListBot = await db.CasinoWishListBot.find();

        // Check if there are any wishes
        if (casinoWishListBot.length === 0) {
            client.say(channel, `@${tags.username}, there are no wishes in the wishlist!`);
        } else {
            // Loop through the wishes and send them to the chat
            casinoWishListBot.forEach(wish => {
                client.say(channel, `@${tags.username}, ${wish.twitch_user} wishes for ${wish.wish}!`);
            });
        }
    } catch (error) {
        logger.error('Error listing wishes:', error);
    }
}