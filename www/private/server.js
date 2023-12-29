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

const app = express();
const port = 3000;

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join('public')));


//#region MongoDB
// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/casfra', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
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

const SessionSchema = new mongoose.Schema({
  userId: String,
  username: String,
  ip: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const tenanciesSchema = new mongoose.Schema({
  name: String,
  notes: String,
  createdBy: {
    type: String,
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  modifiedBy: String,
  modifiedDate: Date,
  image: String,
  admins: [String],
  active: {
    type: Boolean,
    default: true
  },
  imageUrl: String,
  priority: {
    type: Number,
    default: generateRandomPriority()
  },
  type: String,
})

// Define tenanciesTypes schema
const tenanciesTypesSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  imageUrl: String,
  active: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: generateRandomPriority()
  },
  addedDate: {
    type: Date,
    default: Date.now
  },
  addedBy: String,
  modifiedDate: Date,
  modifiedBy: String,
  short: {
    type: String,
    required: true,
  }
});

// Define User schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 10,
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserGroup'
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /.+\@.+\..+/
  },
  language: String,
  nickname: {
    type: String,
    default: '',
    maxlength: 20
  },
  priority: {
    type: Number,
    default: generateRandomPriority()
  },
  active: {
    type: Boolean,
    default: false,
    required: true
  },
  banned: {
    type: Boolean,
    default: false
  },
  registrationKey: String,
  registrationDate: Date,
  registrationIp: String,
  registrationVerificationCode: String,
  registrationVerificationCodeExpiry: Date,
  lastLoginDate: Date,
  lastLoginIp: String,
  tenancies: [String],
  tenancy: String,
});

// Define UserGroup schema
const userGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  permissions: {
    type: [String]
  },
  priority: {
    type: Number,
    default: generateRandomPriority()
  },
  tenancies: [String],
  active: {
    type: Boolean,
    default: true
  },
  addedDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  addedBy: String,
  modifiedDate: Date,
  modifiedBy: String,
  default: {
    type: Boolean,
    default: false
  }
});

// Define RegistrationKey schema
const registrationKeySchema = new mongoose.Schema({
  regkey: {
    type: String,
    required: true,
    unique: true
  },
  created: {
    type: Date,
    default: Date.now,
    required: true
  },
  used: {
    type: Boolean,
    default: false,
    required: true
  },
  usedDate: Date,
  userId: String,
  userIp: String,
  priority: {
    type: Number,
    default: generateRandomPriority()
  },
  tenancies: [String],
});

const imagesSchema = new mongoose.Schema({
  name: String,
  filename: String,
  originalname: String,
  imageUrl: String,
  priority: {
    type: Number,
    default: generateRandomPriority()
  },
  size: Number,
  mimetype: String,
  description: String,
  addedDate: {
    type: Date,
    default: Date.now
  },
  addedBy: String,
  modifiedDate: Date,
  modifiedUser: String,
  category: String,
  description: String,
  active: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0
  },
  tenancies: [String],
});

const imagesCategoriesSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  active: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: generateRandomPriority()
  },
  addedDate: {
    type: Date,
    default: Date.now
  },
  addedBy: String,
  modifiedDate: Date,
  modifiedBy: String,
  tenancies: [String],
});

// Define Casino schema
const casinoSchema = new mongoose.Schema({
  name: String,
  categories: [String],
  description: String,
  priority: {
    type: Number,
    default: generateRandomPriority()
  },
  addedDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  addedBy: String,
  modifiedDate: Date,
  modifiedBy: String,
  active: {
    type: Boolean,
    default: false
  },
  isNew: {
    type: Boolean,
    default: false
  },
  label: String,
  labelLarge: String,
  individualBonuses: [String],
  displayBonus: String,
  maxBet: Number,
  maxCashout: Number,
  wager: Number,
  wagerType: [String],
  noDeposit: {
    type: Boolean,
    default: false
  },
  prohibitedGamesProtection: {
    type: Boolean,
    default: true
  },
  vpn: {
    type: Boolean,
    default: false
  },
  features: [String],
  individualFeatures: [String],
  providers: [String],
  paymentMethods: [String],
  reviewTitle: String,
  review: String,
  image: String,
  imageUrl: String,
  affiliateUrl: String,
  affiliateShortlink: String,
  licenses: [String],
  tags: [String],
  tenancies: [String],
});

// Define Casino Review schema
const casinoReviewSchema = new mongoose.Schema({
  casinoId: String,
  addedBy: String,
  addedDate: {
    type: Date,
    default: Date.now
  },
  modifiedBy: String,
  modifiedDate: Date,
  rating: Number,
  review: String,
  tenancies: [String],
  timestamp: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: generateRandomPriority()
  }
});

// Define Casino tags schema
const casinoTagsSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  imageUrl: String,
  active: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: generateRandomPriority()
  },
  tenancies: [String],
});

// Define Casino features schema
const casinoFeaturesSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  active: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: generateRandomPriority()
  },
  addedDate: {
    type: Date,
    default: Date.now
  },
  addedBy: String,
  modifiedDate: Date,
  modifiedBy: String,
  tenancies: [String],
});

// Define Casino individual features schema
const casinoIndividualFeaturesSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  casino: String,
  active: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0
  },
  addedDate: {
    type: Date,
    default: Date.now
  },
  addedBy: String,
  modifiedDate: Date,
  modifiedBy: String,
  tenancies: [String],

});

// Define Casino individual bonuses schema
const casinoIndividualBonusesSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  tenancies: [String],

  casino: String,
  active: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: generateRandomPriority()
  },
  addedDate: {
    type: Date,
    default: Date.now
  },
  addedBy: String,
  modifiedDate: Date,
  modifiedBy: String
});

// Define Casino provider schema
const casinoProviderSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  imageUrl: String,
  tenancies: [String],

  active: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: generateRandomPriority()
  },
  addedDate: {
    type: Date,
    default: Date.now
  },
  addedBy: String,
  modifiedDate: Date,
  modifiedBy: String
});

// Define Casino licenses schema
const casinoLicensesSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  imageUrl: String,
  tenancies: [String],

  active: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: generateRandomPriority()
  },
  addedDate: {
    type: Date,
    default: Date.now
  },
  addedBy: String,
  modifiedDate: Date,
  modifiedBy: String
});

// Define Casino payment methods schema
const casinoPaymentMethodsSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  tenancies: [String],

  active: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: generateRandomPriority()
  },
  addedDate: {
    type: Date,
    default: Date.now
  },
  addedBy: String,
  modifiedDate: Date,
  modifiedBy: String
});

// Define Casino wager types schema
const casinoWagerTypesSchema = new mongoose.Schema({
  name: String,
  short: String,
  description: String,
  tenancies: [String],

  active: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: generateRandomPriority()
  },
  addedDate: {
    type: Date,
    default: Date.now
  },
  addedBy: String,
  modifiedDate: Date,
  modifiedBy: String
});

// Define Casino categories schema
const casinoCategoriesSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  tenancies: [String],

  active: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: generateRandomPriority()
  },
  addedDate: {
    type: Date,
    default: Date.now
  },
  addedBy: String,
  modifiedDate: Date,
  modifiedBy: String
});

// Define shortLinks Schema
const shortLinksSchema = new mongoose.Schema({
  url: String,
  shortUrl: String,
  description: String,
  tenancies: [mongoose.Schema.Types.ObjectId,],
  addedDate: {
    type: Date,
    default: Date.now
  },
  addedBy: mongoose.Schema.Types.ObjectId,
  modifiedDate: Date,
  modifiedBy: mongoose.Schema.Types.ObjectId,
  active: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: generateRandomPriority()
  },
  attachedTo: {
    type: mongoose.Schema.Types.ObjectId
  },
  hits: {
    type: Number,
    default: 0
  }
});

