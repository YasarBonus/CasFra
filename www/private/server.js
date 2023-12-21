const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const schedule = require('node-schedule');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const ejs = require('ejs');
const mongoose = require('mongoose');

const nodemailer = require('nodemailer');

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-password'
  }
});

// Function to send password reset email
const sendPasswordResetEmail = (email, resetToken) => {
  const mailOptions = {
    from: 'your-email@gmail.com',
    to: email,
    subject: 'Password Reset',
    text: `Click the following link to reset your password: http://your-website.com/reset-password?token=${resetToken}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

// Use the sendPasswordResetEmail function


const app = express();
const port = 3000;

// Set 'views' directory for any views 
// being rendered res.render()
app.set('views', path.join(__dirname, '../views'));

// Set view engine as EJS
app.set('view engine', 'ejs');

app.use(express.static(path.join('public')));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/casfra', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });


// Define Language schema
const languageSchema = new mongoose.Schema({
  name: String,
  code: String
});

// Define User schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  groupId: String,
  email: String,
  language: String,
  active: { type: Boolean, default: false },
  registrationDate: Date,
  registrationIp: String,
  registrationVerificationCode: String,
  registrationVerificationCodeExpiry: Date,
  lastLoginDate: Date,
  lastLoginIp: String
});

// Define UserGroup schema
const userGroupSchema = new mongoose.Schema({
  name: String,
  permissions: [String]
});

// Define RegistrationKey schema
const registrationKeySchema = new mongoose.Schema({
  regkey: String,
  created: { type: Date, default: Date.now },
  used: { type: Boolean, default: false },
  usedDate: Date,
  userId: String,
  userIp: String
});

// Define LinkHit schema
const linkHitSchema = new mongoose.Schema({
  name: String,
  timestamp: Date
});

// Define Casino schema
const casinoSchema = new mongoose.Schema({
  name: String,
  url: String
});

const SessionSchema = new mongoose.Schema({
  userId: String,
  username: String,
  ip: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now }
});

// Define models
const Session = mongoose.model('Session', SessionSchema);
const Language = mongoose.model('Language', languageSchema);
const User = mongoose.model('User', userSchema);
const UserGroup = mongoose.model('UserGroup', userGroupSchema);
const RegistrationKey = mongoose.model('RegistrationKey', registrationKeySchema);
const LinkHit = mongoose.model('LinkHit', linkHitSchema);
const Casino = mongoose.model('Casino', casinoSchema);

const languageEntries = [
  { name: 'English', code: 'en' },
  { name: 'French', code: 'fr' },
  { name: 'Spanish', code: 'es' },
  { name: 'German', code: 'de' },
];

const registrationKeyEntries = [
  { regkey: 'admin', created: new Date(), used: false }
];

const userAdminGroup = new UserGroup({
  name: 'Admin',
  permissions: ['viewDashboard', 'manageRegistrationKeys', 'manageUsers', 'manageCasinos', 
  'manageLinks', 'manageProvider', 'managePaymentMethods', 'manageAccount', 'manageRegistrationKeys',
  'manageSessions']
});

const userOperatorGroup = new UserGroup({
  name: 'Operator',
  permissions: ['viewDashboard', 'manageCasinos', 'manageLinks', 'manageProvider', 
  'managePaymentMethods', 'manageAccount']
});

const userUserGroup = new UserGroup({
  name: 'User',
  permissions: ['viewDashboard', 'manageAccount']
});

const saveDefaultDatabaseData = async () => {
  try {
    const adminGroup = await UserGroup.findOne({ name: 'Admin' });
    const userGroup = await UserGroup.findOne({ name: 'User' });
    const operatorGroup = await UserGroup.findOne({ name: 'Operator' });

    const promises = [];

    if (!adminGroup) {
      promises.push(userAdminGroup.save());
      console.log('UserGroup "Admin" saved with Permissions:', userAdminGroup.permissions);
    } else if (adminGroup.permissions.toString() !== userAdminGroup.permissions.toString()) {
      adminGroup.permissions = userAdminGroup.permissions;
      promises.push(adminGroup.save());
      console.log('UserGroup "Admin" permissions updated:', userAdminGroup.permissions);
    }

    if (!operatorGroup) {
      promises.push(userOperatorGroup.save());
      console.log('UserGroup "Operator" saved with Permissions:', userOperatorGroup.permissions);
    } else if (operatorGroup.permissions.toString() !== userOperatorGroup.permissions.toString()) {
      operatorGroup.permissions = userOperatorGroup.permissions;
      promises.push(operatorGroup.save());
      console.log('UserGroup "Operator" permissions updated:', userOperatorGroup.permissions);
    }

    if (!userGroup) {
      promises.push(userUserGroup.save());
      console.log('UserGroup "User" saved with Permissions:', userUserGroup.permissions);
    } else if (userGroup.permissions.toString() !== userUserGroup.permissions.toString()) {
      userGroup.permissions = userUserGroup.permissions;
      promises.push(userGroup.save());
      console.log('UserGroup "User" permissions updated:', userUserGroup.permissions);
    }

    for (const languageEntry of languageEntries) {
      const existingLanguage = await Language.findOne({ name: languageEntry.name });

      if (!existingLanguage) {
        const newLanguage = new Language(languageEntry);
        promises.push(newLanguage.save());
        console.log('Language entry saved:', newLanguage);
      } else if (existingLanguage.code !== languageEntry.code) {
        existingLanguage.code = languageEntry.code;
        promises.push(existingLanguage.save());
        console.log('Language entry updated:', existingLanguage);
      }
    }

    for (const registrationKeyEntry of registrationKeyEntries) {
      const existingRegistrationKey = await RegistrationKey.findOne({ regkey: registrationKeyEntry.regkey });

      if (!existingRegistrationKey) {
        const newRegistrationKey = new RegistrationKey(registrationKeyEntry);
        promises.push(newRegistrationKey.save());
        console.log('Registration key entry saved:', newRegistrationKey);
      }
    }

    await Promise.all(promises);
    console.log('Default Database Data successfully saved.');
  } catch (error) {
    console.error('Error saving Default Database Data:', error);
  }
};

saveDefaultDatabaseData();

  // Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const MongoStore = require('connect-mongo');

app.use(session({
  secret: 'aisei0aeb9ba4vahgohC5heeke5Rohs5oi9ohyuepadaeGhaeP2lahkaecae',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
  },
  store: MongoStore.create({ 
    mongoUrl: 'mongodb://localhost:27017/casfra' 
  })
}));

// ############################## ROUTES ##############################

// ############################## AUTH ##############################

// Login user
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!password) {
    res.status(400).json({ error: 'Password is required' });
    return;
  }

  if (!username) {
    res.status(400).json({ error: 'Username is required' });
    return;
  }

  User.findOne({ username: username })
    .then((user) => {
      if (!user) {
        res.status(401).json({ error: 'Invalid username or password' });
        return;
      }

      if (!user.active) {
        res.status(401).json({ error: 'User is not active' });
        return;
      }

      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          console.error('Error comparing passwords:', err);
          res.status(500).json({ error: 'Internal server error' });
          return;
        }

        if (result) {
          // Get user permissions
          UserGroup.findOne({ _id: user.groupId })
            .then((userGroup) => {
              if (!userGroup) {
                res.status(500).json({ error: 'User group not found' });
                return;
              }

              // Add user permissions to session data
              req.session.user = { 
                userId: user._id, 
                username: user.username, 
                permissions: userGroup.permissions 
              };

              res.json({ success: true });
            })
            .catch((error) => {
              console.error('Error retrieving user group:', error);
              res.status(500).json({ error: 'Internal server error' });
            });
        } else {
          res.status(401).json({ error: 'Invalid username or password' });
        }
      });
    })
    .catch((error) => {
      console.error('Error retrieving user:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

// Get current session details
app.get('/api/auth/session', (req, res) => {
  const sessionDetails = req.session.user;
  
  if (sessionDetails) {
    res.json(sessionDetails);
  } else {
    res.status(401).json({ error: 'No session found' });
  }
});

// Get all sessions from MongoDB
app.get('/api/auth/sessions', checkPermissions('manageSessions'), (req, res) => {
  Session.find()
    .then((results) => {
      res.json(results);
    })
    .catch((error) => {
      console.error('Error retrieving sessions:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

// Logout user
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Insert user into MongoDB
app.post('/api/user/register', (req, res) => {
  console.log(req.body);
  const { username, password, passwordRepeat, email, language, registrationKey } = req.body;

  if (!username) {
    res.status(400).json({ error: 'Username is required' });
    return;
  }

  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  if (!registrationKey) {
    res.status(400).json({ error: 'Registration key is required' });
    return;
  }

  // Validate username format
  const usernameRegex = /^[a-zA-Z0-9]{3,10}$/;
  if (!usernameRegex.test(username)) {
    res.status(400).json({ error: 'Username must contain only numbers and letters, with a length between 3 and 10 characters' });
    return;
  }

  // Validate E-Mail format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: 'Invalid email format' });
    return;
  }

  RegistrationKey.findOne({ regkey: registrationKey })
    .then((existingKey) => {
      if (!existingKey) {
        res.status(400).json({ error: 'Invalid registration key' });
      } else if (existingKey.used) {
        res.status(400).json({ error: 'Registration key already used' });
      } else {
        User.findOne({ $or: [{ username: username }, { email: email }] })
          .then((existingUser) => {
            if (existingUser) {
              if (existingUser.username === username) {
                res.status(400).json({ error: 'Username already exists' });
              } else {
                res.status(400).json({ error: 'Email already exists' });
              }
            } else {
              if (!password) {
                res.status(400).json({ error: 'Password is required' });
                return;
              }

              if (password !== passwordRepeat) {
                res.status(400).json({ error: 'Passwords do not match' });
                return;
              }

              bcrypt.hash(password, 10, (err, hash) => {
                if (err) {
                  console.error('Error hashing password:', err);
                  res.status(500).json({ error: 'Internal server error' });
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

                const user = new User({
                  username: username,
                  password: hash,
                  email: email,
                  language: language || 'en', // Set default value to "en" if not provided
                  registrationIp: req.ip, // Save the registration IP
                  registrationVerificationCode: registrationVerificationCode,
                  registrationVerificationCodeExpiry: registrationVerificationCodeExpiry,
                  registrationDate: registrationDate // Save the registration date
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

                    res.status(201).json({ success: true });
                  })
                  .catch((error) => {
                    console.error('Error inserting user:', error);
                    res.status(500).json({ error: 'Internal server error' });
                  });
              });
            }
          })
          .catch((error) => {
            console.error('Error checking existing user:', error);
            res.status(500).json({ error: 'Internal server error' });
          });
      }
    })
    .catch((error) => {
      console.error('Error checking registration key:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

// Get user details of the current user
app.get('/api/user', (req, res) => {
  const { userId } = req.session.user;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json(user);
    })
    .catch((error) => {
      console.error('Error retrieving user details:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

// Edit user details of the current user
app.post('/api/user', (req, res) => {
  const { userId } = req.session.user;
  const { username, email } = req.body;

  User.findByIdAndUpdate(userId, { username, email })
    .then(() => {
      res.json({ success: true });
    })
    .catch((error) => {
      console.error('Error updating user details:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

// Change password of the current user
app.post('/api/user/password', (req, res) => {
  const { userId } = req.session.user;
  const { currentPassword, newPassword } = req.body;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      console.log(user);
      console.log(currentPassword  + ' ' + newPassword);
      // Check if the current password matches
      bcrypt.compare(currentPassword, user.password, (err, result) => {
        if (err) {
          console.error('Error comparing passwords:', err);
          res.status(500).json({ error: 'Internal server error' });
          return;
        }

        if (!result) {
          res.status(400).json({ error: 'Current password is incorrect' });
          return;
        }

        // Encrypt the new password
        bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
          if (err) {
            console.error('Error hashing password:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
          }

          // Update the password
          user.password = hashedPassword;
          user.save()
            .then(() => {
              console.log('Password updated:' + newPassword);
              res.json({ success: true });
            })
            .catch((error) => {
              console.error('Error updating password:', error);
              res.status(500).json({ error: 'Internal server error' });
            });
        });
      });
    })
    .catch((error) => {
      console.error('Error retrieving user details:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

// Get all registration keys from MongoDB
app.get('/api/users/regkeys', checkPermissions('manageRegistrationKeys'), (req, res) => {
  RegistrationKey.find()
    .then((results) => {
      res.json(results);
    })
    .catch((error) => {
      console.error('Error retrieving registration keys:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

// Insert registration key into MongoDB
app.post('/api/users/regkeys/add', checkPermissions('manageRegistrationKeys'), (req, res) => {
  const { regkey } = req.body;

  const registrationKey = new RegistrationKey({
    regkey: regkey
  });

  registrationKey.save()
    .then(() => {
      res.redirect('/dashboard');
    })
    .catch((error) => {
      console.error('Error inserting registration key:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

// Generate and insert registration key into MongoDB
app.post('/api/users/regkeys/generate', checkPermissions('manageRegistrationKeys'), (req, res) => {
  const regkey = Math.random().toString(36).substr(2, 10);

  const registrationKey = new RegistrationKey({
    regkey: regkey
  });

  registrationKey.save()
    .then((result) => {
      res.json({ id: result._id, regkey: regkey });
    })
    .catch((error) => {
      console.error('Error generating registration key:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

// Delete registration key from MongoDB by ID
app.delete('/api/users/regkeys/', checkPermissions('manageRegistrationKeys'), (req, res) => {
  const { id } = req.body.id;
  RegistrationKey.deleteOne({ _id: id })
    .then((result) => {
      if (result.deletedCount === 0) {
        throw new Error('Registration key not found');
      }
      res.json({ success: true, id: id, status: 'deleted' });
      console.log('Registration key deleted');
    })
    .catch((error) => {
      console.error('Error deleting registration key:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

// Get all users from MongoDB
app.get('/api/users', checkPermissions('manageUsers'), (req, res) => {
  User.find()
    .then((results) => {
      res.json(results);
    })
    .catch((error) => {
      console.error('Error retrieving users:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
} );

// Delete user from MongoDB by ID
app.delete('/api/users', checkPermissions('manageUsers'), (req, res) => {
  const { id } = req.body; // Get the ID from the request body
  User.deleteOne({ _id: id })
    .then((result) => {
      if (result.deletedCount === 0) {
        throw new Error('User not found');
      }
      res.json({ success: true, id: id, status: 'deleted' });
      console.log('User deleted');
    })
    .catch((error) => {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});


// Middleware to check if the user is logged in
function checkLoggedIn(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
}

// Middleware to check if the user is logged in and has the required permission
function checkPermissions(requiredPermission) {
  return function (req, res, next) {
    if (!req.session.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const userId = req.session.user.userId;

    User.findById(userId)
      .then((user) => {
        if (!user) {
          res.status(403).json({ error: 'Forbidden' });
          return;
        }

        const groupId = user.groupId;

        UserGroup.findById(groupId)
          .then((userGroup) => {
            if (!userGroup) {
              res.status(403).json({ error: 'Forbidden' });
              return;
            }

            const permissions = userGroup.permissions;

            if (permissions.includes(requiredPermission)) {
              next();
            } else {
              res.status(403).json({ error: 'Forbidden' });
            }
          })
          .catch((error) => {
            console.error('Error retrieving user group:', error);
            res.status(500).json({ error: 'Internal server error' });
          });
      })
      .catch((error) => {
        console.error('Error retrieving user:', error);
        res.status(500).json({ error: 'Internal server error' });
      });
  };
}

// Routes for rendering views
app.get('/login', (req, res) => {
  res.render('admin/login');
});

app.get('/register', (req, res) => {
  res.render('admin/register');
});

app.get('/dashboard', (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId + ') accessed ' + req.url);
    const user = req.session.user;
    res.render('admin/dashboard', { user: user });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/account', (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId + ') accessed ' + req.url);
    const user = req.session.user;
    res.render('admin/account', { user: user });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/super/registrationkeys', (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId + ') accessed ' + req.url);
    const user = req.session.user;
    res.render('admin/registrationkeys', { user: user });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/super/sessions', (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId + ') accessed ' + req.url);
    const user = req.session.user;
    res.render('admin/sessions', { user: user });
  } catch (err) {
    next(err);
  }
} );

app.get('/dashboard/super/users', checkPermissions('manageUsers'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId + ') accessed ' + req.url);
    const user = req.session.user;
    res.render('admin/users', { user: user });
  } catch (err) {
    next(err);
  }
});

// Function to delete unused registration keys older than 1 hour
function deleteUnusedRegistrationKeys() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago

  RegistrationKey.deleteMany({ used: false, created: { $lt: oneHourAgo } })
    .then(() => {
      const deletedKeys = RegistrationKey.deletedCount;
      console.log('Deleted unused registration keys older than 1 hour:' + deletedKeys);
    })
    .catch((error) => {
      console.error('Error deleting unused registration keys:', error);
    });
}

// Run the function every minute
setInterval(deleteUnusedRegistrationKeys, 1 * 60 * 1000);


// Close the MongoDB connection when the server is shut down
process.on('SIGINT', () => {
  mongoose.connection.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Closed the MongoDB connection.');
    process.exit(0);
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
