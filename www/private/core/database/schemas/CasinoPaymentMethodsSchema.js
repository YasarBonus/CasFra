const mongoose = require('mongoose');
const generateRandomPriority = require('../../utils/generateRandomPriority');


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

  
    exports.CasinoPaymentMethods = CasinoPaymentMethods;