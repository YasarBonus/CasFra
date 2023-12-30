const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/casfra', {
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
const CasinoIndividualBonuses = require('./schemas/CasinoIndividualBonusesSchema.js');
const CasinoProvider = require('./schemas/CasinoProviderSchema.js');
const CasinoPaymentMethods = require('./schemas/CasinoPaymentMethodsSchema.js');
const CasinoWagerTypes = require('./schemas/CasinoWagerTypesSchema.js');
const CasinoCategories = require('./schemas/CasinoCategoriesSchema.js');
const CasinoLicenses = require('./schemas/CasinoLicensesSchema.js');
const ShortLinks = require('./schemas/ShortLinksSchema.js');
const ShortLinksHits = require('./schemas/ShortLinksHitsSchema.js');
const ShortLinksStatistics = require('./schemas/ShortLinksStatisticsSchema.js');

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