// Define shortLinksHits Schema
const shortLinksHitsSchema = new mongoose.Schema({
  shortLink: String,
  ip: String,
  userAgent: String,
  tenancies: [String],

  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Define shortLinksStatistics Schema
const shortLinksStatisticsSchema = new mongoose.Schema({
  shortLink: String,
  hits: Number,
  uniqueHits: Number,
  hits1h: Number,
  hits3h: Number,
  hits6h: Number,
  hits12h: Number,
  hits24h: Number,
  hits7d: Number,
  hits30d: Number,
  hits12m: Number,
  timestamp: {
    type: Date,
    default: Date.now
  },
  tenancies: [String],
});

// Define models
const Session = mongoose.model('Session', SessionSchema);
const Language = mongoose.model('Language', languageSchema);
const Tenancie = mongoose.model('Tenancie', tenanciesSchema)
const TenanciesTypes = mongoose.model('TenanciesTypes', tenanciesTypesSchema);
const User = mongoose.model('User', userSchema);
const UserGroup = mongoose.model('UserGroup', userGroupSchema);
const RegistrationKey = mongoose.model('RegistrationKey', registrationKeySchema);
const Images = mongoose.model('Images', imagesSchema);
const ImagesCategories = mongoose.model('ImagesCategories', imagesCategoriesSchema);
const Casino = mongoose.model('Casino', casinoSchema);
const CasinoReview = mongoose.model('CasinoReview', casinoReviewSchema);
const CasinoTags = mongoose.model('CasinoTags', casinoTagsSchema);
const CasinoFeatures = mongoose.model('CasinoFeatures', casinoFeaturesSchema);
const CasinoLicenses = mongoose.model('CasinoLicenses', casinoLicensesSchema);
const CasinoIndividualFeatures = mongoose.model('CasinoIndividualFeatures', casinoIndividualFeaturesSchema);
const CasinoIndividualBonuses = mongoose.model('CasinoIndividualBonuses', casinoIndividualBonusesSchema);
const CasinoProvider = mongoose.model('CasinoProvider', casinoProviderSchema);
const CasinoPaymentMethods = mongoose.model('CasinoPaymentMethods', casinoPaymentMethodsSchema);
const CasinoWagerTypes = mongoose.model('CasinoWagerTypes', casinoWagerTypesSchema);
const CasinoCategories = mongoose.model('CasinoCategories', casinoCategoriesSchema);
const ShortLinks = mongoose.model('ShortLinks', shortLinksSchema);
const ShortLinksHits = mongoose.model('ShortLinksHits', shortLinksHitsSchema);
const ShortLinksStatistics = mongoose.model('ShortLinksStatistics', shortLinksStatisticsSchema);


const languageEntries = [{
    name: 'English',
    code: 'en'
  },
  {
    name: 'French',
    code: 'fr'
  },
  {
    name: 'Spanish',
    code: 'es'
  },
  {
    name: 'German',
    code: 'de'
  },
];

const tenancieEntries = [{
  name: 'Treudler',
}]

const saveDefaultTenancieDatabaseData = async () => {
  try {
    const promises = [];

    for (const tenancieEntry of tenancieEntries) {
      const existingTenancie = await Tenancie.findOne({
        name: tenancieEntry.name
      });

      if (!existingTenancie) {
        const newTenancie = new Tenancie(tenancieEntry);
        promises.push(newTenancie.save());
        console.log('Tenancie entry saved:', newTenancie);
      } else if (existingTenancie.description !== tenancieEntry.description) {
        existingTenancie.description = tenancieEntry.description;
        promises.push(existingTenancie.save());
        console.log('Tenancie entry updated:', existingTenancie);
      }
    }

    await Promise.all(promises);
    console.log('Default Tenancies Database Data successfully saved.');
  } catch (error) {
    console.error('Error saving Default Tenancies Database Data:', error);
  }
};

saveDefaultTenancieDatabaseData();

const tenanciesTypesEntries = [{
  name: 'Default',
  short: 'default',
  description: 'Default Tenancies Type'
}, {
  name: 'Hosting',
  short: 'hosting',
  description: 'Hosting Tenant'
}, {
  name: 'Casino Affiliate',
  short: 'casinoAffiliate',
  description: 'Casino Affiliate Tenant'
}, {
  name: 'Lagnum',
  short: 'lagnum',
  description: 'Lagnum Tenant'
}];

const saveDefaultTenanciesTypesDatabaseData = async () => {
  try {
    const promises = [];

    for (const tenanciesTypesEntry of tenanciesTypesEntries) {
      const existingTenanciesTypes = await TenanciesTypes.findOne({
        name: tenanciesTypesEntry.name
      });

      if (!existingTenanciesTypes) {
        const newTenanciesTypes = new TenanciesTypes(tenanciesTypesEntry);
        promises.push(newTenanciesTypes.save());
        console.log('TenanciesTypes entry saved:', newTenanciesTypes);
      } else if (existingTenanciesTypes.description !== tenanciesTypesEntry.description) {
        existingTenanciesTypes.description = tenanciesTypesEntry.description;
        promises.push(existingTenanciesTypes.save());
        console.log('TenanciesTypes entry updated:', existingTenanciesTypes);
      }
    }

    await Promise.all(promises);
    console.log('Default TenanciesTypes Database Data successfully saved.');
  } catch (error) {
    console.error('Error saving Default TenanciesTypes Database Data:', error);
  }
};

saveDefaultTenanciesTypesDatabaseData();

const registrationKeyEntries = [{
  regkey: 'admin',
  created: new Date(),
  used: false
}];

const userAdminGroup = new UserGroup({
  name: 'Admin',
  permissions: ['authenticate', 'viewDashboard', 'manageTenancies', 'manageRegistrationKeys', 'manageUsers', 'manageShortLinks', 'manageCasinos',
    'manageLinks', 'manageProvider', 'managePaymentMethods', 'manageAccount', 'manageRegistrationKeys',
    'manageSessions', 'manageImages', 'manageImagesCategories', 'manageUsers'
  ]
});

const userOperatorGroup = new UserGroup({
  name: 'Operator',
  permissions: ['authenticate', 'viewDashboard', 'manageCasinos', 'manageLinks', 'manageProvider',
    'managePaymentMethods', 'manageAccount'
  ]
});

const userUserGroup = new UserGroup({
  name: 'User',
  permissions: ['authenticate', 'viewDashboard', 'manageAccount']
});

const saveDefaultUserDatabaseData = async () => {
  try {
    const adminGroup = await UserGroup.findOne({
      name: 'Admin'
    });
    const userGroup = await UserGroup.findOne({
      name: 'User'
    });
    const operatorGroup = await UserGroup.findOne({
      name: 'Operator'
    });

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
      const existingLanguage = await Language.findOne({
        name: languageEntry.name
      });

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
      const existingRegistrationKey = await RegistrationKey.findOne({
        regkey: registrationKeyEntry.regkey
      });

      if (!existingRegistrationKey) {
        const newRegistrationKey = new RegistrationKey(registrationKeyEntry);
        promises.push(newRegistrationKey.save());
        console.log('Registration key entry saved:', newRegistrationKey);
      }
    }

    await Promise.all(promises);
    console.log('Default UserGroups and RegistrationKeys Database Data successfully saved.');
  } catch (error) {
    console.error('Error saving Default UserGroups and RegistrationKeys Database Data:', error);
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

const CasinoCategoriesEntries = [{
  name: 'Default',
  description: 'Default Casino Category',
  image: ''
}];

const saveDefaultCasinoDatabaseData = async () => {
  try {
    const promises = [];

    for (const casinoFeaturesEntry of CasinoFeaturesEntries) {
      const existingCasinoFeatures = await CasinoFeatures.findOne({
        name: casinoFeaturesEntry.name
      });

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
      const existingCasinoProvider = await CasinoProvider.findOne({
        name: casinoProviderEntry.name
      });

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
      const existingCasinoPaymentMethods = await CasinoPaymentMethods.findOne({
        name: casinoPaymentMethodsEntry.name
      });

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
      const existingCasinoWagerTypes = await CasinoWagerTypes.findOne({
        name: casinoWagerTypesEntry.name
      });

      if (!existingCasinoWagerTypes) {
        const newCasino = new CasinoWagerTypes(casinoWagerTypesEntry);
        promises.push(newCasino.save());
        console.log('CasinoWagerTypes entry saved:', newCasino);
      }
    }

    for (const casinoCategoriesEntry of CasinoCategoriesEntries) {
      const existingCasinoCategories = await CasinoCategories.findOne({
        name: casinoCategoriesEntry.name
      });

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

const imagesCategoriesEntry = {
  name: 'Default',
  description: 'Default images category',
  image: 'https://www.casinofreak.com/images/categories/new.png',
  active: true,
  priority: 1,
  addedDate: new Date(),
  addedBy: 'System',
};

const saveDefaultImagesCategoriesDatabaseData = async () => {
  try {
    const promises = [];

    const existingImagesCategories = await ImagesCategories.findOne({
      name: imagesCategoriesEntry.name
    });

    if (!existingImagesCategories) {
      const newImagesCategories = new ImagesCategories(imagesCategoriesEntry);
      promises.push(newImagesCategories.save());
      console.log('ImagesCategories entry saved:', newImagesCategories);
    }

    await Promise.all(promises);
    console.log('Default Image Categories Database Data successfully saved.');
  } catch (error) {
    console.error('Error saving Default Image Categories Database Data:', error);
  }
};

saveDefaultImagesCategoriesDatabaseData();

//#endregion MongoDB

// Middleware
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.use((req, res, next) => {
  setTimeout(next, 50);
});

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

const getTenancyByUserId = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (user) {
      return user.tenancy;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error retrieving user:', error);
    return null;
  }
};


//#region Auth 

// Login user
app.post('/api/auth/login', (req, res) => {
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

  User.findOne({
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
          UserGroup.findOne({
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
                  user.save()
                    .then(() => {
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

                  res.json({
                    success: true
                  });
                }
              } else {
                // No tenancy provided, remove tenancy in the database
                user.tenancy = undefined;
                user.save()
                  .then(() => {
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
app.get('/api/auth/session', checkPermissions('authenticate'), (req, res) => {
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
app.post('/api/auth/loginAs', checkPermissions('manageUsers'), (req, res) => {
  const {
    userId
  } = req.body;

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

      UserGroup.findOne({
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
app.get('/api/auth/sessions', checkPermissions('manageSessions'), (req, res) => {
  Session.find()
    .then((results) => {
      res.json(results);
    })
    .catch((error) => {
      console.error('Error retrieving sessions:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Logout user
app.post('/api/auth/logout', checkPermissions('authenticate'), (req, res) => {
  req.session.destroy();
  res.json({
    success: true
  });
});

//#endregion Auth

//#region Tenancies

// Get all tenancies types from MongoDB
app.get('/api/tenancies/types', checkPermissions('manageTenancies'), (req, res) => {
  TenanciesTypes.find()
    .then((results) => {
      res.json(results);
    })
    .catch((error) => {
      console.error('Error retrieving tenancies types:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Get all tenancies from MongoDB
app.get('/api/tenancies', checkPermissions('manageTenancies'), (req, res) => {
  Tenancie.find()
    .then((results) => {
      res.json(results);
    })
    .catch((error) => {
      console.error('Error retrieving tenancies:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Get tenancie by ID from MongoDB
app.get('/api/tenancies/:id', checkPermissions('manageTenancies'), (req, res) => {
  const {
    id
  } = req.params;

  Tenancie.findById(id)
    .then((result) => {
      if (!result) {
        res.status(404).json({
          error: 'Tenancie not found'
        });
        return;
      }

      res.json(result);
    })
    .catch((error) => {
      console.error('Error retrieving tenancie:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Add tenancie to MongoDB
app.post('/api/tenancies/add', checkPermissions('manageTenancies'), (req, res) => {
  const {
    name,
    notes,
    type,
    image
  } = req.body;
  const userId = req.session.user.userId;

  if (!name) {
    res.status(400).json({
      error: 'Name is required'
    });
    return;
  }

  const tenancie = new Tenancie({
    name,
    notes,
    createdBy: userId,
    createdDate: new Date(),
    admins: [userId],
    image,
    type
  });

  tenancie.save()
    .then(() => {
      res.status(201).json({
        success: true
      });
    })
    .catch((error) => {
      console.error('Error inserting tenancie:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Edit tenancie in MongoDB
app.put('/api/tenancies/:id', checkPermissions('manageTenancies'), (req, res) => {
  const {
    id
  } = req.params;
  const {
    name,
    notes,
    createdBy,
    createdDate,
    modifiedBy,
    modifiedDate,
    image
  } = req.body;

  if (!name) {
    res.status(400).json({
      error: 'Name is required'
    });
    return;
  }

  Tenancie.findByIdAndUpdate(id, {
      name,
      notes,
      createdBy,
      createdDate,
      modifiedBy,
      modifiedDate,
      image
    })
    .then(() => {
      res.json({
        success: true
      });
    })
    .catch((error) => {
      console.error('Error updating tenancie:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Delete tenancie from MongoDB
app.delete('/api/tenancies/:id', checkPermissions('manageTenancies'), (req, res) => {
  const {
    id
  } = req.params;

  Tenancie.findByIdAndDelete(id)
    .then(() => {
      res.json({
        success: true
      });
    })
    .catch((error) => {
      console.error('Error deleting tenancie:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

//#endregion Tenancies

//#region User

// Insert user into MongoDB
app.post('/api/users/register', (req, res) => {
  console.log(req.body);
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

  RegistrationKey.findOne({
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
        User.findOne({
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

// Get user details of the current user
app.get('/api/user', checkPermissions('authenticate'), (req, res) => {
  const {
    userId
  } = req.session.user;

  User.findById(userId)
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

// Get available tenancies for the current user
app.get('/api/user/tenancies', checkPermissions('authenticate'), (req, res) => {
  const {
    userId
  } = req.session.user;

  User.findById(userId)
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

      Tenancie.find({
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

// Get details of current tenancy of the current user
app.get('/api/user/tenancy', checkPermissions('authenticate'), (req, res) => {
  const {
    userId
  } = req.session.user;

  User.findById(userId)
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

      Tenancie.findById(tenancy)
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

// Change tenancy of the current user
app.put('/api/user/tenancy/:tenancyId', checkPermissions('authenticate'), (req, res) => {
  const {
    userId
  } = req.session.user;
  const {
    tenancyId
  } = req.params;
  console.log('User', userId, 'requested changing tenancy to', tenancyId);

  // Check if the tenancy exists in the user's tenancies
  User.findById(userId)
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
      const tenancyExists = Tenancie.exists({
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
      User.findByIdAndUpdate(userId, {
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

  User.findByIdAndUpdate(userId, {
      username,
      nickname,
      email
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

// Edit user details of the current user
app.post('/api/user', editUserDetails);


// Change password of the current user
app.post('/api/user/password', checkPermissions('manageAccount'), (req, res) => {
  const {
    userId
  } = req.session.user;
  const {
    currentPassword,
    newPassword
  } = req.body;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        res.status(404).json({
          error: 'User not found'
        });
        return;
      }
      console.log(user);
      console.log(currentPassword + ' ' + newPassword);
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

// Get all users from MongoDB
app.get('/api/users', checkPermissions('manageUsers'), (req, res) => {
  User.find()
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

// Delete user from MongoDB by ID
app.delete('/api/users', checkPermissions('manageUsers'), (req, res) => {
  const {
    id
  } = req.body; // Get the ID from the request body
  User.deleteOne({
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

// Get details of a user by ID
app.get('/api/users/:id', checkPermissions('manageUsers'), (req, res) => {
  const {
    id
  } = req.params;

  User.findById(id)
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

// Edit user details by ID
app.put('/api/users/:id', checkPermissions('manageUsers'), (req, res) => {
  const {
    id
  } = req.params;
  const {
    username,
    nickname,
    email,
    active,
    banned,
    groupId,
    tenancies,
    tenancy
  } = req.body;
  console.log(req.body);

  if (!username) {
    res.status(400).json({
      error: 'Username is required'
    });
    return;
  }

  User.findByIdAndUpdate(id, {
      username,
      nickname,
      email,
      active,
      banned,
      groupId,
      tenancies,
      tenancy
    })
    .then(() => {
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
});

//#endregion User

//#region Registration Keys
// Get all registration keys from MongoDB
app.get('/api/registrationkeys', checkPermissions('manageRegistrationKeys'), (req, res) => {
  RegistrationKey.find()
    .then((results) => {
      res.json(results);
    })
    .catch((error) => {
      console.error('Error retrieving registration keys:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Insert registration key into MongoDB
app.post('/api/registrationkeys/add', checkPermissions('manageRegistrationKeys'), (req, res) => {
  const {
    regkey
  } = req.body;

  const registrationKey = new RegistrationKey({
    regkey: regkey
  });

  registrationKey.save()
    .then(() => {
      res.redirect('/dashboard');
    })
    .catch((error) => {
      console.error('Error inserting registration key:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Generate and insert registration key into MongoDB
app.post('/api/registrationkeys/generate', checkPermissions('manageRegistrationKeys'), (req, res) => {
  const regkey = Math.random().toString(36).substr(2, 10);

  const registrationKey = new RegistrationKey({
    regkey: regkey
  });

  registrationKey.save()
    .then((result) => {
      res.json({
        id: result._id,
        regkey: regkey
      });
    })
    .catch((error) => {
      console.error('Error generating registration key:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Delete registration key from MongoDB by ID
app.delete('/api/registrationkeys/:id', checkPermissions('manageRegistrationKeys'), (req, res) => {
  const {
    id
  } = req.params.id;
  RegistrationKey.deleteOne({
      _id: id
    })
    .then((result) => {
      if (result.deletedCount === 0) {
        throw new Error('Registration key not found');
      }
      res.json({
        success: true,
        id: id,
        status: 'deleted'
      });
      console.log('Registration key deleted');
    })
    .catch((error) => {
      console.error('Error deleting registration key:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});
//#endregion Registration Keys

//#region Images

//#region Image Categories

// Get all images categories from MongoDB
app.get('/api/images/categories', checkPermissions('manageImages' || 'manageImagesCategories'), (req, res) => {
  const userTenancy = req.session.user.tenancy;

  ImagesCategories.find({
      tenancies: userTenancy
    })
    .then((results) => {
      res.json(results);
    })
    .catch((error) => {
      console.error('Error retrieving images categories:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Insert image category into MongoDB
app.post('/api/images/categories/add', checkPermissions('manageImagesCategories'), (req, res) => {
  const {
    name,
    description,
    image,
    priority,
    active
  } = req.body;
  const {
    userId,
    tenancy
  } = req.session.user;

  const imagesCategories = new ImagesCategories({
    addedBy: userId,
    name: name,
    description: description,
    image: image,
    priority: priority,
    active: active,
    addedDate: Date.now(),
    tenancies: tenancy // Add tenancy field
  });

  imagesCategories.save()
    .then(() => {
      res.redirect('/dashboard');
    })
    .catch((error) => {
      console.error('Error inserting image category:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Duplicate image category
app.post('/api/images/categories/:id/duplicate', checkPermissions('manageImagesCategories'), (req, res) => {
  const {
    userId
  } = req.session.user;
  const {
    id
  } = req.params;

  ImagesCategories.findOne({
      _id: id,
      tenancies: req.session.user.tenancy // Add condition for tenancy
    })
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
          tenancies: req.session.user.tenancy // Set tenancy for duplicated object
        });

        newImagesCategories.save()
          .then(() => {
            res.redirect('/dashboard');
          })
          .catch((error) => {
            console.error('Error duplicating image category:', error);
            res.status(500).json({
              error: 'Internal server error'
            });
          });
      }
    })
    .catch((error) => {
      console.error('Error duplicating image category:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Edit image category
app.put('/api/images/categories/:id', checkPermissions('manageImagesCategories'), (req, res) => {
  const {
    userId
  } = req.session.user;
  const {
    id
  } = req.params;
  const {
    name,
    description,
    image,
    priority,
    active
  } = req.body;

  ImagesCategories.findOneAndUpdate({
        _id: id,
        tenancies: req.session.user.tenancy
      }, // Add condition for tenancy
      {
        name,
        description,
        image,
        priority,
        active,
        modifiedDate: Date.now(),
        modifiedBy: userId
      }, {
        new: true
      } // Return the updated document
    )
    .then((updatedImageCategory) => {
      if (!updatedImageCategory) {
        return res.status(404).json({
          error: 'Image category not found'
        });
      }

      res.status(200).json({
        success: 'Image category updated',
        imageCategory: updatedImageCategory
      });
    })
    .catch((error) => {
      console.error('Error editing image category:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Delete image category from MongoDB by ID
app.delete('/api/images/categories/:id', checkPermissions('manageImagesCategories'), (req, res) => {
  const imageCategoryId = req.params.id;

  ImagesCategories.findOneAndDelete({
      _id: imageCategoryId,
      tenancies: req.session.user.tenancy
    })
    .then((deletedImageCategory) => {
      if (!deletedImageCategory) {
        return res.status(404).json({
          error: 'Image category not found'
        });
      }

      res.json({
        message: 'Image category deleted successfully'
      });
    })
    .catch((error) => {
      console.error('Error deleting image category:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Get the category of an image by ID
app.get('/api/images/:id/category', checkPermissions('manageImages'), (req, res) => {
  const id = req.params.id;

  Images.findById(id)
    .populate({
      path: 'category',
      match: {
        tenancies: req.session.user.tenancy
      } // Filter by tenancy
    })
    .then((image) => {
      if (!image) {
        return res.status(404).json({
          error: 'Image not found'
        });
      }

      if (!image.category) {
        return res.status(404).json({
          error: 'Category not found for the image'
        });
      }

      res.json(image.category);
    })
    .catch((error) => {
      console.error('Error retrieving image category:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

//#endregion Image Categories

//#region Images Images 

// Get all images from MongoDB
app.get('/api/images', checkPermissions('manageImages'), (req, res) => {
  Images.find({
      tenancies: req.session.user.tenancy
    })
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
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Get all images of a specific category
app.get('/api/images/categories/:categoryId/images', checkPermissions('manageImages'), (req, res) => {
  const categoryId = req.params.categoryId;
  const userTenancy = req.session.user.tenancy;

  Images.find({
      category: categoryId,
      tenancies: userTenancy
    })
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
      res.status(500).json({
        error: 'Internal server error'
      });
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
const upload = multer({
  storage: storage
});

// Upload image and save it to the database
app.post('/api/images', checkPermissions('manageImages'), upload.single('image'), (req, res) => {
  const image = req.file;

  if (!image) {
    return res.status(400).json({
      error: 'No image file provided'
    });
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
    tenancies: req.session.user.tenancy // Add tenancies field
  });

  newImage.save()
    .then((savedImage) => {
      setImageUrl(savedImage._id);
      res.json({
        message: 'Image uploaded and saved successfully',
        image: savedImage
      });
    })
    .catch((error) => {
      console.error('Error saving image:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Edit image
app.put('/api/images/:id', checkPermissions('manageImages'), (req, res) => {
  const {
    userId
  } = req.session.user;
  const {
    id
  } = req.params;
  const {
    name,
    description,
    priority,
    active,
    category
  } = req.body;
  console.log(req.body);

  Images.findOne({
      _id: id,
      tenancies: req.session.user.tenancy
    }) // Add condition for tenancies
    .then((image) => {
      if (!image) {
        res.status(404).json({
          error: 'Image not found'
        });
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
            res.status(200).json({
              message: 'Image ' + image.name + ' edited successfully'
            });
          })
          .catch((error) => {
            console.error('Error editing image:', error);
            res.status(500).json({
              error: 'Internal server error'
            });
          });
      }
    })
    .catch((error) => {
      console.error('Error editing image:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Delete image from MongoDB and from the file system by ID
app.delete('/api/images/:id', checkPermissions('manageImages'), (req, res) => {
  const id = req.params.id;
  const {
    tenancy
  } = req.session.user;

  Images.findOneAndDelete({
      _id: id,
      tenancies: tenancy
    })
    .then((deletedImage) => {
      if (!deletedImage) {
        return res.status(404).json({
          error: 'Image not found'
        });
      }

      // Delete the image from the file system
      fs.unlinkSync(`public/img/images/${deletedImage.filename}`);

      res.json({
        message: 'Image deleted successfully'
      });
    })
    .catch((error) => {
      console.error('Error deleting image:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

//#endregion Media Images

//#endregion Images

//#region ShortLinks

// Get all short links from MongoDB
app.get('/api/shortlinks', checkPermissions('manageShortLinks'), (req, res) => {
  const { tenancy } = req.session.user;

  ShortLinks.find({ tenancies: tenancy })
    .then((results) => {
      res.json(results);
    })
    .catch((error) => {
      console.error('Error retrieving short links:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

// Get short link by ID from MongoDB
app.get('/api/shortlinks/:id', checkPermissions('manageShortLinks'), (req, res) => {
  const { id } = req.params;
  const { tenancy } = req.session.user;

  ShortLinks.findOne({ _id: id, tenancies: tenancy })
    .then((result) => {
      if (!result) {
        res.status(404).json({ error: 'Short link not found' });
        return;
      }

      res.json(result);
    })
    .catch((error) => {
      console.error('Error retrieving short link:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
});

function alterShortLink(id, description, url, shortUrl, attachedTo, addedBy, addedDate, modifiedBy, modifiedDate, tenancies, hits, userTenancy) {
  return new Promise((resolve, reject) => {

    try {
      // Validate the short link data
      validateShortLinkData(description, url, shortUrl);
    } catch (error) {
      reject({ error: error.message });
      return;
    }

    // Check if an ID is provided
    if (id) {
      // Update existing entry
      ShortLinks.findById(id)
        .then((shortLink) => {
          if (!shortLink) {
            reject({ error: 'Short link not found' });
            return;
          }

          // Make sure the ShortLink tenancies include the user tenancy
          if (!shortLink.tenancies.includes(userTenancy)) {
            reject({ error: 'User tenancy is not included in the ShortLink tenancies' });
            return;
          }

          // Update the ShortLink with the provided values
          shortLink.description = description;
          shortLink.url = url;
          shortLink.shortUrl = shortUrl;
          shortLink.modifiedBy = modifiedBy;
          shortLink.modifiedDate = modifiedDate;

          shortLink.save()
            .then(() => {
              console.log('Short link updated successfully');
              resolve({ message: 'Short link updated successfully' });
            })
            .catch((error) => {
              console.error('Error updating short link:', error);
              reject({ error: 'Error updating short link' });
            });
        })
        .catch((error) => {
          console.error('Error finding short link:', error);
          reject({ error: 'Error finding short link' });
        });
    } else {
      // Check if the ShortLink already exists for the tenancy
      ShortLinks.findOne({ shortUrl, tenancies: tenancies })
        .then((existingShortLink) => {
          if (existingShortLink) {
            reject({ error: 'Short link already exists for the tenancy' });
            return;
          }

          // Create a new ShortLink entry
          
          const newShortLink = new ShortLinks({ description, url, shortUrl, attachedTo, addedBy, addedDate, tenancies });
          newShortLink.save()
            .then(() => {
              console.log('Short link created successfully');
              resolve({ message: 'Short link created successfully' });
            })
            .catch((error) => {
              console.error('Error creating short link:', error);
              reject({ error: 'Error creating short link' });
            });
        })
        .catch((error) => {
          console.error('Error finding existing short link:', error);
          reject({ error: 'Error finding existing short link' });
        });
    }
  });
}

// Function to validate short link data
function validateShortLinkData(description, url, shortUrl) {
  if (!url) {
    throw new Error('URL is required');
  }

  // Check if the URL is valid
  try {
    new URL(url);
  } catch (error) {
    throw new Error('Invalid URL');
  }

  if (!shortUrl) {
    throw new Error('Short URL is required');
  }

  if (shortUrl.length < 3) {
    throw new Error('Short URL must be at least 3 characters long');
  }

  if (shortUrl.length > 20) {
    throw new Error('Short URL must be at most 20 characters long');
  }

  if (!/^[a-zA-Z0-9]+$/.test(shortUrl)) {
    throw new Error('Short URL must contain only letters and numbers');
  }

  if (description && description.length > 100) {
    throw new Error('Description must be at most 100 characters long');
  }
  
  return true;
}

// Add short link to MongoDB
app.post('/api/shortlinks', checkPermissions('manageShortLinks'), (req, res) => {
  const { description, url, shortUrl } = req.body;
  const { userId, tenancy } = req.session.user;

  const addedDate = Date.now();

  // use the alterShortLink function to add the short link
  alterShortLink(null, description, url, shortUrl, null, userId, addedDate, null, null, tenancy, null, null)
    .then((message) => {
      res.status(200).json({ message });
    })
    .catch((error) => {
      console.error('Error creating short link:', error);
      res.status(500).json({ error: error });
    });
});


// Edit short link in MongoDB
app.put('/api/shortlinks/:id', checkPermissions('manageShortLinks'), (req, res) => {
  const { id } = req.params;
  const { description, url, shortUrl } = req.body;
  const { userId, tenancy } = req.session.user;

  const modifiedDate = Date.now();

  // use the alterShortLink function to edit the short link
  alterShortLink(id, description, url, shortUrl, null, null, null, userId, modifiedDate, null, null, tenancy)
    .then((message) => {
      res.status(200).json({ message });
    })
    .catch((error) => {
      console.error('Error editing short link:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  );
});

// Get all short link hits from MongoDB
// This table contains all hits of all short links and this is a very large table.
// Therefore, it is not recommended to use this endpoint.
// Instead, use the endpoint below to get the hits of a specific short link.

app.get('/api/shortlinks/hits', checkPermissions('manageShortLinks'), (req, res) => {
  ShortLinksHits.find({
      tenancies: req.session.user.tenancy
    })
    .then((results) => {
      res.json(results);
    })
    .catch((error) => {
      console.error('Error retrieving short link hits:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Get short link hits by short link ID from MongoDB
app.get('/api/shortlinks/:id/hits', checkPermissions('manageShortLinks'), (req, res) => {
  const {
    id
  } = req.params;

  ShortLinksHits.find({
      id: id,
      tenancies: req.session.user.tenancy
    })
    .then((results) => {
      res.json(results);
    })
    .catch((error) => {
      console.error('Error retrieving short link hits:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Get short link statistics by short link ID from MongoDB
app.get('/api/shortlinks/:id/statistics', checkPermissions('manageShortLinks'), (req, res) => {
  const {
    id
  } = req.params;
  const {
    tenancy
  } = req.session.user;

  ShortLinks.findById(id)
    .then((shortLink) => {
      if (!shortLink) {
        throw new Error('Short link not found');
      }
      console.log(shortLink);
      console.log(tenancy);
      if (!shortLink.tenancies.includes(tenancy)) {
        throw new Error('Unauthorized');
      }
      return ShortLinksStatistics.find({
        shortLink: id,
        tenancies: tenancy
      });
    })
    .then((results) => {
      res.json(results);
    })
    .catch((error) => {
      console.error('Error retrieving short link statistics:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Delete short link from MongoDB
app.delete('/api/shortlinks/:id', checkPermissions('manageShortLinks'), (req, res) => {
  const {
    id
  } = req.params;
  const {
    tenancy
  } = req.session.user;

  ShortLinks.findById(id)
    .then((shortLink) => {
      if (!shortLink) {
        throw new Error('Short link not found');
      }
      if (!shortLink.tenancies.includes(tenancy)) {
        throw new Error('Unauthorized');
      }
      return ShortLinks.findByIdAndDelete(id);
    })
    .then(() => {
      res.json({
        success: true,
        message: 'Short link deleted'
      });
      console.log('Short link deleted');
    })
    .catch((error) => {
      console.error('Error deleting short link:', error);
      if (error.message === 'Short link not found' || error.message === 'Unauthorized') {
        res.status(404).json({
          error: error.message
        });
      } else {
        res.status(500).json({
          error: 'Internal server error'
        });
      }
    });
});

//#endregion ShortLinks

//#region Casino Categories

// Get all casino categories from MongoDB
app.get('/api/casinos/categories', checkPermissions('manageCasinos'), (req, res) => {
  const {
    tenancy
  } = req.session.user;

  CasinoCategories.find({
      tenancies: tenancy
    })
    .then((results) => {
      res.json(results);
    })
    .catch((error) => {
      console.error('Error retrieving casino categories:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Get amount of all categories
app.get('/api/casinos/categories/count', checkPermissions('manageCasinos'), (req, res) => {
  const {
    tenancy
  } = req.session.user;

  CasinoCategories.countDocuments({
      tenancies: tenancy
    })
    .then((results) => {
      res.json(results);
    })
    .catch((error) => {
      console.error('Error retrieving casino categories:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});


// Get details of a specific casino category
app.get('/api/casinos/categories/:id', checkPermissions('manageCasinos'), (req, res) => {
  const {
    id
  } = req.params;
  const {
    tenancy
  } = req.session.user;

  CasinoCategories.findOne({
      _id: id,
      tenancies: tenancy
    })
    .then((casinoCategory) => {
      if (!casinoCategory) {
        return res.status(404).json({
          error: 'Casino category not found'
        });
      }

      res.json(casinoCategory);
    })
    .catch((error) => {
      console.error('Error retrieving casino category:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Insert casino category into MongoDB
app.post('/api/casinos/categories/add', checkPermissions('manageCasinos'), (req, res) => {
  const {
    name,
    description,
    image,
    priority,
    active
  } = req.body;
  const {
    userId
  } = req.session.user;

  const casinoCategories = new CasinoCategories({
    addedBy: userId,
    name: name,
    description: description,
    image: image,
    priority: priority,
    active: active,
    addedDate: Date.now(),
    tenancies: req.session.user.tenancy // Add tenancy condition
  });

  casinoCategories.save()
    .then(() => {
      res.redirect('/dashboard');
    })
    .catch((error) => {
      console.error('Error inserting casino category:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Duplicate casino category
app.post('/api/casinos/categories/:id/duplicate', checkPermissions('manageCasinos'), (req, res) => {
  const {
    userId
  } = req.session.user;
  const {
    id
  } = req.params;

  CasinoCategories.findOne({
      _id: id,
      tenancies: req.session.user.tenancy // Add tenancy condition
    })
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
          tenancies: req.session.user.tenancy // Set tenancy for duplicated category
        });

        newCasinoCategories.save()
          .then(() => {
            res.redirect('/dashboard');
          })
          .catch((error) => {
            console.error('Error inserting casino category:', error);
            res.status(500).json({
              error: 'Internal server error'
            });
          });
      }
    })
    .catch((error) => {
      console.error('Error duplicating casino category:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Edit casino category
app.put('/api/casinos/categories/:id', checkPermissions('manageCasinos'), (req, res) => {
  const {
    userId
  } = req.session.user;
  const {
    id
  } = req.params;
  const {
    name,
    description,
    image,
    priority,
    active
  } = req.body;

  CasinoCategories.findOneAndUpdate({
      _id: id,
      tenancies: req.session.user.tenancy // Add tenancy condition
    }, {
      name,
      description,
      image,
      priority,
      active
    }, {
      modifiedBy: userId,
      modifiedDate: Date.now()
    })
    .then((updatedCasinoCategories) => {
      if (!updatedCasinoCategories) {
        throw new Error('Casino category not found');
      }
      res.json(updatedCasinoCategories);
      console.log('Casino category updated: ' + updatedCasinoCategories.name);
    })
    .catch((error) => {
      console.error('Error updating casino category:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Delete casino category
app.delete('/api/casinos/categories/:id', checkPermissions('manageCasinos'), (req, res) => {
  const {
    id
  } = req.params;

  CasinoCategories.findOneAndDelete({
      _id: id,
      tenancies: req.session.user.tenancy // Add tenancy condition
    })
    .then((deletedCasinoCategory) => {
      if (!deletedCasinoCategory) {
        throw new Error('Casino category not found');
      }
      res.json(deletedCasinoCategory);
      console.log('Casino category deleted: ' + deletedCasinoCategory.name);
    })
    .catch((error) => {
      console.error('Error deleting casino category:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

//#endregion Casino Categories

//#region Casino Tags

// Insert casino tag into MongoDB
app.post('/api/casinos/tags', checkPermissions('manageCasinos'), (req, res) => {
  const {
    name,
    description,
    image,
    active
  } = req.body;
  const {
    userId
  } = req.session.user;
  const {
    tenancy
  } = req.session.user;

  const casinoTags = new CasinoTags({
    addedBy: userId,
    name: name,
    description: description,
    image: image,
    active: active,
    addedDate: Date.now(),
    tenancies: [tenancy], // Set the tenancies to an array containing the user's tenancy
  });

  // Save the casino tag to the database
  casinoTags.save()
    .then((savedCasinoTag) => {
      res.json(savedCasinoTag);
      console.log('Casino tag saved:', savedCasinoTag);
    })
    .catch((error) => {
      console.error('Error saving casino tag:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Get all casino tags from MongoDB
app.get('/api/casinos/tags', checkPermissions('manageCasinos'), (req, res) => {
  const {
    tenancy
  } = req.session.user;

  CasinoTags.find({
      tenancies: tenancy
    })
    .then((results) => {
      res.json(results);
    })
    .catch((error) => {
      console.error('Error retrieving casino tags:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Get amount of all tags
app.get('/api/casinos/tags/count', checkPermissions('manageCasinos'), (req, res) => {
  const {
    tenancy
  } = req.session.user;

  CasinoTags.countDocuments({
      tenancies: tenancy
    })
    .then((results) => {
      res.json(results);
    })
    .catch((error) => {
      console.error('Error retrieving casino tags:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Get details of a specific casino tag
app.get('/api/casinos/tags/:id', checkPermissions('manageCasinos'), (req, res) => {
  const {
    id
  } = req.params;
  const {
    tenancy
  } = req.session.user;

  CasinoTags.findOne({
      _id: id,
      tenancies: tenancy
    })
    .then((casinoTag) => {
      if (!casinoTag) {
        return res.status(404).json({
          error: 'Casino tag not found'
        });
      }

      res.json(casinoTag);
    })
    .catch((error) => {
      console.error('Error retrieving casino tag:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Insert casino tag into MongoDB
app.post('/api/casinos/tags', checkPermissions('manageCasinos'), (req, res) => {
  const {
    name,
    description,
    image,
    active
  } = req.body;
  const {
    userId
  } = req.session.user;
  const {
    tenancy
  } = req.session.user;

  const casinoTags = new CasinoTags({
    addedBy: userId,
    name: name,
    description: description,
    image: image,
    active: active,
    addedDate: Date.now(),
    tenancies: [tenancy], // Set the tenancies to an array containing the user's tenancy
  });

  casinoTags.save()
    .then(() => {
      res.redirect('/dashboard');
    })
    .catch((error) => {
      console.error('Error inserting casino tag:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Duplicate casino tag
app.post('/api/casinos/tags/:id/duplicate', checkPermissions('manageCasinos'), (req, res) => {
  const {
    userId
  } = req.session.user;
  const {
    id
  } = req.params;
  const {
    tenancy
  } = req.session.user;

  CasinoTags.findOne({
      _id: id,
      tenancies: tenancy
    })
    .then((casinoTags) => {
      if (!casinoTags) {
        throw new Error('Casino tag not found');
      } else {
        const newPriority = generateRandomPriority();
        const newCasinoTags = new CasinoTags({
          addedBy: userId,
          name: casinoTags.name + ' (Copy)',
          description: casinoTags.description,
          image: casinoTags.image,
          priority: newPriority,
          active: casinoTags.active,
          addedDate: Date.now(),
          tenancies: casinoTags.tenancies, // Copy the tenancies from the original object
        });

        newCasinoTags.save()
          .then(() => {
            res.redirect('/dashboard');
          })
          .catch((error) => {
            console.error('Error duplicating casino tag:', error);
            res.status(500).json({
              error: 'Internal server error'
            });
          });
      }
    })
    .catch((error) => {
      console.error('Error duplicating casino tag:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Edit casino tag
app.put('/api/casinos/tags/:id', checkPermissions('manageCasinos'), (req, res) => {
  const {
    userId
  } = req.session.user;
  const {
    id
  } = req.params;
  const {
    name,
    description,
    image,
    priority,
    active
  } = req.body;
  const {
    tenancy
  } = req.session.user;

  CasinoTags.findOneAndUpdate({
        _id: id,
        tenancies: tenancy
      }, // Only update if tenancies match
      {
        name,
        description,
        image,
        priority,
        active
      }, {
        modifiedBy: userId,
        modifiedDate: Date.now()
      }
    )
    .then((updatedCasinoTags) => {
      if (!updatedCasinoTags) {
        throw new Error('Casino tag not found');
      }
      res.json(updatedCasinoTags);
      console.log('Casino tag updated: ' + updatedCasinoTags.name);
    })
    .catch((error) => {
      console.error('Error updating casino tag:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Delete casino tag
app.delete('/api/casinos/tags/:id', checkPermissions('manageCasinos'), (req, res) => {
  const {
    id
  } = req.params;
  const {
    tenancy
  } = req.session.user;

  CasinoTags.findOneAndDelete({
      _id: id,
      tenancies: tenancy
    })
    .then((deletedCasinoTag) => {
      if (!deletedCasinoTag) {
        throw new Error('Casino tag not found');
      }
      res.json(deletedCasinoTag);
      console.log('Casino tag deleted: ' + deletedCasinoTag.name);
    })
    .catch((error) => {
      console.error('Error deleting casino tag:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

//#endregion Casino Tags

//#region Casino Features

// Get all casino features from MongoDB
app.get('/api/casinos/features', checkPermissions('manageCasinos'), (req, res) => {
  const {
    tenancy
  } = req.session.user;

  CasinoFeatures.find({
      tenancies: tenancy
    })
    .then((results) => {
      res.json(results);
    })
    .catch((error) => {
      console.error('Error retrieving casino features:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Get count of all features from MongoDB
app.get('/api/casinos/features/count', checkPermissions('manageCasinos'), (req, res) => {
  const {
    tenancy
  } = req.session.user;

  CasinoFeatures.countDocuments({
      tenancies: tenancy
    })
    .then((results) => {
      res.json(results);
    })
    .catch((error) => {
      console.error('Error retrieving casino features:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});


// Get details of a specific casino feature
app.get('/api/casinos/features/:id', checkPermissions('manageCasinos'), (req, res) => {
  const {
    id
  } = req.params;
  const {
    tenancy
  } = req.session.user;

  CasinoFeatures.findOne({
      _id: id,
      tenancies: tenancy
    })
    .then((casinoFeatures) => {
      if (!casinoFeatures) {
        return res.status(404).json({
          error: 'Casino feature not found'
        });
      }

      res.json(casinoFeatures);
    })
    .catch((error) => {
      console.error('Error retrieving casino feature:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Insert casino feature into MongoDB
app.post('/api/casinos/features/add', checkPermissions('manageCasinos'), (req, res) => {
  const {
    name,
    description,
    image,
    priority,
    active
  } = req.body;
  const {
    userId
  } = req.session.user;

  const casinoFeatures = new CasinoFeatures({
    addedBy: userId,
    name: name,
    description: description,
    image: image,
    priority: priority,
    active: active,
    addedDate: Date.now(),
    tenancies: req.session.user.tenancy // Add tenancies field
  });

  casinoFeatures.save()
    .then(() => {
      res.redirect('/dashboard');
    })
    .catch((error) => {
      console.error('Error inserting casino feature:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Duplicate casino feature
app.post('/api/casinos/features/:id/duplicate', checkPermissions('manageCasinos'), (req, res) => {
  const {
    userId
  } = req.session.user;
  const {
    id
  } = req.params;

  CasinoFeatures.findOne({
      _id: id,
      tenancies: req.session.user.tenancy // Add condition to check tenancies
    })
    .then((casinoFeatures) => {
      if (!casinoFeatures) {
        throw new Error('Casino feature not found');
      } else {
        newPriority = generateRandomPriority();
        const newCasinoFeatures = new CasinoFeatures({
          addedBy: userId,
          name: casinoFeatures.name + ' (Copy)',
          description: casinoFeatures.description,
          image: casinoFeatures.image,
          priority: newPriority,
          active: casinoFeatures.active,
          addedDate: Date.now(),
          tenancies: req.session.user.tenancy // Set tenancies to req.session.user.tenancy
        });

        newCasinoFeatures.save()
          .then(() => {
            res.redirect('/dashboard');
          })
          .catch((error) => {
            console.error('Error duplicating casino feature:', error);
            res.status(500).json({
              error: 'Internal server error'
            });
          });
      }
    })
    .catch((error) => {
      console.error('Error duplicating casino feature:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Edit casino feature
app.put('/api/casinos/features/:id', checkPermissions('manageCasinos'), (req, res) => {
  const {
    userId
  } = req.session.user;
  const {
    id
  } = req.params;
  const {
    name,
    description,
    image,
    priority,
    active
  } = req.body;

  CasinoFeatures.findOneAndUpdate({
      _id: id,
      tenancies: req.session.user.tenancy // Add condition to check tenancies
    }, {
      name,
      description,
      image,
      priority,
      active
    }, {
      modifiedBy: userId,
      modifiedDate: Date.now()
    })
    .then((updatedCasinoFeatures) => {
      if (!updatedCasinoFeatures) {
        throw new Error('Casino feature not found');
      }
      res.json(updatedCasinoFeatures);
      console.log('Casino feature updated: ' + updatedCasinoFeatures.name);
    })
    .catch((error) => {
      console.error('Error updating casino feature:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Delete casino feature
app.delete('/api/casinos/features/:id', checkPermissions('manageCasinos'), (req, res) => {
  const {
    id
  } = req.params;
  const {
    tenancy
  } = req.session.user;

  CasinoFeatures.findOneAndDelete({
      _id: id,
      tenancies: tenancy
    })
    .then((deletedCasinoFeature) => {
      if (!deletedCasinoFeature) {
        throw new Error('Casino feature not found');
      }
      res.json(deletedCasinoFeature);
      console.log('Casino feature deleted: ' + deletedCasinoFeature.name);
    })
    .catch((error) => {
      console.error('Error deleting casino feature:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

//#endregion Casino Features

//#region Casino Individual Features

// Get all casino individual features from MongoDB
app.get('/api/casinos/:id/individualfeatures', checkPermissions('manageCasinos'), (req, res) => {
  const {
    id
  } = req.params;

  CasinoIndividualFeatures.find({
      casino: id
    })
    .then((results) => {
      res.json(results);
    })
    .catch((error) => {
      console.error('Error retrieving casino individual features:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Get count of all individual features
app.get('/api/casinos/individualfeatures/count', checkPermissions('manageCasinos'), (req, res) => {
  CasinoIndividualFeatures.countDocuments()
    .then((results) => {
      res.json(results);
    })
    .catch((error) => {
      console.error('Error retrieving casino individual features:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Get details of a specific casino individual feature
app.get('/api/casinos/:id/individualfeatures/:featureId', checkPermissions('manageCasinos'), (req, res) => {
  const {
    id,
    featureId
  } = req.params;

  CasinoIndividualFeatures.findOne({
      casino: id,
      _id: featureId
    })
    .then((casinoIndividualFeatures) => {
      if (!casinoIndividualFeatures) {
        return res.status(404).json({
          error: 'Casino individual feature not found'
        });
      } else {
        res.json(casinoIndividualFeatures);
      }
    })
    .catch((error) => {
      console.error('Error retrieving casino individual feature:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Insert casino individual feature into MongoDB
app.post('/api/casinos/:id/individualfeatures', checkPermissions('manageCasinos'), (req, res) => {
  const {
    name,
    description,
    image,
    priority,
    active
  } = req.body;
  const {
    id
  } = req.params;
  const {
    userId
  } = req.session.user;

  const casinoIndividualFeatures = new CasinoIndividualFeatures({
    addedBy: userId,
    casino: id,
    name: name,
    description: description,
    image: image,
    priority: priority,
    active: active,
    addedDate: Date.now(),
  });

  casinoIndividualFeatures.save()
    .then(() => {
      res.json({
        success: true
      });
    })
    .catch((error) => {
      console.error('Error inserting casino individual feature:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Duplicate casino individual feature
app.post('/api/casinos/:id/individualfeatures/:featureId/duplicate', checkPermissions('manageCasinos'), (req, res) => {
  const {
    userId
  } = req.session.user;
  const {
    id,
    featureId
  } = req.params;

  CasinoIndividualFeatures.findOne({
      _id: featureId
    })
    .then((casinoIndividualFeatures) => {
      if (!casinoIndividualFeatures) {
        throw new Error('Casino individual feature not found');
      } else {
        newPriority = generateRandomPriority();
        const newCasinoIndividualFeatures = new CasinoIndividualFeatures({
          addedBy: userId,
          casino: id,
          name: casinoIndividualFeatures.name + ' (Copy)',
          description: casinoIndividualFeatures.description,
          image: casinoIndividualFeatures.image,
          priority: newPriority,
          active: casinoIndividualFeatures.active,
          addedDate: Date.now(),
        });

        newCasinoIndividualFeatures.save()
          .then(() => {
            res.redirect('/dashboard');
          })
          .catch((error) => {
            console.error('Error duplicating casino individual feature:', error);
            res.status(500).json({
              error: 'Internal server error'
            });
          });
      }
    })
    .catch((error) => {
      console.error('Error duplicating casino individual feature:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Edit casino individual feature
app.put('/api/casinos/:id/individualfeatures/:featureId', checkPermissions('manageCasinos'), (req, res) => {
  const {
    userId
  } = req.session.user;
  const {
    id,
    featureId
  } = req.params;
  const {
    name,
    description,
    image,
    priority,
    active
  } = req.body;

  CasinoIndividualFeatures.findOneAndUpdate({
      _id: featureId
    }, {
      name,
      description,
      image,
      priority,
      active
    }, {
      modifiedBy: userId,
      modifiedDate: Date.now()
    })
    .then((updatedCasinoIndividualFeatures) => {
      if (!updatedCasinoIndividualFeatures) {
        throw new Error('Casino individual feature not found');
      }
      res.json(updatedCasinoIndividualFeatures);
      console.log('Casino individual feature updated: ' + updatedCasinoIndividualFeatures.name);
    })
    .catch((error) => {
      console.error('Error updating casino individual feature:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Delete casino individual feature
app.delete('/api/casinos/:id/individualfeatures/:featureId', checkPermissions('manageCasinos'), (req, res) => {
  const {
    id,
    featureId
  } = req.params;

  CasinoIndividualFeatures.findOneAndDelete({
      _id: featureId
    })
    .then((deletedCasinoIndividualFeature) => {
      if (!deletedCasinoIndividualFeature) {
        throw new Error('Casino individual feature not found');
      }
      res.json(deletedCasinoIndividualFeature);
      console.log('Casino individual feature deleted: ' + deletedCasinoIndividualFeature.name);
    })
    .catch((error) => {
      console.error('Error deleting casino individual feature:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

//#endregion Casino Individual Features

//#region Casino Individual Bonuses

// Get all casino individual bonuses from MongoDB
app.get('/api/casinos/:id/individualbonuses', checkPermissions('manageCasinos'), (req, res) => {
  const {
    id
  } = req.params;

  CasinoIndividualBonuses.find({
      casino: id
    })
    .then((results) => {
      res.json(results);
    })
    .catch((error) => {
      console.error('Error retrieving casino individual bonuses:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Get count of all individual bonuses
app.get('/api/casinos/individualbonuses/count', checkPermissions('manageCasinos'), (req, res) => {
  CasinoIndividualBonuses.countDocuments()
    .then((results) => {
      res.json(results);
    })
    .catch((error) => {
      console.error('Error retrieving casino individual bonuses count:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Get details of a specific casino individual bonus
app.get('/api/casinos/:id/individualbonuses/:bonusId', checkPermissions('manageCasinos'), (req, res) => {
  const {
    id,
    bonusId
  } = req.params;

  CasinoIndividualBonuses.findOne({
      casino: id,
      _id: bonusId
    })
    .then((casinoIndividualBonuses) => {
      if (!casinoIndividualBonuses) {
        return res.status(404).json({
          error: 'Casino individual bonus not found'
        });
      } else {
        res.json(casinoIndividualBonuses);
      }
    })
    .catch((error) => {
      console.error('Error retrieving casino individual bonus:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Insert casino individual bonus into MongoDB
app.post('/api/casinos/:id/individualbonuses', checkPermissions('manageCasinos'), (req, res) => {
  const {
    name,
    description,
    image,
    priority,
    active
  } = req.body;
  const {
    id
  } = req.params;
  const {
    userId
  } = req.session.user;

  const casinoIndividualBonuses = new CasinoIndividualBonuses({
    addedBy: userId,
    casino: id,
    name: name,
    description: description,
    image: image,
    priority: priority,
    active: active,
    addedDate: Date.now(),
  });

  casinoIndividualBonuses.save()
    .then(() => {
      res.json({
        success: true
      });
    })
    .catch((error) => {
      console.error('Error inserting casino individual bonus:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Delete casino individual bonus
app.delete('/api/casinos/:id/individualbonuses/:bonusId', checkPermissions('manageCasinos'), (req, res) => {
  const {
    id,
    bonusId
  } = req.params;

  CasinoIndividualBonuses.findOneAndDelete({
      _id: bonusId
    })
    .then((deletedCasinoIndividualBonus) => {
      if (!deletedCasinoIndividualBonus) {
        throw new Error('Casino individual bonus not found');
      }
      res.json(deletedCasinoIndividualBonus);
      console.log('Casino individual bonus deleted: ' + deletedCasinoIndividualBonus.name);
    })
    .catch((error) => {
      console.error('Error deleting casino individual bonus:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

//#endregion Casino Individual Bonuses

//#region Casino WagerTypes,

// Get count of all casino wager types from MongoDB
app.get('/api/casinos/wagertypes/count', checkPermissions('manageCasinos'), (req, res) => {
  const tenancy = req.session.user.tenancy; // Get the user's tenancy from the session

  CasinoWagerTypes.countDocuments({
      tenancies: tenancy
    }) // Filter by tenancy
    .then((results) => {
      res.json(results);
    })
    .catch((error) => {
      console.error('Error retrieving casino wager types count:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Get details of a specific casino wager type
app.get('/api/casinos/wagertypes/:id', checkPermissions('manageCasinos'), (req, res) => {
  const {
    id
  } = req.params;
  const tenancy = req.session.user.tenancy; // Get the user's tenancy from the session

  CasinoWagerTypes.findOne({
      _id: id,
      tenancies: tenancy
    }) // Filter by id and tenancy
    .then((casinoWagerTypes) => {
      if (!casinoWagerTypes) {
        // Handle not found case
      } else {
        res.json(casinoWagerTypes);
      }
    })
    .catch((error) => {
      console.error('Error retrieving casino wager type:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Get all casino wager types from MongoDB
app.get('/api/casinos/wagertypes', checkPermissions('manageCasinos'), (req, res) => {
  const tenancy = req.session.user.tenancy; // Get the user's tenancy from the session

  CasinoWagerTypes.find({
      tenancies: tenancy
    }) // Filter by tenancy
    .then((results) => {
      res.json(results);
    })
    .catch((error) => {
      console.error('Error retrieving casino wager types:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Duplicate casino wager type
app.post('/api/casinos/wagertypes/:id/duplicate', checkPermissions('manageCasinos'), (req, res) => {
  const {
    userId
  } = req.session.user;
  const {
    id
  } = req.params;
  const tenancy = req.session.user.tenancy; // Get the user's tenancy from the session

  CasinoWagerTypes.findOne({
      _id: id,
      tenancies: tenancy
    })
    .then((casinoWagerTypes) => {
      if (!casinoWagerTypes) {
        throw new Error('Casino wager type not found');
      } else {
        newPriority = generateRandomPriority();
        const newCasinoWagerTypes = new CasinoWagerTypes({
          addedBy: userId,
          name: casinoWagerTypes.name + ' (Copy)',
          description: casinoWagerTypes.description,
          image: casinoWagerTypes.image,
          priority: newPriority,
          active: casinoWagerTypes.active,
          addedDate: Date.now(),
          tenancies: [tenancy] // Set the tenancy for the duplicated casino wager type
        });

        newCasinoWagerTypes.save()
          .then(() => {
            res.redirect('/dashboard');
          })
          .catch((error) => {
            console.error('Error duplicating casino wager type:', error);
            res.status(500).json({
              error: 'Internal server error'
            });
          });
      }
    })
    .catch((error) => {
      console.error('Error duplicating casino wager type:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Edit casino wager type
app.put('/api/casinos/wagertypes/:id', checkPermissions('manageCasinos'), (req, res) => {
  const {
    userId
  } = req.session.user;
  const {
    id
  } = req.params;
  const {
    name,
    description,
    image,
    priority,
    active
  } = req.body;
  const tenancy = req.session.user.tenancy; // Get the user's tenancy from the session

  CasinoWagerTypes.findOneAndUpdate({
      _id: id,
      tenancies: tenancy
    }, {
      name,
      description,
      image,
      priority,
      active
    }, {
      modifiedBy: userId,
      modifiedDate: Date.now()
    })
    .then((updatedCasinoWagerTypes) => {
      if (!updatedCasinoWagerTypes) {
        throw new Error('Casino wager type not found');
      }
      res.json(updatedCasinoWagerTypes);
      console.log('Casino wager type updated: ' + updatedCasinoWagerTypes.name);
    })
    .catch((error) => {
      console.error('Error updating casino wager type:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Delete casino wager type
app.delete('/api/casinos/wagertypes/:id', checkPermissions('manageCasinos'), (req, res) => {
  const {
    id
  } = req.params;
  const tenancy = req.session.user.tenancy; // Get the user's tenancy from the session

  CasinoWagerTypes.findOneAndDelete({
      _id: id,
      tenancies: tenancy
    })
    .then((deletedCasinoWagerType) => {
      if (!deletedCasinoWagerType) {
        throw new Error('Casino wager type not found');
      }
      res.json(deletedCasinoWagerType);
      console.log('Casino wager type deleted: ' + deletedCasinoWagerType.name);
    })
    .catch((error) => {
      console.error('Error deleting casino wager type:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

//#endregion Casino Wager Types

//#region Casino Providers

// Get count of all casino providers from MongoDB
app.get('/api/casinos/providers/count', checkPermissions('manageCasinos'), (req, res) => {
  CasinoProvider.countDocuments({
      tenancies: {
        $in: [req.session.user.tenancy]
      }
    })
    .then((results) => {
      res.json(results);
    })
    .catch((error) => {
      console.error('Error retrieving casino providers count:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Get details of a specific casino provider
app.get('/api/casinos/providers/:id', checkPermissions('manageCasinos'), (req, res) => {
  const {
    id
  } = req.params;

  CasinoProvider.findOne({
      _id: id,
      tenancies: req.session.user.tenancy
    })
    .then((casinoProvider) => {
      if (!casinoProvider) {
        // Handle not found case
      }
      res.json(casinoProvider);
    })
    .catch((error) => {
      console.error('Error retrieving casino provider:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Get all casino providers from MongoDB
app.get('/api/casinos/providers', checkPermissions('manageCasinos'), (req, res) => {
  CasinoProvider.find({
      tenancies: req.session.user.tenancy
    })
    .then((results) => {
      res.json(results);
    })
    .catch((error) => {
      console.error('Error retrieving casino providers:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Insert casino provider into MongoDB
app.post('/api/casinos/providers/add', checkPermissions('manageCasinos'), (req, res) => {
  const {
    name,
    description,
    image,
    priority,
    active
  } = req.body;
  const {
    userId,
    tenancy
  } = req.session.user;

  const casinoProvider = new CasinoProvider({
    addedBy: userId,
    name: name,
    description: description,
    image: image,
    priority: priority,
    active: active,
    addedDate: Date.now(),
    tenancies: [tenancy],
  });

  casinoProvider.save()
    .then(() => {
      res.redirect('/dashboard');
    })
    .catch((error) => {
      console.error('Error inserting casino provider:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Duplicate casino provider
app.post('/api/casinos/providers/:id/duplicate', checkPermissions('manageCasinos'), (req, res) => {
  const {
    userId,
    tenancy
  } = req.session.user;
  const {
    id,
  } = req.params;

  CasinoProvider.findOne({
      _id: id,
      tenancies: tenancy
    })
    .then((casinoProviders) => {
      if (!casinoProviders) {
        throw new Error('Casino provider not found');
      } else {
        newPriority = generateRandomPriority();
        const newCasinoProviders = new CasinoProvider({
          addedBy: userId,
          name: casinoProviders.name + ' (Copy)',
          description: casinoProviders.description,
          image: casinoProviders.image,
          priority: newPriority,
          active: casinoProviders.active,
          addedDate: Date.now(),
        });

        newCasinoProviders.save()
          .then(() => {
            res.redirect('/dashboard');
          })
          .catch((error) => {
            console.error('Error duplicating casino provider:', error);
            res.status(500).json({
              error: 'Internal server error'
            });
          });
      }
    })
    .catch((error) => {
      console.error('Error duplicating casino provider:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Edit casino provider
app.put('/api/casinos/providers/:id', checkPermissions('manageCasinos'), (req, res) => {
  const {
    userId,
    tenancy
  } = req.session.user;
  const {
    id
  } = req.params;
  const {
    name,
    description,
    image,
    priority,
    active
  } = req.body;

  CasinoProvider.findOneAndUpdate({
      _id: id,
      tenancies: tenancy
    }, {
      name,
      description,
      image,
      priority,
      active
    }, {
      modifiedBy: userId,
      modifiedDate: Date.now()
    })
    .then((updatedCasinoProviders) => {
      if (!updatedCasinoProviders) {
        throw new Error('Casino provider not found');
      }
      res.json(updatedCasinoProviders);
      console.log('Casino provider updated: ' + updatedCasinoProviders.name);
    })
    .catch((error) => {
      console.error('Error updating casino provider:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Delete casino provider
app.delete('/api/casinos/providers/:id', checkPermissions('manageCasinos'), (req, res) => {
  const {
    id
  } = req.params;

  const {
    tenancy
  } = req.session.user;

  CasinoProvider.findOneAndDelete({
      _id: id,
      tenancies: tenancy
    })
    .then((deletedCasinoProvider) => {
      if (!deletedCasinoProvider) {
        throw new Error('Casino provider not found');
      }
      res.json(deletedCasinoProvider);
      console.log('Casino provider deleted: ' + deletedCasinoProvider.name);
    })
    .catch((error) => {
      console.error('Error deleting casino provider:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

//#endregion Casino Providers

//#region Casino Licenses

// Get all casino licenses from MongoDB
app.get('/api/casinos/licenses', checkPermissions('manageCasinos'), (req, res) => {
  CasinoLicenses.find({
      tenancies: req.session.user.tenancy
    })
    .then((results) => {
      res.json(results);
    })
    .catch((error) => {
      console.error('Error retrieving casino licenses:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Get amount of all casino licenses from MongoDB
app.get('/api/casinos/licenses/count', checkPermissions('manageCasinos'), (req, res) => {
  CasinoLicenses.countDocuments({
      tenancies: req.session.user.tenancy
    })
    .then((results) => {
      res.json(results);
    })
    .catch((error) => {
      console.error('Error retrieving casino licenses count:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Get details of a specific casino license
app.get('/api/casinos/licenses/:id', checkPermissions('manageCasinos'), (req, res) => {
  const {
    id
  } = req.params;
  const {
    tenancy
  } = req.session.user;

  CasinoLicenses.findOne({
      _id: id,
      tenancies: tenancy
    })
    .then((casinoLicense) => {
      if (!casinoLicense) {
        return res.status(404).json({
          error: 'Casino license not found'
        });
      }

      res.json(casinoLicense);
    })
    .catch((error) => {
      console.error('Error retrieving casino license:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Insert casino license into MongoDB
app.post('/api/casinos/licenses/add', checkPermissions('manageCasinos'), (req, res) => {
  const {
    name,
    description,
    image,
    active
  } = req.body;
  const {
    userId
  } = req.session.user;

  const casinoLicenses = new CasinoLicenses({
    addedBy: userId,
    name: name,
    description: description,
    image: image,
    active: active,
    addedDate: Date.now(),
    tenancies: [req.session.user.tenancy] // Add the user's tenancy to the tenancies array
  });

  casinoLicenses.save()
    .then(() => {
      res.redirect('/dashboard');
    })
    .catch((error) => {
      console.error('Error inserting casino license:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Swap casino license priority
app.put('/api/casinos/licenses/swap', checkPermissions('manageCasinos'), (req, res) => {
  const {
    userId
  } = req.session.user;
  const {
    id1,
    id2
  } = req.body;

  CasinoLicenses.findOne({
      _id: id1,
      tenancies: req.session.user.tenancy // Check if tenancies includes req.session.user.tenancy
    })
    .then((casinoLicense1) => {
      if (!casinoLicense1) {
        throw new Error('Casino license 1 not found');
      } else {
        CasinoLicenses.findOne({
            _id: id2,
            tenancies: req.session.user.tenancy // Check if tenancies includes req.session.user.tenancy
          })
          .then((casinoLicense2) => {
            if (!casinoLicense2) {
              throw new Error('Casino license 2 not found');
            } else {
              const tempPriority = casinoLicense1.priority;
              casinoLicense1.priority = casinoLicense2.priority;
              casinoLicense2.priority = tempPriority;

              casinoLicense1.save()
                .then(() => {
                  casinoLicense2.save()
                    .then(() => {
                      res.status(200).json({
                        message: 'Casino license priority swapped successfully'
                      });
                    })
                    .catch((error) => {
                      console.error('Error swapping casino license priority:', error);
                      res.status(500).json({
                        error: 'Internal server error'
                      });
                    });
                })
                .catch((error) => {
                  console.error('Error swapping casino license priority:', error);
                  res.status(500).json({
                    error: 'Internal server error'
                  });
                });
            }
          })
          .catch((error) => {
            console.error('Error swapping casino license priority:', error);
            res.status(500).json({
              error: 'Internal server error'
            });
          });
      }
    })
    .catch((error) => {
      console.error('Error swapping casino license priority:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Delete casino license
app.delete('/api/casinos/licenses/:id', checkPermissions('manageCasinos'), (req, res) => {
  const {
    id
  } = req.params;

  CasinoLicenses.findOneAndDelete({
      _id: id,
      tenancies: req.session.user.tenancy // Check if tenancies includes req.session.user.tenancy
    })
    .then((deletedCasinoLicense) => {
      if (!deletedCasinoLicense) {
        throw new Error('Casino license not found');
      }
      res.json(deletedCasinoLicense);
      console.log('Casino license deleted: ' + deletedCasinoLicense.name);
    })
    .catch((error) => {
      console.error('Error deleting casino license:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});



// Duplicate casino license
app.post('/api/casinos/licenses/:id/duplicate', checkPermissions('manageCasinos'), (req, res) => {
  const {
    userId
  } = req.session.user;
  const {
    id
  } = req.params;

  CasinoLicenses.findOne({
      _id: id,
      tenancies: req.session.user.tenancy // Check if tenancies includes req.session.user.tenancy
    })
    .then((casinoLicenses) => {
      if (!casinoLicenses) {
        throw new Error('Casino license not found');
      } else {
        newPriority = generateRandomPriority();
        const newCasinoLicenses = new CasinoLicenses({
          addedBy: userId,
          name: casinoLicenses.name + ' (Copy)',
          description: casinoLicenses.description,
          image: casinoLicenses.image,
          priority: newPriority,
          active: casinoLicenses.active,
          addedDate: Date.now(),
          tenancies: [req.session.user.tenancy] // Add the user's tenancy to the tenancies array
        });

        newCasinoLicenses.save()
          .then(() => {
            res.redirect('/dashboard');
          })
          .catch((error) => {
            console.error('Error duplicating casino license:', error);
            res.status(500).json({
              error: 'Internal server error'
            });
          });
      }
    })
    .catch((error) => {
      console.error('Error duplicating casino license:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});



// Edit casino license
app.put('/api/casinos/licenses/:id', checkPermissions('manageCasinos'), (req, res) => {
  const {
    userId
  } = req.session.user;
  const {
    id
  } = req.params;
  const {
    name,
    description,
    image,
    priority,
    active
  } = req.body;

  CasinoLicenses.findOneAndUpdate({
      _id: id,
      tenancies: req.session.user.tenancy // Check if tenancies includes req.session.user.tenancy
    }, {
      name,
      description,
      image,
      priority,
      active
    }, {
      modifiedBy: userId,
      modifiedDate: Date.now()
    })
    .then((updatedCasinoLicenses) => {
      if (!updatedCasinoLicenses) {
        throw new Error('Casino license not found');
      }
      res.json(updatedCasinoLicenses);
      console.log('Casino license updated: ' + updatedCasinoLicenses.name);
    })
    .catch((error) => {
      console.error('Error updating casino license:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

//#endregion Casino Licenses

//#region Casino Payment Methods

// Get all casino payment methods from MongoDB
app.get('/api/casinos/paymentmethods', checkPermissions('manageCasinos'), (req, res) => {
  const userTenancy = req.session.user.tenancy;
  CasinoPaymentMethods.find({
      tenancies: userTenancy
    })
    .then((results) => {
      res.json(results);
    })
    .catch((error) => {
      console.error('Error retrieving casino payment methods:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Get count of all casino payment methods from MongoDB
app.get('/api/casinos/paymentmethods/count', checkPermissions('manageCasinos'), (req, res) => {
  const userTenancy = req.session.user.tenancy;
  CasinoPaymentMethods.countDocuments({
      tenancies: userTenancy
    })
    .then((results) => {
      res.json(results);
    })
    .catch((error) => {
      console.error('Error retrieving casino payment methods count:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Get details of a specific casino payment method
app.get('/api/casinos/paymentmethods/:id', checkPermissions('manageCasinos'), (req, res) => {
  const {
    id
  } = req.params;
  const userTenancy = req.session.user.tenancy;

  CasinoPaymentMethods.findOne({
      _id: id,
      tenancies: userTenancy
    })
    .then((casinoPaymentMethods) => {
      if (!casinoPaymentMethods) {
        return res.status(404).json({
          error: 'Casino payment method not found'
        });
      }

      res.json(casinoPaymentMethods);
    })
    .catch((error) => {
      console.error('Error retrieving casino payment method:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Insert casino payment method into MongoDB
app.post('/api/casinos/paymentmethods/add', checkPermissions('manageCasinos'), (req, res) => {
  const {
    name,
    description,
    image,
    priority,
    active
  } = req.body;
  const {
    userId
  } = req.session.user;

  const casinoPaymentMethods = new CasinoPaymentMethods({
    addedBy: userId,
    name: name,
    description: description,
    image: image,
    priority: priority,
    active: active,
    addedDate: Date.now(),
    tenancies: [req.session.user.tenancy] // Add the user's tenancy to the tenancies array
  });

  casinoPaymentMethods.save()
    .then(() => {
      res.redirect('/dashboard');
    })
    .catch((error) => {
      console.error('Error inserting casino payment method:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Edit casino payment method
app.put('/api/casinos/paymentmethods/:id', checkPermissions('manageCasinos'), (req, res) => {
  const {
    userId
  } = req.session.user;
  const {
    id
  } = req.params;
  const {
    name,
    description,
    image,
    priority,
    active
  } = req.body;

  CasinoPaymentMethods.findOneAndUpdate({
      _id: id,
      tenancies: req.session.user.tenancy // Add the condition to check tenancies
    }, {
      name,
      description,
      image,
      priority,
      active
    }, {
      new: true
    })
    .then((casinoPaymentMethods) => {
      if (!casinoPaymentMethods) {
        throw new Error('Casino payment method not found');
      } else {
        res.redirect('/dashboard');
      }
    })
    .catch((error) => {
      console.error('Error updating casino payment method:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Duplicate casino payment method
app.post('/api/casinos/paymentmethods/:id/duplicate', checkPermissions('manageCasinos'), (req, res) => {
  const {
    userId
  } = req.session.user;
  const {
    id
  } = req.params;

  CasinoPaymentMethods.findOne({
      _id: id,
      tenancies: req.session.user.tenancy // Add the condition to check tenancies
    })
    .then((casinoPaymentMethods) => {
      if (!casinoPaymentMethods) {
        throw new Error('Casino payment method not found');
      } else {
        newPriority = generateRandomPriority();
        const newCasinoPaymentMethods = new CasinoPaymentMethods({
          addedBy: userId,
          name: casinoPaymentMethods.name + ' (Copy)',
          description: casinoPaymentMethods.description,
          image: casinoPaymentMethods.image,
          priority: newPriority,
          active: casinoPaymentMethods.active,
          addedDate: Date.now(),
          tenancies: [req.session.user.tenancy] // Add the user's tenancy to the tenancies array
        });

        newCasinoPaymentMethods.save()
          .then(() => {
            res.redirect('/dashboard');
          })
          .catch((error) => {
            console.error('Error duplicating casino payment method:', error);
            res.status(500).json({
              error: 'Internal server error'
            });
          });
      }
    })
    .catch((error) => {
      console.error('Error duplicating casino payment method:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Edit casino payment method
app.put('/api/casinos/paymentmethods/:id', checkPermissions('manageCasinos'), (req, res) => {
  const {
    userId
  } = req.session.user;
  const {
    id
  } = req.params;
  const {
    name,
    description,
    image,
    priority,
    active
  } = req.body;

  CasinoPaymentMethods.findOneAndUpdate({
      _id: id,
      tenancies: req.session.user.tenancy // Add the condition to check tenancies
    }, {
      name,
      description,
      image,
      priority,
      active
    }, {
      modifiedBy: userId,
      modifiedDate: Date.now()
    })
    .then((updatedCasinoPaymentMethods) => {
      if (!updatedCasinoPaymentMethods) {
        throw new Error('Casino payment method not found');
      }
      res.json(updatedCasinoPaymentMethods);
      console.log('Casino payment method updated: ' + updatedCasinoPaymentMethods.name);
    })
    .catch((error) => {
      console.error('Error updating casino payment method:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Delete casino payment method
app.delete('/api/casinos/paymentmethods/:id', checkPermissions('manageCasinos'), (req, res) => {
  const {
    id
  } = req.params;

  CasinoPaymentMethods.findOneAndDelete({
      _id: id,
      tenancies: req.session.user.tenancy // Add the condition to check tenancies
    })
    .then((deletedCasinoPaymentMethods) => {
      if (!deletedCasinoPaymentMethods) {
        throw new Error('Casino payment method not found');
      }
      res.json(deletedCasinoPaymentMethods);
      console.log('Casino payment method deleted: ' + deletedCasinoPaymentMethods.name);
    })
    .catch((error) => {
      console.error('Error deleting casino payment method:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

//#endregion Casino Payment Methods

//#region Casinos

// Get all casinos from MongoDB
app.get('/api/casinos', checkPermissions('manageCasinos'), async (req, res) => {
  try {
    const results = await Casino.find({
      tenancies: req.session.user.tenancy
    }); // Retrieve casinos with matching tenancy
    res.json(results);
  } catch (error) {
    console.error('Error retrieving casinos:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Get the details of a specific casino
app.get('/api/casinos/:id', checkPermissions('manageCasinos'), async (req, res) => {
  const {
    id
  } = req.params;

  try {
    const casino = await Casino.findOne({
      _id: id,
      tenancies: req.session.user.tenancy
    }); // Retrieve casino with matching tenancy
    if (!casino) {
      return res.status(404).json({
        error: 'Casino not found'
      });
    }
    res.json(casino);
  } catch (error) {
    console.error('Error retrieving casino:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});


// Create a new casino
app.post('/api/casinos', checkPermissions('manageCasinos'), (req, res) => {
  const {
    name
  } = req.body; // Get the name and location from the request body
  const {
    userId,
    tenancy
  } = req.session.user; // Get the user ID from the session data

  // Create a new casino object
  const newCasino = new Casino({
    addedBy: userId,
    name: name,
    addedDate: Date.now(),
    addedBy: userId,
    tenancies: tenancy
  });

  // Save the new casino to the database
  newCasino.save()
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      console.error('Error creating casino:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Duplicate a casino
app.post('/api/casinos/:id/duplicate', checkPermissions('manageCasinos'), async (req, res) => {
  const {
    userId
  } = req.session.user;
  const {
    id
  } = req.params;

  try {
    const tenancies = await getTenancyByUserId(userId); // Get the tenancyId of the current user
    const casino = await Casino.findOne({
      _id: id,
      tenancies
    }); // Check if the casino belongs to the user's tenancy

    if (!casino) {
      throw new Error('Casino not found');
    }

    const newPriority = generateRandomPriority();
    const newCasino = new Casino({
      addedBy: userId,
      name: casino.name + ' (Copy)',
      categories: casino.categories,
      description: casino.description,
      priority: newPriority,
      active: casino.active,
      isNew: casino.isNew,
      label: casino.label,
      labelLarge: casino.labelLarge,
      individualBonuses: casino.individualBonuses,
      displayBonus: casino.displayBonus,
      maxBet: casino.maxBet,
      maxCashout: casino.maxCashout,
      wager: casino.wager,
      wagerType: casino.wagerType,
      noDeposit: casino.noDeposit,
      prohibitedGamesProtection: casino.prohibitedGamesProtection,
      vpn: casino.vpn,
      features: casino.features,
      providers: casino.providers,
      paymentMethods: casino.paymentMethods,
      review: casino.review,
      reviewTitle: casino.reviewTitle,
      image: casino.image,
      affiliateUrl: casino.affiliateUrl,
      affiliateShortlink: casino.affiliateShortlink,
      addedDate: Date.now(),
      tenancies: casino.tenancies,
    });

    await newCasino.save();
    setCasinoImageUrl(newCasino._id); // Call setCasinoImageUrl function

    res.status(200).json({
      message: 'Casino duplicated'
    });
  } catch (error) {
    console.error('Error duplicating casino:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Edit a casino
app.put('/api/casinos/:id', checkPermissions('manageCasinos'), (req, res) => {
  const {
    userId
  } = req.session.user;
  const {
    id
  } = req.params;
  const {
    name,
    categories,
    description,
    priority,
    active,
    isNew,
    label,
    labelLarge,
    individualBonuses,
    displayBonus,
    maxBet,
    maxCashout,
    wager,
    wagerType,
    noDeposit,
    prohibitedGamesProtection,
    vpn,
    features,
    individualFeatures,
    tags,
    providers,
    paymentMethods,
    review,
    reviewTitle,
    image,
    affiliateUrl,
    affiliateShortlink,
    licenses
  } = req.body; // Get the updated values from the request body
  console.log("Updating Casino:", req.body);

  // Add the condition to check if the user has access to the casino
  Casino.findOneAndUpdate({
      _id: id,
      tenancies: req.session.user.tenancy // Check if the user's tenancy is included
    }, {
      name,
      categories,
      description,
      priority,
      active,
      isNew,
      label,
      labelLarge,
      individualBonuses,
      displayBonus,
      maxBet,
      maxCashout,
      wager,
      wagerType,
      noDeposit,
      prohibitedGamesProtection,
      vpn,
      tags,
      features,
      individualFeatures,
      providers,
      paymentMethods,
      review,
      reviewTitle,
      image,
      affiliateUrl,
      affiliateShortlink,
      licenses
    }, {
      modifiedBy: userId,
      modifiedDate: Date.now()
    })
    .then((updatedCasino) => {
      if (!updatedCasino) {
        throw new Error('Casino not found');
      }
      res.json(updatedCasino);
      console.log('Casino updated: ' + updatedCasino.name);

      // Call setCasinoImageUrl(ID) function here
      setCasinoImageUrl(updatedCasino._id);
      createShortLinks(updatedCasino._id);
    })
    .catch((error) => {
      console.error('Error updating casino:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Toggle the active status of a casino by its ID
app.put('/api/casinos/:id/toggleActive', checkPermissions('manageCasinos'), (req, res) => {
  const {
    id
  } = req.params; // Get the ID of the casino from the request params

  // Validate the ID
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      error: 'Invalid ID format'
    });
  }

  // Find the casino by its ID and tenancy
  Casino.findOne({
      _id: id,
      tenancies: req.session.user.tenancy
    })
    .then((casino) => {
      if (!casino) {
        throw new Error('Casino not found');
      }

      // Toggle the active status
      casino.active = !casino.active;
      return casino.save();
    })
    .then((updatedCasino) => {
      res.json({
        success: true,
        casino: updatedCasino
      });
    })
    .catch((error) => {
      console.error('Error toggling active status:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Swap the priority of two casinos by their ID
app.put('/api/casinos/priority/swap', checkPermissions('manageCasinos'), (req, res) => {
  const {
    id1,
    id2
  } = req.body; // Get the IDs of the two casinos from the request body

  console.log(id1 + ' ' + id2);

  // Validate the IDs
  if (!id1.match(/^[0-9a-fA-F]{24}$/) || !id2.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      error: 'Invalid ID format'
    });
  }

  // Check if id1 and id2 are the same
  if (id1 === id2) {
    return res.status(400).json({
      error: 'Cannot swap priority of the same casino'
    });
  }

  // Find the two casinos by their IDs and tenancy
  Casino.find({
      _id: {
        $in: [id1, id2]
      },
      tenancies: req.session.user.tenancy
    }) // Add tenancy check
    .then((casinos) => {
      if (casinos.length !== 2) {
        throw new Error('Two casinos not found');
      }
      console.log('Found Casinos:');
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
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Get individualbonus of a specific casino by ID
app.get('/api/casinos/:id/individualbonuses', checkPermissions('manageCasinos'), (req, res) => {
  const {
    id
  } = req.params; // Get the ID from the request params
  Casino.findOne({
      _id: id,
      tenancies: req.session.user.tenancy
    }) // Add tenancy check
    .then((result) => {
      res.json(result.individualBonuses);
    })
    .catch((error) => {
      console.error('Error retrieving casino individualbonuses:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Get features of a specific casino by ID
app.get('/api/casinos/:id/features', checkPermissions('manageCasinos'), (req, res) => {
  const {
    id
  } = req.params; // Get the ID from the request params
  Casino.findOne({
      _id: id,
      tenancies: req.session.user.tenancy
    }) // Add tenancy check
    .then((result) => {
      res.json(result.features);
    })
    .catch((error) => {
      console.error('Error retrieving casino features:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Get image of a specific casino by ID
app.get('/api/casinos/:id/image', checkPermissions('manageCasinos'), (req, res) => {
  const {
    id
  } = req.params; // Get the ID from the request params
  Casino.findOne({
      _id: id,
      tenancies: req.session.user.tenancy
    }) // Add tenancy check
    .then((result) => {
      console.log(result);
      res.json(result.image);
    })
    .catch((error) => {
      console.error('Error retrieving casino image:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Get categories of a specific casino by ID
app.get('/api/casinos/:id/categories', checkPermissions('manageCasinos'), (req, res) => {
  const {
    id
  } = req.params; // Get the ID from the request params
  Casino.findOne({
      _id: id,
      tenancies: req.session.user.tenancy
    }) // Add tenancy check
    .then((result) => {
      res.json(result.categories);
    })
    .catch((error) => {
      console.error('Error retrieving casino categories:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Get wagerTypes of a specific casino by ID
app.get('/api/casinos/:id/wagertypes', checkPermissions('manageCasinos'), (req, res) => {
  const {
    id
  } = req.params; // Get the ID from the request params
  Casino.findOne({
      _id: id,
      tenancies: req.session.user.tenancy
    }) // Add tenancy check
    .then((result) => {
      res.json(result.wagerTypes);
    })
    .catch((error) => {
      console.error('Error retrieving casino wagerTypes:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Get providers of a specific casino by ID
app.get('/api/casinos/:id/providers', checkPermissions('manageCasinos'), (req, res) => {
  const {
    id
  } = req.params; // Get the ID from the request params
  Casino.findOne({
      _id: id,
      tenancies: req.session.user.tenancy
    }) // Add tenancy check
    .then((result) => {
      res.json(result.providers);
    })
    .catch((error) => {
      console.error('Error retrieving casino providers:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Get licenses of a specific casino by ID
app.get('/api/casinos/:id/licenses', checkPermissions('manageCasinos'), (req, res) => {
  const {
    id
  } = req.params; // Get the ID from the request params
  Casino.findOne({
      _id: id,
      tenancies: req.session.user.tenancy
    }) // Add tenancy check
    .then((result) => {
      res.json(result.licenses);
    })
    .catch((error) => {
      console.error('Error retrieving casino licenses:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

// Get paymentMethods of a specific casino by ID
app.get('/api/casinos/:id/paymentmethods', checkPermissions('manageCasinos'), (req, res) => {
  const {
    id
  } = req.params; // Get the ID from the request params
  Casino.findOne({
      _id: id,
      tenancies: req.session.user.tenancy
    }) // Add tenancy check
    .then((result) => {
      res.json(result.paymentMethods);
    })
    .catch((error) => {
      console.error('Error retrieving casino paymentMethods:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    });
});

//#endregion Casinos

// Middleware to check if the user is logged in and has the required permission
function checkPermissions(requiredPermission) {
  return function (req, res, next) {
    if (!req.session.user) {
      res.status(401).json({
        error: 'Unauthorized'
      });
      return;
    }
    const userId = req.session.user.userId;

    User.findById(userId)
      .then((user) => {
        if (!user) {
          res.status(403).json({
            error: 'Forbidden'
          });
          return;
        }

        const groupId = user.groupId;

        UserGroup.findById(groupId)
          .then((userGroup) => {
            if (!userGroup) {
              res.status(403).json({
                error: 'Forbidden'
              });
              return;
            }

            const permissions = userGroup.permissions;

            if (permissions.includes(requiredPermission)) {
              next();
            } else {
              res.status(403).json({
                error: 'Forbidden'
              });
            }
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
    res.render('admin/dashboard', {
      user: user
    });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/account', checkPermissions('manageAccount'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId + ') accessed ' + req.url);
    const user = req.session.user;
    res.render('admin/account', {
      user: user
    });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/super/registrationkeys', checkPermissions('manageRegistrationKeys'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId + ') accessed ' + req.url);
    const user = req.session.user;
    res.render('admin/registrationkeys', {
      user: user
    });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/super/sessions', checkPermissions('manageSessions'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId + ') accessed ' + req.url);
    const user = req.session.user;
    res.render('admin/sessions', {
      user: user
    });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/super/users', checkPermissions('manageUsers'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId + ') accessed ' + req.url);
    const user = req.session.user;
    res.render('admin/users', {
      user: user
    });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/super/users/:userId/edit', checkPermissions('manageUsers'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId +
      ') accessed user edit');
    const user = req.session.user;
    const userId = req.params.userId;

    res.render('admin/users_edit', {
      user: user,
      userId: userId
    });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/super/tenancies', checkPermissions('manageTenancies'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId +
      ') accessed tenancies');
    const user = req.session.user;
    res.render('admin/tenancies', {
      user: user
    });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/casinos', checkPermissions('manageCasinos'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId + ') accessed ' + req.url);
    const user = req.session.user;
    res.render('admin/casinos', {
      user: user
    });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/casinos/categories', checkPermissions('manageCasinos'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId + ') accessed ' + req.url);
    const user = req.session.user;
    res.render('admin/casinos_categories', {
      user: user
    });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/casinos/features', checkPermissions('manageCasinos'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId + ') accessed ' + req.url);
    const user = req.session.user;

    res.render('admin/casinos_features', {
      user: user
    });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/casinos/providers', checkPermissions('manageCasinos'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId + ') accessed providers');
    const user = req.session.user;

    res.render('admin/casinos_providers', {
      user: user
    });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/casinos/licenses', checkPermissions('manageCasinos'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId +
      ') accessed licenses');
    const user = req.session.user;

    res.render('admin/casinos_licenses', {
      user: user
    });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/casinos/paymentmethods', checkPermissions('manageCasinos'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId + ') accessed paymentmethods');
    const user = req.session.user;

    res.render('admin/casinos_paymentmethods', {
      user: user
    });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/casinos/wagertypes', checkPermissions('manageCasinos'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId + ') wagertypes');
    const user = req.session.user;

    res.render('admin/casinos_wagertypes', {
      user: user
    });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/casinos/tags', checkPermissions('manageCasinos'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId +
      ') accessed tags');
    const user = req.session.user;

    res.render('admin/casinos_tags', {
      user: user
    });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/casinos/:id/edit', checkPermissions('manageCasinos'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId +
      ') accessed casino edit');
    const user = req.session.user;
    const id = req.params.id;

    res.render('admin/casinos_edit', {
      user: user,
      casinoId: id
    });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/images/categories', checkPermissions('manageImagesCategories'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId + ') accessed ' + req.url);
    const user = req.session.user;
    res.render('admin/images_categories', {
      user: user
    });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/images', checkPermissions('manageImages'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId + ') accessed ' + req.url);
    const user = req.session.user;
    res.render('admin/images', {
      user: user
    });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/shortlinks', checkPermissions('manageShortLinks'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId + ') shortlinks');
    const user = req.session.user;

    res.render('admin/shortlinks', {
      user: user
    });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/shortlinks/hits', checkPermissions('manageShortLinks'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId + ') shortlinks');
    const user = req.session.user;

    res.render('admin/shortlinks_hits', {
      user: user
    });
  } catch (err) {
    next(err);
  }
});

app.get('/dashboard/shortlinks/:id/statistics', checkPermissions('manageShortLinks'), (req, res, next) => {
  try {
    console.log('User ' + req.session.user.username + '(' + req.session.user.userId + ') shortlinks');
    const user = req.session.user;
    const id = req.params.id;

    res.render('admin/shortlinks_statistics', {
      user: user,
      shortLink: id
    });
  } catch (err) {
    next(err);
  }
});


//#endregion Routes

// Function to delete unused registration keys older than 1 hour
function deleteUnusedRegistrationKeys() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago

  RegistrationKey.deleteMany({
      used: false,
      created: {
        $lt: oneHourAgo
      }
    })
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
      casinos = await Casino.findOne({
        _id: casinoId
      });
      casinos = [casinos]; // Convert single object to array
    } else {
      casinos = await Casino.find();
    }
    for (const casino of casinos) {
      if (casino.image) {
        const image = await Images.findOne({
          _id: casino.image
        });
        if (image) {
          casino.imageUrl = `/img/images/${image.filename}`;
          casino.tenancies = casino.tenancies;
          await casino.save();
          console.log('Image URL for Casino ' + casino.name + '(' + casino._id + ') (' + casino.imageUrl + ') saved');
        }
      }
    }
  } catch (error) {
    console.error('Error retrieving casinos:', error);
  }
}

async function setImageUrl(id = null) {
  try {
    let images;
    if (id) {
      images = await Images.findOne({
        _id: id
      });
      images = [images]; // Convert single object to array
    } else {
      images = await Images.find();
    }
    for (const image of images) {
      if (image.filename) {
        const foundImage = await Images.findOne({
          _id: image._id
        });
        if (foundImage) {
          foundImage.imageUrl = `/img/images/${foundImage.filename}`;
          foundImage.tenancies = [foundImage.tenancies];
          await foundImage.save();
          console.log('Image URL for Image ' + foundImage.name + '(' + foundImage._id + ') (' + foundImage.imageUrl + ') saved');
        }
      }
    }
  } catch (error) {
    console.error('Error retrieving images:', error);
  }
}

async function createShortLinks(casinoId = null) {
  try {
    let casinos;
    if (casinoId) {
      casinos = await Casino.findOne({
        _id: casinoId
      });
      casinos = [casinos]; // Convert single object to array
    } else {
      casinos = await Casino.find();
    }
    for (const casino of casinos) {
      if (casino.affiliateUrl && casino.affiliateShortlink) {
        const existingShortLink = await ShortLinks.findOne({
          attachedTo: casino._id,
          tenancies: casino.tenancies,
        });
        if (existingShortLink) {
          existingShortLink.url = casino.affiliateUrl;
          existingShortLink.shortUrl = casino.affiliateShortlink;
          existingShortLink.modifiedBy = casino.modifiedBy;
          existingShortLink.modifiedDate = casino.modifiedDate;
          existingShortLink.tenancies = casino.tenancies;
          existingShortLink.attachedTo = casino._id;
          await existingShortLink.save();
          console.log('ShortLink updated for casino ' + casino.name + ' (' + existingShortLink._id + ')');
        } else {
          const shortLink = await ShortLinks.create({
            url: casino.affiliateUrl,
            shortUrl: casino.affiliateShortlink,
            addedBy: casino.addedBy,
            addedDate: casino.addedDate,
            modifiedBy: casino.modifiedBy,
            modifiedDate: casino.modifiedDate,
            attachedTo: casino._id,
            tenancies: casino.tenancies
          });
          console.log('ShortLink created for casino ' + casino.name + ' (' + shortLink._id + ')');
        }
      }
    }
  } catch (error) {
    console.error('Error creating/updating ShortLinks:', error);
  }
}

// Function to update the statistics of short links
// The list of short links is retrieved from the database
// The number of hits for each short link is counted from the shortLinksHits table
// The statistics are then updated in the shortLinksStatistics table

async function updateShortLinksStatistics() {
  try {
    // Get all short links from the database
    const shortLinks = await ShortLinks.find();

    // Loop through all short links
    for (const shortLink of shortLinks) {
      // Get the number of hits for the short link
      const shortLinkHits = await ShortLinksHits.countDocuments({
        shortLink: shortLink._id
      });

      // Get the number of hits in the past 1 hour
      const shortLinkHits1h = await ShortLinksHits.countDocuments({
        shortLink: shortLink._id,
        timestamp: {
          $gte: new Date(Date.now() - 60 * 60 * 1000),
        },
      });

      // Get the number of hits in the past 3 hours
      const shortLinkHits3h = await ShortLinksHits.countDocuments({
        shortLink: shortLink._id,
        timestamp: {
          $gte: new Date(Date.now() - 3 * 60 * 60 * 1000),
        },
      });

      // Get the number of hits in the past 6 hours
      const shortLinkHits6h = await ShortLinksHits.countDocuments({
        shortLink: shortLink._id,
        timestamp: {
          $gte: new Date(Date.now() - 6 * 60 * 60 * 1000),
        },
      });

      // Get the number of hits in the past 12 hours
      const shortLinkHits12h = await ShortLinksHits.countDocuments({
        shortLink: shortLink._id,
        timestamp: {
          $gte: new Date(Date.now() - 12 * 60 * 60 * 1000),
        },
      });

      // Get the number of hits in the past 24 hours
      const shortLinkHits24h = await ShortLinksHits.countDocuments({
        shortLink: shortLink._id,
        timestamp: {
          $gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      });

      // Get the number of hits in the past 7 days
      const shortLinkHits7d = await ShortLinksHits.countDocuments({
        shortLink: shortLink._id,
        timestamp: {
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      });

      // Get the number of hits in the past 30 days
      const shortLinkHits30d = await ShortLinksHits.countDocuments({
        shortLink: shortLink._id,
        timestamp: {
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      });

      // Get the number of hits in the past 12 months
      const shortLinkHits12m = await ShortLinksHits.countDocuments({
        shortLink: shortLink._id,
        timestamp: {
          $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        },
      });

      // Update the short link object with the new statistics
      shortLink.hits = shortLinkHits;
      shortLink.hits1h = shortLinkHits1h;
      shortLink.hits3h = shortLinkHits3h;
      shortLink.hits6h = shortLinkHits6h;
      shortLink.hits12h = shortLinkHits12h;
      shortLink.hits24h = shortLinkHits24h;
      shortLink.hits7d = shortLinkHits7d;
      shortLink.hits30d = shortLinkHits30d;
      shortLink.hits12m = shortLinkHits12m;

      // Check if the short link statistics object already exists
      const shortLinkStatistics = await ShortLinksStatistics.findOne({
        shortLink: shortLink._id
      });

      if (shortLinkStatistics) {
        // Update the existing short link statistics object
        shortLinkStatistics.hits = shortLinkHits;
        shortLinkStatistics.hits1h = shortLinkHits1h;
        shortLinkStatistics.hits3h = shortLinkHits3h;
        shortLinkStatistics.hits6h = shortLinkHits6h;
        shortLinkStatistics.hits12h = shortLinkHits12h;
        shortLinkStatistics.hits24h = shortLinkHits24h;
        shortLinkStatistics.hits7d = shortLinkHits7d;
        shortLinkStatistics.hits30d = shortLinkHits30d;
        shortLinkStatistics.hits12m = shortLinkHits12m;
        await shortLinkStatistics.save();
      } else {
        // Create a new short link statistics object
        await ShortLinksStatistics.create({
          shortLink: shortLink._id,
          hits: shortLinkHits,
          hits1h: shortLinkHits1h,
          hits3h: shortLinkHits3h,
          hits6h: shortLinkHits6h,
          hits12h: shortLinkHits12h,
          hits24h: shortLinkHits24h,
          hits7d: shortLinkHits7d,
          hits30d: shortLinkHits30d,
          hits12m: shortLinkHits12m,
          tenancies: shortLink.tenancies
        });
      }

      // Save the updated short link object
      await shortLink.save();
    }
  } catch (error) {
    console.error('Error updating short links statistics:', error);
  }
}

// Call the function on startup, then every hour
updateShortLinksStatistics();
setInterval(updateShortLinksStatistics, 60 * 60 * 1000);

createShortLinks();

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

// Route zum Umleiten von kurzen URLs
app.get('/:shortUrl', async (req, res) => {
  const {
    shortUrl
  } = req.params;
  const url = await ShortLinks.findOne({
    shortUrl
  });
  if (url) {
    // Record link hit to shortLinksHits table
    await ShortLinksHits.create({
      shortLink: url._id,
      timestamp: new Date(),
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      tenancies: url.tenancies
    });

    res.redirect(url.url);
  } else {
    res.status(404).send({
      error: 'Url not found'
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});