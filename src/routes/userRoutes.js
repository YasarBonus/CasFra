const express = require('express');
const router = express.Router();
const logger = require('../modules/winston.js');
const db = require('../db/database.js');

const notificator = require('../services/notificationService.js');
const checkPermissions = require('../middlewares/permissionMiddleware.js');
const addNotification = notificator.addNotification;


/**
 * @openapi
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 */
router.post('/register', (req, res) => {
    const {
        username,
        password,
        passwordRepeat,
        email,
        language,
        registrationKey
    } = req.body;

    if (!username) {
        res.status(400).json({
            error: 'Username is required'
        });
        return;
    }

    if (!email) {
        res.status(400).json({
            error: 'Email is required'
        });
        return;
    }

    if (!registrationKey) {
        res.status(400).json({
            error: 'Registration key is required'
        });
        return;
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9]{3,10}$/;
    if (!usernameRegex.test(username)) {
        res.status(400).json({
            error: 'Username must contain only numbers and letters, with a length between 3 and 10 characters'
        });
        return;
    }

    // Validate E-Mail format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(400).json({
            error: 'Invalid email format'
        });
        return;
    }

    db.RegistrationKey.findOne({
            regkey: registrationKey
        })
        .then((existingKey) => {
            if (!existingKey) {
                res.status(400).json({
                    error: 'Invalid registration key'
                });
            } else if (existingKey.used) {
                res.status(400).json({
                    error: 'Registration key already used'
                });
            } else {
                db.User.findOne({
                        $or: [{
                            username: username
                        }, {
                            email: email
                        }]
                    })
                    .then((existingUser) => {
                        if (existingUser) {
                            if (existingUser.username === username) {
                                res.status(400).json({
                                    error: 'Username already exists'
                                });
                            } else {
                                res.status(400).json({
                                    error: 'Email already exists'
                                });
                            }
                        } else {
                            if (!password) {
                                res.status(400).json({
                                    error: 'Password is required'
                                });
                                return;
                            }

                            if (password !== passwordRepeat) {
                                res.status(400).json({
                                    error: 'Passwords do not match'
                                });
                                return;
                            }

                            bcrypt.hash(password, 10, (err, hash) => {
                                if (err) {
                                    console.error('Error hashing password:', err);
                                    res.status(500).json({
                                        error: 'Internal server error'
                                    });
                                    return;
                                }

                                const registrationVerificationCodeExpiry = new Date();
                                registrationVerificationCodeExpiry.setHours(registrationVerificationCodeExpiry.getHours() + 1);

                                const generateVerificationCode = () => {
                                    const code = Math.floor(100000 + Math.random() * 900000);
                                    return code.toString();
                                };

                                const registrationVerificationCode = generateVerificationCode();
                                const registrationDate = new Date(); // Add registration date

                                const user = new db.User({
                                    username: username,
                                    password: hash,
                                    emails: {
                                        email: email,
                                        is_primary: true
                                    },
                                    language: language || 'en', // Set default value to "en" if not provided
                                    personalDetails: {},
                                    personalAddresses: {},
                                    registration: {
                                        registration_date: registrationDate,
                                        registration_ip: req.ip,
                                        registration_key: existingKey._id,
                                        registration_code: registrationVerificationCode,
                                        registration_code_expires: registrationVerificationCodeExpiry
                                    }
                                });

                                user.save()
                                    .then(() => {
                                        // Mark the registration key as used
                                        existingKey.used = true;
                                        existingKey.usedDate = new Date();
                                        existingKey.userId = user._id;
                                        existingKey.userIp = req.ip;
                                        existingKey.save();

                                        // Send the verification code by email to the user
                                        // sendVerificationCodeByEmail(user.email, registrationVerificationCode);

                                        res.status(201).json({
                                            success: true
                                        });
                                    })
                                    .catch((error) => {
                                        console.error('Error inserting user:', error);
                                        res.status(500).json({
                                            error: 'Internal server error'
                                        });
                                    });
                            });
                        }
                    })
                    .catch((error) => {
                        console.error('Error checking existing user:', error);
                        res.status(500).json({
                            error: 'Internal server error'
                        });
                    });
            }
        })
        .catch((error) => {
            console.error('Error checking registration key:', error);
            res.status(500).json({
                error: 'Internal server error'
            });
        });
});

/**
 * @openapi
 * /:
 *   get:
 *     summary: Get the details of the current user
 *     tags: [User]
 */
router.get('/', checkPermissions('authenticate'), (req, res) => {
    const {
        userId
    } = req.session.user;

    db.User.findById(userId).populate('group').populate('tenancy').populate('tenancies')
        .then((user) => {
            if (!user) {
                res.status(404).json({
                    error: 'User not found'
                });
                return;
            }

            res.json(user);
        })
        .catch((error) => {
            console.error('Error retrieving user details:', error);
            res.status(500).json({
                error: 'Internal server error'
            });
        });
});

/**
 * @openapi
 * /tenancies:
 *   get:
 *     summary: Get available tenancies for the current user
 *     tags: [User]
 */
// TODO: change to tenants
router.get('/tenancies', checkPermissions('authenticate'), (req, res) => {
    const {
        userId
    } = req.session.user;

    db.User.findById(userId)
        .then((user) => {
            if (!user) {
                res.status(404).json({
                    error: 'User not found'
                });
                return;
            }

            const {
                tenancies
            } = user;

            db.Tenancies.find({
                    _id: {
                        $in: tenancies
                    }
                })
                .then((results) => {
                    res.json(results);
                })
                .catch((error) => {
                    console.error('Error retrieving tenancies:', error);
                    res.status(500).json({
                        error: 'Internal server error'
                    });
                });
        })
        .catch((error) => {
            console.error('Error retrieving user details:', error);
            res.status(500).json({
                error: 'Internal server error'
            });
        });
});

