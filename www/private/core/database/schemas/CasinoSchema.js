const mongoose = require('mongoose');
const generateRandomPriority = require('../../utils/generateRandomPriority');

// Define Casino schema
const casinoSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    maxlength: 30
  },
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
  newCasino: {
    type: Boolean,
    default: false
  },
  label: String,
  labelLarge: String,
  individualBonuses: [String],
  displayBonus: String,
  maxBet: {
    type: Number,
    default: 0
  },
  maxCashout:{
    type: Number,
    default: 0
  },
  wager: {
    type: Number,
    default: 0
  },
  wagerType: [String],
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

module.exports = Casino;