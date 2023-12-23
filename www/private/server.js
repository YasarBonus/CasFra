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


//#region MongoDB
// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/casfra', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });


// Function to generate a random priority
function generateRandomPriority() {
  const random = Math.floor(Math.random() * 100000000000000000000);
  console.log(random);
  return random;
}

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
  banned: { type: Boolean, default: false },
  registrationKey: String,
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

const imagesSchema = new mongoose.Schema({
  name: String,
  filename: String,
  originalname: String,
  imageUrl: String,
  priority: { type: Number, default: generateRandomPriority() },
  size: Number,
  mimetype: String,
  description: String,
  addedDate: { type: Date, default: Date.now },
  addedBy: String,
  modifiedDate: Date,
  modifiedUser: String,
  category: String,
  description: String,
  active: { type: Boolean, default: true },
  priority: { type: Number, default: 0 },
});

const imagesCategoriesSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  active: { type: Boolean, default: true },
  priority: { type: Number, default: generateRandomPriority() },
  addedDate: { type: Date, default: Date.now },
  addedBy: String,
  modifiedDate: Date,
  modifiedBy: String,
});

// Define Casino schema
const casinoSchema = new mongoose.Schema({
  name: String,
  categories: [String],
  description: String,
  priority: {type: Number, default: 0},
  addedDate: { type: Date, default: Date.now },
  addedBy: String,
  modifiedDate: Date,
  modifiedBy: String,
  active: { type: Boolean, default: false },
  isNew: { type: Boolean, default: false },
  label: String,
  labelLarge: String,
  boni: [String],
  displayBonus: String,
  maxBet: Number,
  maxCashout: Number,
  wager: Number,
  wagerType: [String],
  noDeposit: { type: Boolean, default: false },
  prohibitedGamesProtection: { type: Boolean, default: true },
  vpn: { type: Boolean, default: false },
  features: [String],
  providers: [String],
  paymentMethods: [String],
  reviewTitle: String,
  review: String,
  imageId: String,
  imageUrl: String,
  affiliateLink: String,
  affiliateShirtlink: String
});

// Define Casino Review schema
const casinoReviewSchema = new mongoose.Schema({
  casinoId: String,
  userId: String,
  rating: Number,
  review: String,
  timestamp: { type: Date, default: Date.now }
});

// Define Casino features schema
const casinoFeaturesSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  active: { type: Boolean, default: true },
  priority: { type: Number, default: 0 },
  addedDate: { type: Date, default: Date.now },
  addedBy: String,
  modifiedDate: Date,
  modifiedBy: String
});

// Define Casino provider schema
const casinoProviderSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  active: { type: Boolean, default: true },
  priority: { type: Number, default: 0 },
  addedDate: { type: Date, default: Date.now },
  addedBy: String,
  modifiedDate: Date,
  modifiedBy: String
});

// Define Casino payment methods schema
const casinoPaymentMethodsSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  active: { type: Boolean, default: true },
  priority: { type: Number, default: 0 },
  addedDate: { type: Date, default: Date.now },
  addedBy: String,
  modifiedDate: Date,
  modifiedBy: String
});

// Define Casino wager types schema
const casinoWagerTypesSchema = new mongoose.Schema({
  name: String,
  short: String,
  description: String,
  active: { type: Boolean, default: true },
  priority: { type: Number, default: 0 },
  addedDate: { type: Date, default: Date.now },
  addedBy: String,
  modifiedDate: Date,
  modifiedBy: String
});

// Define Casino boni schema
const casinoBoniSchema = new mongoose.Schema({
  name: String,
  bonus: Number,
  freespins: Number,
  max: Number,
  sticky: { type: Boolean, default: true },
  description: String,
  image: String,
  active: { type: Boolean, default: true },
  priority: { type: Number, default: 0 },
  addedDate: { type: Date, default: Date.now },
  addedBy: String,
  modifiedDate: Date,
  modifiedBy: String
});

