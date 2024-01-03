const express = require('express');
const router = express.Router();
const logger = require('../modules/winston.js');
const db = require('../db/database.js');

const notificator = require('../services/notificationService.js');
const checkPermissions = require('../middlewares/permissionMiddleware.js');
const addNotification = notificator.addNotification;

const { editUser } = require('../modules/Users/editUser.js'); // Import the editUser function

/**
 * @openapi
 * /:
 *   get:
 *     summary: Get all Users
 *     tags: [Users, Super]
 */
router.get('/', checkPermissions('manageUsers'), (req, res) => {
        db.User.find().populate('group').populate('tenancy').populate('personal_details')
            .then((results) => {
                res.json(results);
            })
            .catch((error) => {
                console.error('Error retrieving users:', error);
                res.status(500).json({
                    error: 'Internal server error'
                });
            });
    });
    
/**
 * @openapi
 * /{id}:
 *   get:
 *     summary: Get details of a User by ID
 *     tags: [Users, Super]
 */
    router.get('/:id', checkPermissions('manageUsers'), (req, res) => {
        const {
            id
        } = req.params;
    
        db.User.findById(id).populate('group').populate('tenancy').populate('tenancies')
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
                console.error('Error retrieving user:', error);
                res.status(500).json({
                    error: 'Internal server error'
                });
            });
    });
  
/**
 * @openapi
 * /{id}:
 *   put:
 *     summary: Update a User by ID
 *     tags: [Users, Super]
 */
router.put('/:id', checkPermissions('manageUsers'), async (req, res) => {
    try {
        const { id } = req.params;
        const {
            username,
            nickname,
            email
        } = req.body;

        await editUser(req, res);

        // Überprüfen Sie, ob editUser bereits eine Antwort gesendet hat
        if (result !== undefined) {
            res.json({
                success: true
            });
        }

        res.json({
            success: true
        });
    } catch (error) {
        logger.error(error, error.stack);
    }
});

/**
 * @openapi
 * /{id}:
 *   delete:
 *     summary: Delete a User by ID
 *     tags: [Users, Super]
 */
router.delete('/:id', checkPermissions('manageUsers'), (req, res) => {
    const {
        id
    } = req.params; // Get the ID from the request body
    db.User.deleteOne({
            _id: id
        })
        .then((result) => {
            if (result.deletedCount === 0) {
                throw new Error('User not found');
            }
            res.json({
                success: true,
                id: id,
                status: 'deleted'
            });
            console.log('User deleted');
        })
        .catch((error) => {
            console.error('Error deleting user:', error);
            res.status(500).json({
                error: 'Internal server error'
            });
        });
});

  module.exports = router;