const express = require('express');
const router = express.Router();
const logger = require('../modules/winston.js');
const db = require('../db/database.js');

const checkPermissions = require('../middlewares/permissionMiddleware.js');

// We need the following API router endpoints:

// Add a wish list item
// Permissions: manageTwitchWishListBotEntries
// POST /
// This will add a wish list item

router.post('/', checkPermissions('manageTwitchWishListBotEntries'), async (req, res) => {
    try {
        const wishList = new db.TwitchWishListBotEntries({
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

// Get all wish list items
// Permissions: manageTwitchWishListBotEntries
// GET /
// This will return all wish list items

router.get('/', checkPermissions('manageTwitchWishListBotEntries'), async (req, res) => {
    try {
        const wishList = await db.TwitchWishListBotEntries.find()

        // sort the wish list by created_at date in descending order
        wishList.sort((a, b) => b.created_at - a.created_at);

        res.json(wishList);
    } catch (err) {
        logger.error(err);
        res.status(500).json({ message: err.message });
    }
} );

// Get all wish list items with status = pending
// Permissions: none
// GET /
// This will return all wish list items with status = pending

router.get('/pending', checkPermissions('manageTwitchWishListBotEntries'), async (req, res) => {
    try {
        const wishList = await db.TwitchWishListBotEntries.find().sort({ status: { $in: ['playing', 'pending'] }, created_at: -1 });

        res.json(wishList);
    } catch (err) {
        logger.error(err);
        res.status(500).json({ message: err.message });
    }
} );

// Change the status of a wish list item to playing
// Permissions: manageTwitchWishListBotEntries
// POST /:id/playing
// This will change the status of the wish list item with id :id to playing

router.post('/:id/play', checkPermissions('manageTwitchWishListBotEntries'), async (req, res) => {
    try {
        const wishList = await db.TwitchWishListBotEntries.findById(req.params.id);
        wishList.status = 'playing';
        await wishList.save();
        res.json(wishList);
    } catch (err) {
        logger.error(err);
        res.status(500).json({ message: err.message });
    }
} );

// Change the status of a wish list item to completed
// Permissions: manageTwitchWishListBotEntries
// POST /:id/completed
// This will change the status of the wish list item with id :id to completed

router.post('/:id/complete', checkPermissions('manageTwitchWishListBotEntries'), async (req, res) => {
    try {
        const wishList = await db.TwitchWishListBotEntries.findById(req.params.id);
        wishList.status = 'completed';
        wishList.completed_at = Date.now();
        await wishList.save();
        res.json(wishList);
    } catch (err) {
        logger.error(err);
        res.status(500).json({ message: err.message });
    }
} );

// Change the status of a wish list item to rejected
// Permissions: manageTwitchWishListBotEntries
// POST /:id/rejected
// This will change the status of the wish list item with id :id to rejected

router.post('/:id/reject', checkPermissions('manageTwitchWishListBotEntries'), async (req, res) => {
    try {
        const wishList = await db.TwitchWishListBotEntries.findById(req.params.id);
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
// Permissions: manageTwitchWishListBotEntries
// POST /:id/pending
// This will change the status of the wish list item with id :id to pending

router.post('/:id/pend', checkPermissions('manageTwitchWishListBotEntries'), async (req, res) => {
    try {
        const wishList = await db.TwitchWishListBotEntries.findById(req.params.id);
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