/**
 * @openapi
 * /tenancy:
 *   get:
 *     summary: Get details of the current tenancy of the current user
 *     tags: [User]
 */
// TODO: change to tenant
router.get('/tenancy', checkPermissions('authenticate'), (req, res) => {
    const {
        userId
    } = req.session.user;

    db.User.findById(userId)
        .then((user) => {
            if (!user) {
                res.status(404).json({
                    error: 'User not found'
                });
                return;
            }

            const {
                tenancy
            } = user;

            db.Tenancies.findById(tenancy)
                .then((result) => {
                    if (!result) {
                        res.status(404).json({
                            error: 'Tenancy not found'
                        });
                        return;
                    }

                    res.json(result);
                })
                .catch((error) => {
                    console.error('Error retrieving tenancy:', error);
                    res.status(500).json({
                        error: 'Internal server error'
                    });
                });
        })
        .catch((error) => {
            console.error('Error retrieving user details:', error);
            res.status(500).json({
                error: 'Internal server error'
            });
        });
});

/**
 * @openapi
 * /tenancy/{tenancyId}:
 *   put:
 *     summary: Change the active tenancy of the current user
 *     tags: [User]
 */
// TODO: change to tenant
router.put('/tenancy/:tenancyId', checkPermissions('authenticate'), (req, res) => {
    const {
        userId
    } = req.session.user;
    const {
        tenancyId
    } = req.params;
    console.log('User', userId, 'requested changing tenancy to', tenancyId);

    // Check if the tenancy exists in the user's tenancies
    db.User.findById(userId)
        .then((user) => {
            if (!user) {
                res.status(404).json({
                    error: 'User not found'
                });
                return;
            }

            const {
                tenancies
            } = user;
            const tenancyExists = db.Tenancies.exists({
                _id: tenancyId
            });

            if (!tenancyExists) {
                res.status(400).json({
                    error: 'Tenancy does not exist for the user'
                });
                return;
            }

            // Update tenancy in session
            req.session.user.tenancy = tenancyId;

            // Update tenancy in database
            db.User.findByIdAndUpdate(userId, {
                    tenancy: tenancyId
                })
                .then(() => {
                    console.log('Tenancy changed to', tenancyId, 'for user', userId);
                    res.json({
                        success: true
                    });
                })
                .catch((error) => {
                    console.error('Error updating user details:', error);
                    res.status(500).json({
                        error: 'Internal server error'
                    });
                });
        })
        .catch((error) => {
            console.error('Error retrieving user details:', error);
            res.status(500).json({
                error: 'Internal server error'
            });
        });
});

// Reusable function to edit user details
const editUserDetails = (req, res) => {
    const {
        userId
    } = req.session.user;
    const {
        username,
        nickname,
        email
    } = req.body;

    db.User.findByIdAndUpdate(userId, {
            username,
            nickname,
            emails: [{
                    email: email,
                    is_primary: true
                },
                {
                    email: 'system@treudler.net',
                    is_primary: false
                }
            ]
        })
        .then(() => {
            res.json({
                success: true
            });
        })
        .catch((error) => {
            console.error('Error updating user details:', error);
            res.status(500).json({
                error: 'Internal server error'
            });
        });
};

/**
 * @openapi
 * /:
 *   post:
 *     summary: Edit the details of the current user
 *     tags: [User]
 */
router.post('/', editUserDetails);


/**
 * @openapi
 * /password:
 *   post:
 *     summary: Change the password of the current user
 *     tags: [User]
 */
router.post('/password', checkPermissions('manageAccount'), (req, res) => {
    const {
        userId
    } = req.session.user;
    const {
        currentPassword,
        newPassword
    } = req.body;

    db.User.findById(userId)
        .then((user) => {
            if (!user) {
                res.status(404).json({
                    error: 'User not found'
                });
                return;
            }
            // Check if the current password matches
            bcrypt.compare(currentPassword, user.password, (err, result) => {
                if (err) {
                    console.error('Error comparing passwords:', err);
                    res.status(500).json({
                        error: 'Internal server error'
                    });
                    return;
                }

                if (!result) {
                    res.status(400).json({
                        error: 'Current password is incorrect'
                    });
                    return;
                }

                // Encrypt the new password
                bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
                    if (err) {
                        console.error('Error hashing password:', err);
                        res.status(500).json({
                            error: 'Internal server error'
                        });
                        return;
                    }

                    // Update the password
                    user.password = hashedPassword;
                    user.save()
                        .then(() => {
                            console.log('Password updated:' + newPassword);
                            addNotification(user._id, 'warning', 'Your account password has been changed', 'Your account password has been changed through the casfra panel. If this was not you, contact ohje@treudler.net', 'email')
                            res.json({
                                success: true
                            });
                        })
                        .catch((error) => {
                            console.error('Error updating password:', error);
                            res.status(500).json({
                                error: 'Internal server error'
                            });
                        });
                });
            });
        })
        .catch((error) => {
            console.error('Error retrieving user details:', error);
            res.status(500).json({
                error: 'Internal server error'
            });
        });
});



module.exports = router;