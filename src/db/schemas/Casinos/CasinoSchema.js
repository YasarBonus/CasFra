const mongoose = require('mongoose');
const generateRandomPriority = require('../../../utils/generateRandomPriority');

// Define Casino schema
const casinoSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  categories: {
    type: [mongoose.Schema.Types.ObjectId],
    required: true,
    ref: 'CasinoCategories'
  },
  description: {
    type: String,
    maxlength: 1000
  },
  priority: {
    type: Number,
    default: generateRandomPriority()
  },
  addedDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  modifiedDate: Date,
  modifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  active: {
    type: Boolean,
    default: false
  },
  newCasino: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    maxlength: 100
  },
  label: {
    type: String,
    maxlength: 100
  },
  individualBonuses:  {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'CasinoIndividualBonuses'
  },
  displayBonus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CasinoIndividualBonuses'
  },
  maxBet: {
    type: Number,
    default: 0,
    maxlength: 6
  },
  maxCashout:{
    type: Number,
    default: 0
  },
  wager: {
    type: Number,
    default: 0
  },
  wagerType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CasinoWagerTypes'
  },
  noDeposit: {
    type: Boolean,
    default: false
  },
  prohibitedGamesProtection: {
    type: Boolean,
    default: false
  },
  vpn: {
    type: Boolean,
    default: false
  },
  features: {
    type: [mongoose.Schema.Types.ObjectId]
  },
  individualFeatures: [mongoose.Schema.Types.ObjectId],
  providers: [mongoose.Schema.Types.ObjectId],
  paymentMethods: [mongoose.Schema.Types.ObjectId],
  reviewTitle: String,
  review: String,
  image: String,
  imageUrl: String,
  affiliateUrl: String,
  affiliateShortlink: String,
  licenses: [mongoose.Schema.Types.ObjectId],
  tags: [mongoose.Schema.Types.ObjectId],
  tenancies: [mongoose.Schema.Types.ObjectId],
});

const Casino = mongoose.model('Casino', casinoSchema);

module.exports = Casino;