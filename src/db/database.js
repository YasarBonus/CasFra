const mongoose = require('mongoose');
const mongooseConfig = require('../config/mongooseConfig.js');

mongoose.connect(mongooseConfig.url, mongooseConfig.options)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

const GlobalEmailConfiguration = require('./schemas/Other/GlobalEmailConfigurationSchema.js');
const Language = require('./schemas/Other/LanguageSchema.js');
const Session = require('./schemas/Other/SessionSchema.js');
const NotificationEmails = require('./schemas/Other/NotificationEmailsSchema.js');
const NotificationEmailQueue = require('./schemas/Other/NotificationEmailQueueSchema.js');
const Tenancies = require('./schemas/Other/tenanciesSchema.js');
const TenanciesTypes = require('./schemas/Other/TenanciesTypesSchema.js');
const User = require('./schemas/Users/UserSchema.js');
const UserGroup = require('./schemas/Users/UserGroupSchema.js');
const RegistrationKey = require('./schemas/Other/RegistrationKeySchema.js');
const Images = require('./schemas/Other/ImagesSchema.js');
const ImagesCategories = require('./schemas/Other/ImagesCategoriesSchema.js');
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
const ShortLinks = require('./schemas/Other/ShortLinksSchema.js');
const ShortLinksHits = require('./schemas/Other/ShortLinksHitsSchema.js');
const ShortLinksStatistics = require('./schemas/Other/ShortLinksStatisticsSchema.js');

const CasinoWishListBot = require('./schemas/Other/CasinoWishListBotSchema.js');

const ProxmoxServers = require('./schemas/Proxmox/ProxmoxServersSchema.js');
const ProxmoxServersLogs = require('./schemas/Proxmox/ProxmoxServersSchema.js');

// Services and Orders
const Services = require('./schemas/Services/ServicesSchema.js');
const ServicesTypes = require('./schemas/Services/ServicesTypesSchema.js');
const ServicesOrders = require('./schemas/Services/ServicesOrdersSchema.js');
const ServicesActive = require('./schemas/Services/ServicesActiveSchema.js');

// User Points
const UserPoints = require('./schemas/Users/UserPointsSchema.js');
const UserPointsHistory = require('./schemas/Users/UserPointsHistorySchema.js');

const HcVms = require('./schemas/Other/HcVmSchema.js');

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
    HcVms,
    Services,
    ServicesTypes,
    ServicesOrders,
    ServicesActive,
    CasinoWishListBot,
    UserPoints,
    UserPointsHistory,
  };