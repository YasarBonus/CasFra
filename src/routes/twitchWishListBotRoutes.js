const express = require('express');
const router = express.Router();
const logger = require('../modules/winston.js');
const db = require('../db/database.js');

const checkPermissions = require('../middlewares/permissionMiddleware.js');

// We need the following API router endpoints:

// Add a wish list item
// Permissions: manageTwitchWishListBot
// POST /
// This will add a wish list item

router.post('/', checkPermissions('manageTwitchWishListBot'), async (req, res) => {
    try {
        const wishList = new db.TwitchWishListBot({
            wish: req.body.wish,
            twitch_user: req.body.twitch_user,
            created_at: Date.now(),
            status: 'pending',
            status_changed: Date.now(),
            added_manually: true,
        });
        await wishList.save();
        res.status(201).json(wishList);
    } catch (err) {
        logger.error(err);
        res.status(500).json({ message: err.message });
    }
} );

// Get all wish list items, apart from archived items
// Permissions: manageTwitchWishListBot
// GET /
// This will return all wish list items

router.get('/', checkPermissions('manageTwitchWishListBot'), async (req, res) => {
    try {
        const wishList = await db.TwitchWishListBot.find({ status: { $nin: ['completed', 'rejected'] } });

        // sort the wish list by created_at date in descending order
        wishList.sort((a, b) => b.created_at - a.created_at);

        res.json(wishList);
    } catch (err) {
        logger.error(err);
        res.status(500).json({ message: err.message });
    }
});

// Get all wish list items with status = pending
// Permissions: none
// GET /
// This will return all wish list items with status = pending

router.get('/pending', checkPermissions('manageTwitchWishListBot'), async (req, res) => {
    try {
        const wishList = await db.TwitchWishListBot.find().sort({ status: { $in: ['playing', 'pending'] }, created_at: -1 });

        res.json(wishList);
    } catch (err) {
        logger.error(err);
        res.status(500).json({ message: err.message });
    }
} );

// Pick a random pending wish list item and change the status to playing
// Permissions: manageTwitchWishListBot
// POST /random
// This will pick a random pending wish list item and change the status to playing

router.post('/random', checkPermissions('manageTwitchWishListBot'), async (req, res) => {
    try {
        const wishList = await db.TwitchWishListBot.find({ status: 'pending' });
        const randomWish = wishList[Math.floor(Math.random() * wishList.length)];
        randomWish.status = 'playing';
        await randomWish.save();
        res.json(randomWish);
    } catch (err) {
        logger.error(err);
        res.status(500).json({ message: err.message });
    }
} );

// Get all pending wishes and output as HTML
// Permissions: none
// GET /html/pendingwishes
// This will return all pending wish list items as HTML

router.get('/html/pendingwishes', async (req, res) => {
    try {
        const wishList = await db.TwitchWishListBot.find({ status: 'pending' });
        let html = '';
        wishList.forEach(wish => {
            html += `${wish.twitch_user}: ${wish.wish}<br>`;
        });
        html += '';
        res.send(html);
    } catch (err) {
        logger.error(err);
        res.status(500).json({ message: err.message });
    }
} );

// Show the currently playing wish list item as HTML
// Permissions: none
// GET /html/currentlyplaying
// This will return the currently playing wish list item as HTML

router.get('/html/currentlyplaying', async (req, res) => {
    try {
        const wishList = await db.TwitchWishListBot.findOne({ status: 'playing' });
        let html = '';
        if (wishList) {
            html = `<div style="background-color:#00ff00;height:150px"><p><img style="float: left;" src="https://yasarbonus.com/wp-content/uploads/2022/08/logo-egon-animated.gif" alt="Yasarbonus.com" width="135" height="135" /></p><br> <p><strong>N&auml;chster Wunsch:<br><br>${wishList.twitch_user} - ${wishList.wish}</strong></p></div>`;
        }
        res.send(html);
    } catch (err) {
        logger.error(err);
        res.status(500).json({ message: err.message });
    }
} );

// Change the status of a wish list item to playing
// Permissions: manageTwitchWishListBot
// POST /:id/playing
// This will change the status of the wish list item with id :id to playing

router.post('/:id/play', checkPermissions('manageTwitchWishListBot'), async (req, res) => {
    try {
        const wishList = await db.TwitchWishListBot.findById(req.params.id);
        wishList.status = 'playing';
        await wishList.save();
        res.json(wishList);
    } catch (err) {
        logger.error(err);
        res.status(500).json({ message: err.message });
    }
} );

// Change the status of a wish list item to completed
// Permissions: manageTwitchWishListBot
// POST /:id/completed
// This will change the status of the wish list item with id :id to completed

router.post('/:id/complete', checkPermissions('manageTwitchWishListBot'), async (req, res) => {
    try {
        const wishList = await db.TwitchWishListBot.findById(req.params.id);
        wishList.status = 'completed';
        wishList.completed_at = Date.now();
        wishList.archived = true;
        wishList.status_changed = Date.now();
        await wishList.save();
        res.json(wishList);
    } catch (err) {
        logger.error(err);
        res.status(500).json({ message: err.message });
    }
} );

// Change the status of a wish list item to rejected
// Permissions: manageTwitchWishListBot
// POST /:id/rejected
// This will change the status of the wish list item with id :id to rejected

router.post('/:id/reject', checkPermissions('manageTwitchWishListBot'), async (req, res) => {
    try {
        const wishList = await db.TwitchWishListBot.findById(req.params.id);
        wishList.status = 'rejected';
        wishList.completed_at = Date.now();
        await wishList.save();
        res.json(wishList);
    } catch (err) {
        logger.error(err);
        res.status(500).json({ message: err.message });
    }
} );

// Change the status of a wish list item to pending
// Permissions: manageTwitchWishListBot
// POST /:id/pending
// This will change the status of the wish list item with id :id to pending

router.post('/:id/pend', checkPermissions('manageTwitchWishListBot'), async (req, res) => {
    try {
        const wishList = await db.TwitchWishListBot.findById(req.params.id);
        wishList.status = 'pending';
        wishList.completed_at = undefined;
        await wishList.save();
        res.json(wishList);
    } catch (err) {
        logger.error(err);
        res.status(500).json({ message: err.message });
    }
} );



module.exports = router;