// Define Casino categories schema
const casinoCategoriesSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  active: { type: Boolean, default: true },
  priority: { type: Number, default: 0 },
  addedDate: { type: Date, default: Date.now },
  addedBy: String,
  modifiedDate: Date,
  modifiedBy: String
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
const Images = mongoose.model('Images', imagesSchema);
const ImagesCategories = mongoose.model('ImagesCategories', imagesCategoriesSchema);
const Casino = mongoose.model('Casino', casinoSchema);
const CasinoReview = mongoose.model('CasinoReview', casinoReviewSchema);
const CasinoFeatures = mongoose.model('CasinoFeatures', casinoFeaturesSchema);
const CasinoProvider = mongoose.model('CasinoProvider', casinoProviderSchema);
const CasinoPaymentMethods = mongoose.model('CasinoPaymentMethods', casinoPaymentMethodsSchema);
const CasinoWagerTypes = mongoose.model('CasinoWagerTypes', casinoWagerTypesSchema);
const CasinoBoni = mongoose.model('CasinoBoni', casinoBoniSchema);
const CasinoCategories = mongoose.model('CasinoCategories', casinoCategoriesSchema);


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
  permissions: ['authenticate', 'viewDashboard', 'manageRegistrationKeys', 'manageUsers', 'manageCasinos', 
  'manageLinks', 'manageProvider', 'managePaymentMethods', 'manageAccount', 'manageRegistrationKeys',
  'manageSessions', 'manageImages', 'manageImagesCategories']
});

const userOperatorGroup = new UserGroup({
  name: 'Operator',
  permissions: ['authenticate', 'viewDashboard', 'manageCasinos', 'manageLinks', 'manageProvider', 
  'managePaymentMethods', 'manageAccount']
});

const userUserGroup = new UserGroup({
  name: 'User',
  permissions: ['viewDashboard', 'manageAccount']
});

