const express = require('express');
const router = express.Router();
const logger = require('../modules/winston.js');
const db = require('../db/database.js');
const bcrypt = require('bcrypt');

const notificator = require('../services/notificationService.js');
const checkPermissions = require('../middlewares/permissionMiddleware.js');
const addNotification = notificator.addNotification;

// @swagger
// /api/auth/login:
//   post:
//     tags:
//       - Authentication
//     summary: Login
//     description: Login to the application
//     requestBody:
//       description: Login details
//       required: true
//       content:
//         application/json:
//           schema:
//             type: object
//             properties:
//               username:
//                 type: string
//                 description: Username
//                 example: admin
//               password:
//                 type: string
//                 description: Password
//                 example: admin
//               tenancy_id:
//                 type: string
//                 description: Tenancy Id
//                 example: 5f9c0b9b9b7e4c2b3c9b0b9b
//     responses:
//       200:
//         description: Login successful
//         content:
//           application/json:
//             schema:
//               type: object
//               properties:
//                 success:
//                   type: boolean
//                   description: Success
//                   example: true
//       400:
//         description: Bad request
//         content:
//           application/json:
//             schema:
//               type: object
//               properties:
//                 error:
//                   type: string
//                   description: Error message
//                   example: Password is required and must be a string
//       401:
//         description: Unauthorized
//         content:
//           application/json:
//             schema:
//               type: object
//               properties:
//                 error:
//                   type: string
//                   description: Error message
//                   example: Invalid username or password
//       500:
//         description: Internal server error
//         content:
//           application/json:
//             schema:
//               type: object
//               properties:
//                 error:
//                   type: string
//                   description: Error message
//                   example: Internal server error

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

            if (!user.active) {
                res.status(401).json({
                    error: 'User is not active'
                });
                return;
            }

            if (user.banned) {
                res.status(401).json({
                    error: 'User is banned'
                });
                return;
            }

            bcrypt.compare(password, user.password, (err, result) => {
                if (err) {
                    console.error('Error comparing passwords:', err);
                    res.status(500).json({
                        error: 'Internal server error'
                    });
                    return;
                }

                if (result) {
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
                                            console.error('Error updating user:', error);
                                            res.status(500).json({
                                                error: 'Internal server error'
                                            });
                                        });
                                } else {
                                    req.session.user = {
                                        userId: user._id,
                                        username: user.username,
                                        tenancy: user.tenancy,
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
                                        console.error('Error updating user:', error);
                                        res.status(500).json({
                                            error: 'Internal server error'
                                        });
                                    });
                            }
                        })
                        .catch((error) => {
                            console.error('Error retrieving user group:', error);
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
            console.error('Error retrieving user:', error);
            res.status(500).json({
                error: 'Internal server error'
            });
        });
});

// Get current session details
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

// Login as other user
router.post('/loginAs', checkPermissions('manageUsers'), (req, res) => {
    const {
        userId
    } = req.body;

    if (!userId) {
        res.status(400).json({
            error: 'User ID is required'
        });
        return;
    }

    db.User.findById(userId)
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
                    console.error('Error retrieving user group:', error);
                    res.status(500).json({
                        error: 'Internal server error'
                    });
                });
        })
        .catch((error) => {
            console.error('Error retrieving user:', error);
            res.status(500).json({
                error: 'Internal server error'
            });
        });
});

// Get all sessions from MongoDB
router.get('/sessions', checkPermissions('manageSessions'), (req, res) => {
    db.Session.find()
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

// Logout user
router.post('/logout', checkPermissions('authenticate'), (req, res) => {
    const { userId, username } = req.session.user;

    req.session.destroy((error) => {
        if (error) {
            console.error('Error destroying session:', error);
            res.status(500).json({
                error: 'Internal server error'
            });
            logger.error('Error destroying session for user ' + username + '(' + userId + '):' + error);
        } else {
            res.json({
                success: true
            });
            logger.info('User ' + username + '(' + userId + ') logged out');
        }
    });
});

module.exports = router;