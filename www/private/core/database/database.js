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
const NotificationEmails = require('./schemas/NotificationEmailsSchema.js');
const NotificationEmailQueue = require('./schemas/NotificationEmailQueueSchema.js');
const Tenancie = require('./schemas/TenanciesSchema.js');
const TenanciesTypes = require('./schemas/TenanciesTypesSchema.js');
const User = require('./schemas/UserSchema.js');
const UserGroup = require('./schemas/UserGroupSchema.js');




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







const registrationKeyEntries = [{
  regkey: 'admin',
  created: new Date(),
  used: false
}];

// data missing for above




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