const express = require('express');
const router = express.Router();
const logger = require('../modules/winston.js');
const db = require('../db/database.js');

const {
    addNotification
} = require('../services/notificationService.js');
const checkPermissions = require('../middlewares/permissionMiddleware.js');

/**
 * @openapi
 * /:userId:
 *   get:
 *     summary: Get points of a User by ID
 *     tags: [Points, Super]
 */
router.get('/:userId', checkPermissions('managePoints'), (req, res) => {
    const {
        userId
    } = req.params;

    db.UserPoints.findOne({
            user: userId
        })
        .then((result) => {
            if (!result) {
                res.status(404).json({
                    error: 'User not found'
                });
                return;
            }

            res.json(result);
        })
        .catch((error) => {
            console.error('Error retrieving user points:', error);
            res.status(500).json({
                error: 'Internal server error'
            });
        });
} );

module.exports = router;