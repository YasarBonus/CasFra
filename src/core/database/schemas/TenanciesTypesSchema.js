const mongoose = require('mongoose');
const generateRandomPriority = require('../../utils/generateRandomPriority');


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
    } catch (error) {
      console.error('Error saving Default TenanciesTypes Database Data:', error);
    }
  };
  
  saveDefaultTenanciesTypesDatabaseData();

module.exports = TenanciesTypes;