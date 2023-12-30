const mongoose = require('mongoose');

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

const GlobalEmailConfiguration = require('./schemas/GlobalEmailConfigurationSchema.js');
const Language = require('./schemas/LanguageSchema.js');
const Session = require('./schemas/SessionSchema.js');


const NotificationEmailsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  subject: String,
  message: String,
  type: {
    type: String,
    default: 'info'
  },
  transporter: {
    type: String,
    default: 'all'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  },
  readDate: {
    type: Date,
  },
  emailDelivered: {
    type: Boolean,
    default: false
  },
  emailDeliveredDate: {
    type: Date,
  },
  emailDeliveredTo: {
    type: String,
  },
});

const NotificationEmails = mongoose.model('NotificationEmails', NotificationEmailsSchema);

const NotificationEmailQueueSchema = new mongoose.Schema({
  notificationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  allDelivered: {
    type: Boolean,
    default: false
  },
  allDeliveredDate: {
    type: Date,
  },
  emailDelivered: {
    type: Boolean,
  },
  emailDeliveredDate: {
    type: Date,
  },
  emailDeliveredTo: {
    type: String,
  },
  updateTimestamp: {
    type: Date,
    default: Date.now
  },
});

const NotificationEmailQueue = mongoose.model('NotificationEmailQueue', NotificationEmailQueueSchema);

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

const Tenancie = mongoose.model('Tenancie', tenanciesSchema);

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

const TenanciesTypes = mongoose.model('TenanciesTypes', tenanciesTypesSchema);

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

const User = mongoose.model('User', userSchema);

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

const UserGroup = mongoose.model('UserGroup', userGroupSchema);

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

const RegistrationKey = mongoose.model('RegistrationKey', registrationKeySchema);

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

const Images = mongoose.model('Images', imagesSchema);

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

const ImagesCategories = mongoose.model('ImagesCategories', imagesCategoriesSchema);

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

const Casino = mongoose.model('Casino', casinoSchema);

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

const CasinoReview = mongoose.model('CasinoReview', casinoReviewSchema);

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

const CasinoTags = mongoose.model('CasinoTags', casinoTagsSchema);

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

const CasinoFeatures = mongoose.model('CasinoFeatures', casinoFeaturesSchema);

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

const CasinoIndividualFeatures = mongoose.model('CasinoIndividualFeatures', casinoIndividualFeaturesSchema);

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

const CasinoIndividualBonuses = mongoose.model('CasinoIndividualBonuses', casinoIndividualBonusesSchema);

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

const CasinoProvider = mongoose.model('CasinoProvider', casinoProviderSchema);

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

const CasinoLicenses = mongoose.model('CasinoLicenses', casinoLicensesSchema);

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

const CasinoPaymentMethods = mongoose.model('CasinoPaymentMethods', casinoPaymentMethodsSchema);

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

const CasinoWagerTypes = mongoose.model('CasinoWagerTypes', casinoWagerTypesSchema);

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

const CasinoCategories = mongoose.model('CasinoCategories', casinoCategoriesSchema);

// Define shortLinks Schema
const shortLinksSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 20
  },
  shortUrl: String,
  description: {
    type: String,
    maxlength: 100
  },
  tenancies: {
    type: [mongoose.Schema.Types.ObjectId],
    required: true
  },
  addedDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
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
    type: mongoose.Schema.Types.ObjectId,
  },
  hits: {
    type: Number,
    default: 0
  }
});

const ShortLinks = mongoose.model('ShortLinks', shortLinksSchema);

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

const ShortLinksHits = mongoose.model('ShortLinksHits', shortLinksHitsSchema);

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

const ShortLinksStatistics = mongoose.model('ShortLinksStatistics', shortLinksStatisticsSchema);






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

// Exportieren Sie die Modelle, die Sie benötigen
module.exports = {
    GlobalEmailConfiguration,
    Session,
    Language,
    NotificationEmails,
    NotificationEmailQueue,
    Tenancie,
    TenanciesTypes,
    User,
    UserGroup,
    RegistrationKey,
    Images,
    ImagesCategories,
    Casino,
    CasinoReview,
    CasinoTags,
    CasinoFeatures,
    CasinoLicenses,
    CasinoIndividualFeatures,
    CasinoIndividualBonuses,
    CasinoProvider,
    CasinoPaymentMethods,
    CasinoWagerTypes,
    CasinoCategories,
    ShortLinks,
    ShortLinksHits,
    ShortLinksStatistics
  };