const saveDefaultUserDatabaseData = async () => {
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

saveDefaultUserDatabaseData();

const CasinoFeaturesEntries = [{
  name: 'Fast Verification',
  description: 'This casino offers fast verification of your account.',
  image: 'https://www.casinofreak.com/images/icons/live-casino.png'
}, {
  name: 'Fast Withdrawals',
  description: 'This casino offers fast withdrawals.',
  image: 'https://www.casinofreak.com/images/icons/vip-casino.png'
}];

const CasinoProviderEntries = [{
  name: 'NetEnt',
  description: 'NetEnt is a leading provider of premium gaming solutions to the world’s most successful online casino operators. We have been a true pioneer in driving the market with our thrilling games powered by our cutting-edge platform.',
  image: 'https://www.casinofreak.com/images/providers/netent.png'
}, {
  name: 'Microgaming',
  description: 'Microgaming developed the first true online casino software over 15 years ago, and today its innovative and reliable software is licensed to over 400 online gaming brands worldwide. This unrivalled technology company offers over 600 unique game titles and more than 1,000 game variants, in 24 languages, across online, land-based, and mobile platforms.',
  image: 'https://www.casinofreak.com/images/providers/microgaming.png'
}];

const CasinoPaymentMethodsEntries = [{
  name: 'Visa',
  description: 'Visa is a global payments technology company working to enable consumers, businesses, banks and governments to use digital currency.',
  image: 'https://www.casinofreak.com/images/payment-methods/visa.png'
}, {
  name: 'Mastercard',
  description: 'Mastercard is a global payments technology company working to enable consumers, businesses, banks and governments to use digital currency.',
  image: 'https://www.casinofreak.com/images/payment-methods/mastercard.png'
}];

const CasinoWagerTypesEntries = [{
  name: 'Deposit',
  short: 'D',
  description: 'A deposit bonus is a bonus that you receive when you make a deposit.',
}, {
  name: 'Bonus',
  short: 'B',
  description: 'A bonus is a bonus that you receive when you make a deposit.',
}];

const CasinoBoniEntries = [{
  name: 'Welcome Bonus',
  bonus: 100,
  freespins: 0,
  max: 100,
  sticky: true,
  description: 'Welcome Bonus',
  image: 'https://www.casinofreak.com/images/bonuses/welcome-bonus.png'
}, {
  name: 'No Deposit Bonus',
  bonus: 0,
  freespins: 0,
  max: 0,
  sticky: true,
  description: 'No Deposit Bonus',
  image: 'https://www.casinofreak.com/images/bonuses/no-deposit-bonus.png'
}];

const CasinoCategoriesEntries = [{
  name: 'New',
  description: 'New Casinos',
  image: 'https://www.casinofreak.com/images/categories/new.png'
}, {
  name: 'Live',
  description: 'Live Casinos',
  image: 'https://www.casinofreak.com/images/categories/live.png'
}];

const saveDefaultCasinoDatabaseData = async () => {
  try {
    const promises = [];

    for (const casinoFeaturesEntry of CasinoFeaturesEntries) {
      const existingCasinoFeatures = await CasinoFeatures.findOne({ name: casinoFeaturesEntry.name });

      if (!existingCasinoFeatures) {
        const newCasinoFeatures = new CasinoFeatures(casinoFeaturesEntry);
        promises.push(newCasinoFeatures.save());
        console.log('CasinoFeatures entry saved:', newCasinoFeatures);
      } else if (existingCasinoFeatures.description !== casinoFeaturesEntry.description) {
        existingCasinoFeatures.description = casinoFeaturesEntry.description;
        promises.push(existingCasinoFeatures.save());
        console.log('CasinoFeatures entry updated:', existingCasinoFeatures);
      }
    }

    for (const casinoProviderEntry of CasinoProviderEntries) {
      const existingCasinoProvider = await CasinoProvider.findOne({ name: casinoProviderEntry.name });

      if (!existingCasinoProvider) {
        const newCasinoProvider = new CasinoProvider(casinoProviderEntry);
        promises.push(newCasinoProvider.save());
        console.log('CasinoProvider entry saved:', newCasinoProvider);
      } else if (existingCasinoProvider.description !== casinoProviderEntry.description) {
        existingCasinoProvider.description = casinoProviderEntry.description;
        promises.push(existingCasinoProvider.save());
        console.log('CasinoProvider entry updated:', existingCasinoProvider);
      }
    }

    for (const casinoPaymentMethodsEntry of CasinoPaymentMethodsEntries) {
      const existingCasinoPaymentMethods = await CasinoPaymentMethods.findOne({ name: casinoPaymentMethodsEntry.name });

      if (!existingCasinoPaymentMethods) {
        const newCasinoPaymentMethods = new CasinoPaymentMethods(casinoPaymentMethodsEntry);
        promises.push(newCasinoPaymentMethods.save());
        console.log('CasinoPaymentMethods entry saved:', newCasinoPaymentMethods);
      } else if (existingCasinoPaymentMethods.description !== casinoPaymentMethodsEntry.description) {
        existingCasinoPaymentMethods.description = casinoPaymentMethodsEntry.description;
        promises.push(existingCasinoPaymentMethods.save());
        console.log('CasinoPaymentMethods entry updated:', existingCasinoPaymentMethods);
      }
    }

    for (const casinoWagerTypesEntry of CasinoWagerTypesEntries) {
      const existingCasinoWagerTypes = await CasinoWagerTypes.findOne({ name: casinoWagerTypesEntry.name });

      if (!existingCasinoWagerTypes) {
        const newCasino = new CasinoWagerTypes(casinoWagerTypesEntry);
        promises.push(newCasino.save());
        console.log('CasinoWagerTypes entry saved:', newCasino);
      }
    }

    for (const casinoBoniEntry of CasinoBoniEntries) {
      const existingCasinoBoni = await CasinoBoni.findOne({ name: casinoBoniEntry.name });

      if (!existingCasinoBoni) {
        const newCasinoBoni = new CasinoBoni(casinoBoniEntry);
        promises.push(newCasinoBoni.save());
        console.log('CasinoBoni entry saved:', newCasinoBoni);
      }
    }

    for (const casinoCategoriesEntry of CasinoCategoriesEntries) {
      const existingCasinoCategories = await CasinoCategories.findOne({ name: casinoCategoriesEntry.name });

      if (!existingCasinoCategories) {
        const newCasinoCategories = new CasinoCategories(casinoCategoriesEntry);
        promises.push(newCasinoCategories.save());
        console.log('CasinoCategories entry saved:', newCasinoCategories);
      }
    }

    await Promise.all(promises);
    console.log('Default Database Data successfully saved.');
  } catch (error) {
    console.error('Error saving Default Database Data:', error);
  }
};

saveDefaultCasinoDatabaseData();

//#endregion MongoDB

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

//#region Auth 

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

      if (user.banned) {
        res.status(401).json({ error: 'User is banned' });
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
app.get('/api/auth/session', checkPermissions('authenticate'), (req, res) => {
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
app.post('/api/auth/logout', checkPermissions('authenticate'), (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

//#endregion Auth

//#region User
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
                  registrationDate: registrationDate, // Save the registration date
                  registrationKey: existingKey._id // Save the registrationKey ID to the user
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
app.get('/api/user', checkPermissions('authenticate'), (req, res) => {
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
app.post('/api/user/password', checkPermissions('manageAccount'), (req, res) => {
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

//#endregion User

//#region Registration Keys
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
//#endregion Registration Keys

//#region Images

//#region Image Categories

// Get all images categories from MongoDB
app.get('/api/images/categories', checkPermissions('manageImages' || 'manageImagesCategories'), (req, res) => {
  ImagesCategories.find()
    .then((results) => {
      res.json(results);
    })
    .catch((error) => {
      console.error('Error retrieving images categories:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
    );
});

// Insert image category into MongoDB
app.post('/api/images/categories/add', checkPermissions('manageImagesCategories'), (req, res) => {
  const { name, description, image, priority, active } = req.body;
  const { userId } = req.session.user;
  
  const imagesCategories = new ImagesCategories({
    addedBy: userId,
    name: name,
    description: description,
    image: image,
    priority: priority,
    active: active,
    addedDate: Date.now(),
  });

  imagesCategories.save()
    .then(() => {
      res.redirect('/dashboard');
    }
    )
    .catch((error) => {
      console.error('Error inserting image category:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
    );
});

// Duplicate image category
app.post('/api/images/categories/:id/duplicate', checkPermissions('manageImagesCategories'), (req, res) => {
  const { userId } = req.session.user;
  const { id } = req.params;

  ImagesCategories.findOne({ _id: id })
    .then((imagesCategories) => {
      if (!imagesCategories) {
        throw new Error('Image category not found');
      } else {
        const newPriority = generateRandomPriority();
        const newImagesCategories = new ImagesCategories({
          addedBy: userId,
          name: imagesCategories.name + ' (Copy)',
          description: imagesCategories.description,
          image: imagesCategories.image,
          priority: newPriority,
          active: imagesCategories.active,
          addedDate: Date.now(),
        });

        newImagesCategories.save()
          .then(() => {
            res.redirect('/dashboard');
          }
          )
          .catch((error) => {
            console.error('Error duplicating image category:', error);
            res.status(500).json({ error: 'Internal server error' });
          }
          );
      }
    })
    .catch((error) => {
      console.error('Error duplicating image category:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
}
);

// Edit image category
app.put('/api/images/categories/:id', checkPermissions('manageImagesCategories'), (req, res) => {
  const { userId } = req.session.user;
  const { id } = req.params;
  const { name, description, image, priority, active } = req.body;

  ImagesCategories.findOne({ _id: id })
    .then((imagesCategories) => {
      if (!imagesCategories) {
        throw new Error('Image category not found');
      } else {
        imagesCategories.name = name;
        imagesCategories.description = description;
        imagesCategories.image = image;
        imagesCategories.priority = priority;
        imagesCategories.active = active;
        imagesCategories.modifiedDate = Date.now();
        imagesCategories.modifiedBy = userId;

        imagesCategories.save()
          .then(() => {
            res.status(200).json({ success: 'Image Categorie updated' }); 
          })
          .catch((error) => {
            console.error('Error editing image category:', error);
            res.status(500).json({ error: 'Internal server error' });
          });
      }
    })
    .catch((error) => {
      console.error('Error editing image category:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

// Delete image category from MongoDB by ID
app.delete('/api/images/categories/:id', checkPermissions('manageImagesCategories'), (req, res) => {
  const imageCategoryId = req.params.id;

  ImagesCategories.findByIdAndDelete(imageCategoryId)
    .then((deletedImageCategory) => {
      if (!deletedImageCategory) {
        return res.status(404).json({ error: 'Image category not found' });
      }

      res.json({ message: 'Image category deleted successfully' });
    }
    )
    .catch((error) => {
      console.error('Error deleting image category:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
    );
} );

// Get the category of an image by ID
app.get('/api/images/:id/category', checkPermissions('manageImages'), (req, res) => {
  const imageId = req.params.id;

  Images.findById(imageId)
    .populate('category')
    .then((image) => {
      if (!image) {
        return res.status(404).json({ error: 'Image not found' });
      }

      res.json(image.category);
    })
    .catch((error) => {
      console.error('Error retrieving image category:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});


//#endregion Image Categories

//#region Images Images 

// Get all images from MongoDB
app.get('/api/images', checkPermissions('manageImages'), (req, res) => {
  Images.find()
    .then((results) => {
      const updatedResults = results.map((image) => {
        return {
          ...image._doc,
          imageUrl: `/img/images/${image.filename}`
        };
      });
      res.json(updatedResults);
    })
    .catch((error) => {
      console.error('Error retrieving images:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

// Get all images categories from MongoDB
app.get('/api/images/categories', checkPermissions('manageImages'), (req, res) => {
  ImagesCategories.find()
    .then((results) => {
      res.json(results);
    })
    .catch((error) => {
      console.error('Error retrieving images categories:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

// Get all images of a specific category
app.get('/api/images/categories/:categoryId/images', checkPermissions('manageImages'), (req, res) => {
  const categoryId = req.params.categoryId;

  Images.find({ category: categoryId })
    .then((results) => {
      const updatedResults = results.map((image) => {
        return {
          _id: image._id,
          name: image.name,
          imageUrl: image.imageUrl,
        };
      });
      res.json(updatedResults);
    })
    .catch((error) => {
      console.error('Error retrieving images of category:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});



// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/images'); // Set the destination folder for uploaded images
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop()); // Set the filename for the uploaded image
  }
});

// Create multer upload instance
const upload = multer({ storage: storage });

// Upload image and save it to the database
app.post('/api/images', checkPermissions('manageImages'), upload.single('image'), (req, res) => {
  const image = req.file;

  if (!image) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  // Save the image details to the database
  const newImage = new Images({
    filename: image.filename,
    originalname: image.originalname,
    name: image.originalname,
    mimetype: image.mimetype,
    size: image.size,
    addedDate: Date.now(),
    categoryId: req.body.categoryId,
    addedBy: req.session.user.userId,
    category: req.body.categoryId,
  });

  newImage.save()
    .then((savedImage) => {
      setImageUrl(savedImage._id);
      res.json({ message: 'Image uploaded and saved successfully', image: savedImage });
    })
    .catch((error) => {
      console.error('Error saving image:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

// Edit image
app.put('/api/images/:id', checkPermissions('manageImages'), (req, res) => {
  const { userId } = req.session.user;
  const { id } = req.params;
  const { name, description, priority, active, category } = req.body;
  console.log(req.body);

  Images.findOne({ _id: id })
    .then((image) => {
      if (!image) {
        res.status(404).json({ error: 'Image not found' });
      } else {
        image.name = name;
        image.description = description;
        image.priority = priority;
        image.active = active;
        image.modifiedDate = Date.now();
        image.modifiedBy = userId;
        image.category = category;

        image.save()
          .then(() => {
            res.status(200).json({ message: 'Image ' + image.name + ' edited successfully' });
          })
          .catch((error) => {
            console.error('Error editing image:', error);
            res.status(500).json({ error: 'Internal server error' });
          });
      }
    })
    .catch((error) => {
      console.error('Error editing image:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

// Delete image from MongoDB and from the file system by ID
app.delete('/api/images/:id', checkPermissions('manageImages'), (req, res) => {
  const imageId = req.params.id;

  Images.findByIdAndDelete(imageId)
    .then((deletedImage) => {
      if (!deletedImage) {
        return res.status(404).json({ error: 'Image not found' });
      }

      // Delete the image from the file system
      fs.unlinkSync(`public/img/images/${deletedImage.filename}`);

      res.json({ message: 'Image deleted successfully' });
    }
    )
    .catch((error) => {
      console.error('Error deleting image:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
    );
} );

//#endregion Media Images

//#endregion Images

//#region Casino Categories

// Get all casino categories from MongoDB
app.get('/api/casinos/categories', checkPermissions('manageCasinos'), (req, res) => {
  CasinoCategories.find()
    .then((results) => {
      res.json(results);
    })
    .catch((error) => {
      console.error('Error retrieving casino categories:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

// Insert casino category into MongoDB
app.post('/api/casinos/categories/add', checkPermissions('manageCasinos'), (req, res) => {
  const { name, description, image, priority, active } = req.body;
  const { userId } = req.session.user;

  const casinoCategories = new CasinoCategories({
    addedBy: userId,
    name: name,
    description: description,
    image: image,
    priority: priority,
    active: active,
    addedDate: Date.now(),
  });

  casinoCategories.save()
    .then(() => {
      res.redirect('/dashboard');
    }
    )
    .catch((error) => {
      console.error('Error inserting casino category:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
    );
});

// Duplicate casino category
app.post('/api/casinos/categories/:id/duplicate', checkPermissions('manageCasinos'), (req, res) => {
  const { userId } = req.session.user;
  const { id } = req.params;

  CasinoCategories.findOne({ _id: id })
    .then((casinoCategories) => {
      if (!casinoCategories) {
        throw new Error('Casino category not found');
      } else {
        newPriority = generateRandomPriority();
        const newCasinoCategories = new CasinoCategories({
          addedBy: userId,
          name: casinoCategories.name + ' (Copy)',
          description: casinoCategories.description,
          image: casinoCategories.image,
          priority: newPriority,
          active: casinoCategories.active,
          addedDate: Date.now(),
        });

        newCasinoCategories.save()
          .then(() => {
            res.redirect('/dashboard');
          }
          )
          .catch((error) => {
            console.error('Error inserting casino category:', error);
            res.status(500).json({ error: 'Internal server error' });
          }
          );
      }
    })
    .catch((error) => {
      console.error('Error duplicating casino category:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
    );
});


// Edit casino category
app.put('/api/casinos/categories/:id', checkPermissions('manageCasinos'), (req, res) => {
  const { userId } = req.session.user;
  const { id } = req.params;
  const { name, description, image, priority, active } = req.body;

  CasinoCategories.findOneAndUpdate(
    { _id: id },
    { name, description, image, priority, active },
    { modifiedBy: userId, modifiedDate: Date.now() }
  )
    .then((updatedCasinoCategories) => {
      if (!updatedCasinoCategories) {
        throw new Error('Casino category not found');
      }
      res.json(updatedCasinoCategories);
      console.log('Casino category updated: ' + updatedCasinoCategories.name);
    })
    .catch((error) => {
      console.error('Error updating casino category:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

// Delete casino category
app.delete('/api/casinos/categories/:id', checkPermissions('manageCasinos'), (req, res) => {
  const { id } = req.params;

  CasinoCategories.findOneAndDelete({ _id: id })
    .then((deletedCasinoCategory) => {
      if (!deletedCasinoCategory) {
        throw new Error('Casino category not found');
      }
      res.json(deletedCasinoCategory);
      console.log('Casino category deleted: ' + deletedCasinoCategory.name);
    })
    .catch((error) => {
      console.error('Error deleting casino category:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

//#endregion Casino Categories

//#region Casinos
// Get all casinos from MongoDB
app.get('/api/casinos', checkPermissions('manageCasinos'), (req, res) => {
  Casino.find()
    .then((results) => {
      res.json(results);
    })
    .catch((error) => {
      console.error('Error retrieving casinos:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});


// Get data for a single casino
app.get('/api/casinos/:id', checkPermissions('manageCasinos'), (req, res) => {
  const { id } = req.params; // Get the ID from the request params
  Casino.findOne({ _id: id })
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      console.error('Error retrieving casino:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

// Create a new casino
app.post('/api/casinos', checkPermissions('manageCasinos'), (req, res) => {
  const { name, priority } = req.body; // Get the name and location from the request body
  const { userId } = req.session.user; // Get the user ID from the session data

  // Create a new casino object
  const newCasino = new Casino({
    addedBy: userId,
    name: name,
    priority: priority
  });

  // Save the new casino to the database
  newCasino.save()
    .then((result) => {
      res.json(result);
      console.log('New casino created');
    })
    .catch((error) => {
      console.error('Error creating casino:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

// Edit a casino
app.put('/api/casinos/:id', checkPermissions('manageCasinos'), (req, res) => {
  const { userId } = req.session.user; 
  const { id } = req.params; 
  const { name, categories, description, priority, active, isNew, label, labelLarge, boni, displayBonus, maxBet, maxCashout, wager, wagerType, noDeposit, prohibitedGamesProtection, vpn, features, providers, paymentMethods, review, reviewTitle, imageId, affiliateUrl, affiliateShortlink } = req.body; // Get the updated values from the request body
  console.log(req.body);
  console.log(active);
  Casino.findOneAndUpdate(
    { _id: id },
    { name, categories, description, priority, active, isNew, label, labelLarge, boni, displayBonus, maxBet, maxCashout, wager, wagerType, noDeposit, prohibitedGamesProtection, vpn, features, providers, paymentMethods, review, reviewTitle, imageId, affiliateUrl, affiliateShortlink },
    { modifiedBy: userId, modifiedDate: Date.now() }
  )
    .then((updatedCasino) => {
      if (!updatedCasino) {
        throw new Error('Casino not found');
      }
      res.json(updatedCasino);
      console.log('Casino updated: ' + updatedCasino.name);

      // Call setCasinoImageUrl(ID) function here
      setCasinoImageUrl(updatedCasino._id);
    })
    .catch((error) => {
      console.error('Error updating casino:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

// Delete a casino
app.delete('/api/casinos', checkPermissions('manageCasinos'), (req, res) => {
  const { id } = req.body; // Get the ID from the request body
  Casino.deleteOne({ _id: id })
    .then((result) => {
      if (result.deletedCount === 0) {
        throw new Error('Casino not found');
      }
      res.json({ success: true, id: id, status: 'deleted' });
      console.log('Casino deleted');
    })
    .catch((error) => {
      console.error('Error deleting casino:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

// Toggle the active status of a casino by its ID
app.put('/api/casinos/:id/toggleActive', checkPermissions('manageCasinos'), (req, res) => {
  const { id } = req.params; // Get the ID of the casino from the request params

  // Validate the ID
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  // Find the casino by its ID
  Casino.findById(id)
    .then((casino) => {
      if (!casino) {
        throw new Error('Casino not found');
      }

      // Toggle the active status
      casino.active = !casino.active;

      // Save the updated casino to the database
      return casino.save();
    })
    .then((updatedCasino) => {
      res.json(updatedCasino);
      console.log('Casino active status toggled');
    })
    .catch((error) => {
      console.error('Error toggling casino active status:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

// Swap the priority of two casinos by their ID
app.put('/api/casinos/priority/swap', checkPermissions('manageCasinos'), (req, res) => {
  const { id1, id2 } = req.body; // Get the IDs of the two casinos from the request body

  console.log(id1 + ' ' + id2);

  // Validate the IDs
  if (!id1.match(/^[0-9a-fA-F]{24}$/) || !id2.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  // Find the two casinos by their IDs
  Casino.find({ _id: { $in: [id1, id2] } })
    .then((casinos) => {
      if (casinos.length !== 2) {
        throw new Error('Two casinos not found');
      }
      console.log('Found Casinos:')
      // Swap the priorities of the two casinos
      const priority1 = casinos[0].priority;
      casinos[0].priority = casinos[1].priority;
      casinos[1].priority = priority1;

      // Save the updated casinos
      return Promise.all([casinos[0].save(), casinos[1].save()]);
    })
    .then((updatedCasinos) => {
      res.json(updatedCasinos);
      console.log('Casinos priority swapped');
    })
    .catch((error) => {
      console.error('Error swapping casinos priority:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

// Get categories of a specific casino by ID
app.get('/api/casinos/:id/categories', checkPermissions('manageCasinos'), (req, res) => {
  const { id } = req.params; // Get the ID from the request params
  Casino.findOne({ _id: id })
    .then((result) => {
      res.json(result.categories);
    })
    .catch((error) => {
      console.error('Error retrieving casino categories:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

// Get wagerTypes of a specific casino by ID
app.get('/api/casinos/:id/wagertypes', checkPermissions('manageCasinos'), (req, res) => {
  const { id } = req.params; // Get the ID from the request params
  Casino.findOne({ _id: id })
    .then((result) => {
      res.json(result.wagerType);
    })
    .catch((error) => {
      console.error('Error retrieving casino wagerTypes:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

// Get boni of a specific casino by ID
app.get('/api/casinos/:id/boni', checkPermissions('manageCasinos'), (req, res) => {
  const { id } = req.params; // Get the ID from the request params
  Casino.findOne({ _id: id })
    .then((result) => {
      res.json(result.boni);
    })
    .catch((error) => {
      console.error('Error retrieving casino boni:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
} );

// Get features of a specific casino by ID
app.get('/api/casinos/:id/features', checkPermissions('manageCasinos'), (req, res) => {
  const { id } = req.params; // Get the ID from the request params
  Casino.findOne({ _id: id })
    .then((result) => {
      res.json(result.features);
    })
    .catch((error) => {
      console.error('Error retrieving casino features:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
} );

// Get providers of a specific casino by ID
app.get('/api/casinos/:id/providers', checkPermissions('manageCasinos'), (req, res) => {
  const { id } = req.params; // Get the ID from the request params
  Casino.findOne({ _id: id })
    .then((result) => {
      res.json(result.providers);
    })
    .catch((error) => {
      console.error('Error retrieving casino providers:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
} );

// Get paymentMethods of a specific casino by ID
app.get('/api/casinos/:id/paymentmethods', checkPermissions('manageCasinos'), (req, res) => {
  const { id } = req.params; // Get the ID from the request params
  Casino.findOne({ _id: id })
    .then((result) => {
      res.json(result.paymentMethods);
    })
    .catch((error) => {
      console.error('Error retrieving casino paymentMethods:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
} );

//#endregion Casinos



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

//#region Routes
// Routes for rendering views
app.get('/', (req, res) => {
  res.render('pages/index');
});

app.get('/faq', (req, res) => {
  res.render('pages/faq');
});

app.get('/login', (req, res) => {
  res.render('admin/login');
});

app.get('/register', (req, res) => {
  res.render('admin/register');
});

app.get('/dashboard', checkPermissions('viewDashboard'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId + ') accessed ' + req.url);
    const user = req.session.user;
    res.render('admin/dashboard', { user: user });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/account', checkPermissions('manageAccount'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId + ') accessed ' + req.url);
    const user = req.session.user;
    res.render('admin/account', { user: user });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/super/registrationkeys', checkPermissions('manageRegistrationKeys'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId + ') accessed ' + req.url);
    const user = req.session.user;
    res.render('admin/registrationkeys', { user: user });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/super/sessions', checkPermissions('manageSessions'), (req, res, next) => {
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

app.get('/dashboard/casinos', checkPermissions('manageCasinos'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId + ') accessed ' + req.url);
    const user = req.session.user;
    res.render('admin/casinos', { user: user });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/casinos/categories', checkPermissions('manageCasinos'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId + ') accessed ' + req.url);
    const user = req.session.user;
    res.render('admin/casinocategories', { user: user });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/images/categories', checkPermissions('manageImagesCategories'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId + ') accessed ' + req.url);
    const user = req.session.user;
    res.render('admin/images_categories', { user: user });
  } catch (err) {
    next(err);
  }
} );

app.get('/dashboard/images', checkPermissions('manageImages'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId + ') accessed ' + req.url);
    const user = req.session.user;
    res.render('admin/images', { user: user });
  } catch (err) {
    next(err);
  }
} );


//#endregion Routes

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

async function setCasinoImageUrl(casinoId = null) {
  try {
    let casinos;
    if (casinoId) {
      casinos = await Casino.findOne({ _id: casinoId });
      casinos = [casinos]; // Convert single object to array
    } else {
      casinos = await Casino.find();
    }
    for (const casino of casinos) {
      if (casino.imageId) {
        const image = await Images.findOne({ _id: casino.imageId });
        if (image) {
          casino.imageUrl = `/img/images/${image.filename}`;
          await casino.save();
          console.log('Image URL for Casino ' + casino.name + '(' + casino._id + ') (' + casino.imageUrl + ') saved');
        }
      }
    }
  } catch (error) {
    console.error('Error retrieving casinos:', error);
  }
}

async function setImageUrl(imageId = null) {
  try {
    let images;
    if (imageId) {
      images = await Images.findOne({ _id: imageId });
      images = [images]; // Convert single object to array
    } else {
      images = await Images.find();
    }
    for (const image of images) {
      if (image.filename) {
        const foundImage = await Images.findOne({ _id: image._id });
        if (foundImage) {
          foundImage.imageUrl = `/img/images/${foundImage.filename}`;
          await foundImage.save();
          console.log('Image URL for Image ' + foundImage.name + '(' + foundImage._id + ') (' + foundImage.imageUrl + ') saved');
        }
      }
    }
  } catch (error) {
    console.error('Error retrieving images:', error);
  }
}

// Run the function on startup, then every hour
deleteUnusedRegistrationKeys();
setInterval(deleteUnusedRegistrationKeys, 60 * 60 * 1000);

setCasinoImageUrl();
setInterval(setCasinoImageUrl, 60 * 60 * 1000);

setImageUrl();
setInterval(setImageUrl, 60 * 60 * 1000);


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
