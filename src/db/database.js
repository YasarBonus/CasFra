const mongoose = require('mongoose');
const mongooseConfig = require('../config/mongooseConfig.js');

mongoose.connect(mongooseConfig.url, mongooseConfig.options)
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
const Tenancies = require('./schemas/TenanciesSchema.js');
const TenanciesTypes = require('./schemas/TenanciesTypesSchema.js');
const User = require('./schemas/Users/UserSchema.js');
const UserGroup = require('./schemas/Users/UserGroupSchema.js');
const UserPersonalDetails = require('./schemas/Users/UserPersonalDetailsSchema.js');
const RegistrationKey = require('./schemas/RegistrationKeySchema.js');
const Images = require('./schemas/ImagesSchema.js');
const ImagesCategories = require('./schemas/ImagesCategoriesSchema.js');
const Casino = require('./schemas/Casinos/CasinoSchema.js');
const CasinoTags = require('./schemas/Casinos/CasinoTagsSchema.js');
const CasinoFeatures = require('./schemas/Casinos/CasinoFeaturesSchema.js');
const CasinoIndividualFeatures = require('./schemas/Casinos/CasinoIndividualFeaturesSchema.js');
const CasinoIndividualBonuses = require('./schemas/Casinos/CasinoIndividualBonusesSchema.js');
const CasinoProvider = require('./schemas/Casinos/CasinoProviderSchema.js');
const CasinoPaymentMethods = require('./schemas/Casinos/CasinoPaymentMethodsSchema.js');
const CasinoWagerTypes = require('./schemas/Casinos/CasinoWagerTypesSchema.js');
const CasinoCategories = require('./schemas/Casinos/CasinoCategoriesSchema.js');
const CasinoLicenses = require('./schemas/Casinos/CasinoLicensesSchema.js');
const ShortLinks = require('./schemas/ShortLinksSchema.js');
const ShortLinksHits = require('./schemas/ShortLinksHitsSchema.js');
const ShortLinksStatistics = require('./schemas/ShortLinksStatisticsSchema.js');

const ProxmoxServers = require('./schemas/Proxmox/ProxmoxServersSchema.js');
const ProxmoxServersLogs = require('./schemas/Proxmox/ProxmoxServersSchema.js');

const HcVms = require('./schemas/HcVmSchema.js');

module.exports = {
    GlobalEmailConfiguration,
    Session,
    Language,
    NotificationEmails,
    NotificationEmailQueue,
    Tenancies,
    TenanciesTypes,
    User,
    UserGroup,
    UserPersonalDetails,
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
    ShortLinksStatistics,
    ProxmoxServers,
    ProxmoxServersLogs,
    HcVms
  };