const express = require('express');
const router = express.Router();
const logger = require('../modules/winston.js');
const db = require('../db/database.js');

const checkPermissions = require('../middlewares/permissionMiddleware.js');

// We need the following API router endpoints:

// Get all services
// Permissions: manageServices
// GET /
// This will return all services

router.get('/', checkPermissions('manageServices'), async (req, res) => {
    try {
        const services = await db.Services.find();
        res.json(services);
    } catch (err) {
        logger.error(err);
        res.status(500).json({ message: err.message });
    }
} );

module.exports = router;