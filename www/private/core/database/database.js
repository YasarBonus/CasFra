const mongoose = require('mongoose');
const generateRandomPriority = require('../utils/generateRandomPriority');

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


const GlobalEmailConfiguration = require('./schemas/GlobalEmailConfigurationSchema.js');
const Language = require('./schemas/LanguageSchema.js');
const Session = require('./schemas/SessionSchema.js');
const NotificationEmails = require('./schemas/NotificationEmailsSchema.js');
const NotificationEmailQueue = require('./schemas/NotificationEmailQueueSchema.js');
const Tenancie = require('./schemas/TenanciesSchema.js');
const TenanciesTypes = require('./schemas/TenanciesTypesSchema.js');
const User = require('./schemas/UserSchema.js');
const UserGroup = require('./schemas/UserGroupSchema.js');
const RegistrationKey = require('./schemas/RegistrationKeySchema.js');
const Images = require('./schemas/ImagesSchema.js');
const ImagesCategories = require('./schemas/ImagesCategoriesSchema.js');
const Casino = require('./schemas/CasinoSchema.js');
const CasinoTags = require('./schemas/CasinoTagsSchema.js');
const CasinoFeatures = require('./schemas/CasinoFeaturesSchema.js');
const CasinoIndividualFeatures = require('./schemas/CasinoIndividualFeaturesSchema.js');



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