const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
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
router.post('/register', async (req, res) => {
    try {
        const {
            username,
            nickname,
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

        if (!nickname) {
            res.status(400).json({
                error: 'Nickname is required'
            });
            return;
        }

        if (!usernameRegex.test(nickname)) {
            res.status(400).json({
                error: 'Nickname must contain only numbers and letters, with a length between 3 and 10 characters'
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

        const existingKey = await db.RegistrationKey.findOne({
            regkey: registrationKey
        });
        if (!existingKey) {
            res.status(400).json({
                error: 'Invalid registration key'
            });
            return;
        }

        if (existingKey.used) {
            res.status(400).json({
                error: 'Registration key already used'
            });
            return;
        }

        const existingUser = await db.User.findOne({
            $or: [{
                username: username
            }, {
                email: email
            }]
        });
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
            return;
        }

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

        const hash = await bcrypt.hash(password, 10);

        const registrationVerificationCodeExpiry = new Date();
        registrationVerificationCodeExpiry.setHours(registrationVerificationCodeExpiry.getHours() + 1);

        // Generate a random 6-digit verification code
        const generateVerificationCode = () => {
            const code = Math.floor(100000 + Math.random() * 900000);
            return code.toString();
        };

        // Generate a random 20 characters code for verification link
        const generateVerificationLinkCode = () => {
            const code = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            return code;
        };

        const registrationVerificationCode = generateVerificationCode();
        const registrationVerificationLinkCode = generateVerificationLinkCode();
        const registrationDate = new Date(); // Add registration date

        const user = new db.User({
            username: username,
            nickname: nickname,
            password: hash,
            emails: {
                email: email,
                is_primary: true,
                is_confirmed: false,
            },
            language: language || 'en', // Set default value to "en" if not provided
            personal_details: {},
            personal_address: {},
            registration: {
                registration_date: registrationDate,
                registration_ip: req.ip,
                registration_key: existingKey._id,
                registration_code: registrationVerificationCode,
                registration_code_link: registrationVerificationLinkCode,
                registration_code_expires: registrationVerificationCodeExpiry,
            },
            status: {
                active: false,
                banned: false,
                verified: false,
            },
        });

        await user.save();

        // Mark the registration key as used
        existingKey.used = true;
        existingKey.usedDate = new Date();
        existingKey.userId = user._id;
        existingKey.userIp = req.ip;
        await existingKey.save();

        // Send the verification code by email to the user
        // sendVerificationCodeByEmail(user.email, registrationVerificationCode);

        res.status(201).json({
            success: true
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
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
        username, nickname,
        email,
        first_name, second_name, last_name,
        nationality, date_of_birth, place_of_birth,
        mobile_phone, landline_phone, telefax,
        street, street_number, city, country, zip_code, additional_info,
    } = req.body;

    db.User.findByIdAndUpdate(userId, {
            username,
            nickname,
            emails: {
                email: email,
                is_primary: true,
                is_confirmed: false,
            },
            personal_details: {
                first_name: first_name,
                second_name: second_name,
                last_name: last_name,
                nationality: nationality,
                date_of_birth: date_of_birth,
                place_of_birth: place_of_birth,
                mobile_phone: mobile_phone,
                landline_phone: landline_phone,
                telefax: telefax,
            },
            personal_address: {
                street: street,
                street_number: street_number,
                city: city,
                country: country,
                zip_code: zip_code,
                additional_info: additional_info,
            },
            
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