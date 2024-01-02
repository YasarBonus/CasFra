const mongoose = require('mongoose');

// Define GlobalEmailConfiguration schema
const GlobalEmailConfigurationSchema = new mongoose.Schema({
    host: String,
    port: Number,
    secure: Boolean,
    auth: {
      user: String,
      pass: String
    },
    defaultFrom: String,
  });
  
  const GlobalEmailConfiguration = mongoose.model('GlobalEmailConfiguration', GlobalEmailConfigurationSchema);
  
  const globalEmailConfigurationEntry = {
    host: 'mail.behindthemars.de',
    port: 587,
    secure: false,
    auth: {
      user: 'system@treudler.net',
      pass: 'iongai5ge9Quah4Ya9leizaeMie5oo8equee4It1eiyuuz1Voi'
    },
    defaultFrom: 'system@treudler.net',
  };
  
  const saveDefaultGlobalEmailConfigurationDatabaseData = async () => {
    try {
      const promises = [];
  
      const existingGlobalEmailConfiguration = await GlobalEmailConfiguration.findOne({
        host: globalEmailConfigurationEntry.host
      });
  
      if (!existingGlobalEmailConfiguration) {
        const newGlobalEmailConfiguration = new GlobalEmailConfiguration(globalEmailConfigurationEntry);
        promises.push(newGlobalEmailConfiguration.save());
        console.log('GlobalEmailConfiguration entry saved:', newGlobalEmailConfiguration);
      }
  
      await Promise.all(promises);
    } catch (error) {
      console.error('Error saving Default GlobalEmailConfiguration Database Data:', error);
    }
  };
  
  saveDefaultGlobalEmailConfigurationDatabaseData();

  module.exports = GlobalEmailConfiguration;