const mongoose = require('mongoose');
const generateRandomPriority = require('../../utils/generateRandomPriority');

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

module.exports = CasinoIndividualBonuses;