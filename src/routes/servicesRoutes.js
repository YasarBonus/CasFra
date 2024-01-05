const express = require('express');
const router = express.Router();
const logger = require('../modules/winston.js');
const db = require('../db/database.js');

const checkPermissions = require('../middlewares/permissionMiddleware.js');

// We need the following API router endpoints:

// Get all services (super)
// Permissions: manageServices
// GET /
// This will return all services

/**
 * @openapi
 * /services/super:
 *   get:
 *     summary: Get all services
 *     tags: [Services, Super]
 *     security:
 *       - super: []
 */
router.get('/super', checkPermissions('manageServices'), async (req, res) => {
    try {
        const services = await db.Services.find().populate('type');
        res.json(services);
    } catch (err) {
        logger.error(err);
        res.status(500).json({ message: err.message });
    }
} );

/**
 * @openapi
 * /services:
 *   get:
 *     summary: Get all services of the current user
 *     tags: [Services]
 */
router.get('/', async (req, res) => {
    const userId = req.session.user.userId;

    try {
        const services = await db.ServicesActive.find({ user_id: userId }).populate('service').populate('service.type');
        
        if (services.length === 0) {
            res.status(404).json({ message: 'No services found for the user' });
        } else {
            res.json(services);
        }
    } catch (err) {
        logger.error(err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;