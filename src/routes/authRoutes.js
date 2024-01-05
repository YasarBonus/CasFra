const express = require('express');
const router = express.Router();
const logger = require('../modules/winston.js');
const db = require('../db/database.js');
const bcrypt = require('bcrypt');
const bodymen = require('bodymen');

const notificator = require('../services/notificationService.js');
const checkPermissions = require('../middlewares/permissionMiddleware.js');
const addNotification = notificator.addNotification;

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Create a new session
 *     tags: [Authentication]
 *     security:
 *       - session: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               tenancy:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Successful login
 *       '400':
 *         description: Invalid request body
 *       '401':
 *         description: Invalid username or password
 *       '500':
 *         description: Internal server error
 */
router.post('/login', (req, res) => {
    const {
        username,
        password,
        tenancy
    } = req.body;

    if (!password || typeof password !== 'string') {
        res.status(400).json({
            error: 'Password is required and must be a string'
        });
        return;
    }

    if (!username || typeof username !== 'string') {
        res.status(400).json({
            error: 'Username is required and must be a string'
        });
        return;
    }

    db.User.findOne({
            username
        })
        .then((user) => {
            if (!user) {
                res.status(401).json({
                    error: 'Invalid username or password'
                });
                return;
            }

            if (!user.status.active === true) {
                res.status(401).json({
                    error: 'User is not active'
                });
                return;
            }

            if (user.status.banned) {
                res.status(401).json({
                    error: 'User is banned'
                });
                return;
            }

            bcrypt.compare(password, user.password, (err, result) => {
                if (err) {
                    logger.error('Error comparing passwords:', err);
                    res.status(500).json({
                        error: 'Internal server error'
                    });
                    return;
                }

                if (result) {
                    db.UserGroup.findOne({
                            _id: user.group._id
                        })
                        .then((userGroup) => {
                            if (!userGroup) {
                                res.status(500).json({
                                    error: 'User group not found'
                                });
                                logger.warn(`User group not found for user ${user.username} (${user._id})`);
                                return;
                            }

                            if (tenancy && typeof tenancy === 'string') {
                                // Check if the tenancy is in the user's tenancies
                                if (user.tenancies.includes(tenancy)) {
                                    req.session.user = {
                                        userId: user._id,
                                        username: user.username,
                                        tenancy: tenancy,
                                        permissions: userGroup.permissions
                                    };

                                    // Update the tenancy in the database
                                    user.tenancy = tenancy;
                                    user.last_login = new Date();
                                    user.last_login_ip = req.ip;
                                    user.save()
                                        .then(() => {
                                            // Add notification after successful login
                                            addNotification(user._id, 'info', 'Login successful', 'You have successfully logged in', 'email');

                                            res.json({
                                                success: true
                                            });
                                        })
                                        .catch((error) => {
                                            logger.error('Error updating user:', error);
                                            res.status(500).json({
                                                error: 'Internal server error'
                                            });
                                        });
                                } else {
                                    req.session.user = {
                                        userId: user._id,
                                        username: user.username,
                                        tenancy: user.default_tenancy,
                                        permissions: userGroup.permissions
                                    };

                                    // Add notification after successful login
                                    addNotification(user._id, 'info', 'Login successful', 'You have successfully logged in', 'email');

                                    res.json({
                                        success: true
                                    });
                                }
                            } else {
                                // No tenancy provided, remove tenancy in the database
                                user.tenancy = undefined;
                                user.last_login = new Date();
                                user.last_login_ip = req.ip;

                                user.save()
                                    .then(() => {
                                        req.session.user = {
                                            userId: user._id,
                                            username: user.username,
                                            permissions: userGroup.permissions
                                        };

                                        // Add notification after successful login
                                        addNotification('Login successful', user._id);

                                        res.json({
                                            success: true
                                        });
                                    })
                                    .catch((error) => {
                                        logger.error('Error updating user:', error);
                                        res.status(500).json({
                                            error: 'Internal server error'
                                        });
                                    });
                            }
                        })
                        .catch((error) => {
                            logger.error('Error retrieving user group:', error);
                            res.status(500).json({
                                error: 'Internal server error'
                            });
                        });
                } else {
                    res.status(401).json({
                        error: 'Invalid username or password'
                    });
                }
            });
        })
        .catch((error) => {
            logger.error('Error retrieving user:', error);
            res.status(500).json({
                error: 'Internal server error'
            });
        });
});

/**
 * @openapi
 * /auth/session:
 *   get:
 *     summary: Get details of the current session
 *     tags: [Authentication]
 *     security:
 *       - session: []
 *     responses:
 *       '200':
 *         description: Successful session retrieval
 *       '401':
 *         description: No session found
 */
router.get('/session', checkPermissions('authenticate'), (req, res) => {
    const sessionDetails = req.session.user;

    if (sessionDetails) {
        res.json(sessionDetails);
    } else {
        res.status(401).json({
            error: 'No session found'
        });
    }
});

/**
 * @openapi
 * /auth/loginAs/{userId}:
 *   post:
 *     summary: Login as another user
 *     tags: [Authentication, Super]
 *     security:
 *       - session: []
 *     responses:
 *       '200':
 *         description: Successful login as another user
 *       '400':
 *         description: Invalid request body
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Internal server error
 */
router.post('/loginAs/:userId', checkPermissions('manageUsers'), bodymen.middleware({
    userId: {
        type: String,
        required: true
    }
}), (req, res) => {
    const {
        userId
    } = req.params;

    if (!userId) {
        res.status(400).json({
            error: 'User ID is required'
        });
        return;
    }

    User.findById(userId)
        .then((user) => {
            if (!user) {
                res.status(404).json({
                    error: 'User not found'
                });
                return;
            }

            db.UserGroup.findOne({
                    _id: user.groupId
                })
                .then((userGroup) => {
                    if (!userGroup) {
                        res.status(500).json({
                            error: 'User group not found'
                        });
                        return;
                    }

                    req.session.user = {
                        userId: user._id,
                        username: user.username,
                        permissions: userGroup.permissions
                    };

                    res.json({
                        success: true
                    });
                })
                .catch((error) => {
                    logger.error('Error retrieving user group:', error);
                    res.status(500).json({
                        error: 'Internal server error'
                    });
                });
        })
        .catch((error) => {
            logger.error('Error retrieving user:', error);
            res.status(500).json({
                error: 'Internal server error'
            });
        });
});

/**
 * @openapi
 * /auth/sessions:
 *   get:
 *     summary: Get all sessions of all users
 *     tags: [Authentication, Super]
 *     security:
 *       - session: []
 *     responses:
 *       '200':
 *         description: Successful session retrieval
 *       '500':
 *         description: Internal server error
 */
router.get('/sessions', checkPermissions('manageSessions'), (req, res) => {
    Session.find()
        .then((results) => {
            res.json(results);
        })
        .catch((error) => {
            logger.error('Error retrieving sessions:', error);
            res.status(500).json({
                error: 'Internal server error'
            });
        });
});

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - session: []
 *     responses:
 *       '200':
 *         description: Successful logout
 *       '500':
 *         description: Internal server error
 */
router.post('/logout', checkPermissions('authenticate'), (req, res) => {
    const {
        userId,
        username
    } = req.session.user;

    req.session.destroy((error) => {
        if (error) {
            logger.error('Error destroying session:', error);
            res.status(500).json({
                error: 'Internal server error'
            });
            logger.error(`Error destroying session for user ${username} (${userId}): ${error}`);
        } else {
            res.json({
                success: true
            });
            logger.info(`User ${username} (${userId}) logged out`);
        }
    });
});

module.exports = router;