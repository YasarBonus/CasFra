const mongoose = require('mongoose');

// Define Language schema
const LanguageSchema = new mongoose.Schema({
    name: String,
    code: String
  });
  
  const Language = mongoose.model('Language', LanguageSchema);

  const languageEntries = [{
    name: 'English',
    code: 'en'
  },
  {
    name: 'French',
    code: 'fr'
  },
  {
    name: 'Spanish',
    code: 'es'
  },
  {
    name: 'German',
    code: 'de'
  },
];

const saveDefaultLanguageDatabaseData = async () => {
    try {
        const promises = [];
    
        for (const languageEntry of languageEntries) {
        const existingLanguage = await Language.findOne({
            name: languageEntry.name
        });
    
        if (!existingLanguage) {
            const newLanguage = new Language(languageEntry);
            promises.push(newLanguage.save());
            console.log('Language entry saved:', newLanguage);
        }
        }
    
        await Promise.all(promises);
        console.log('Default Language Database Data successfully saved.');
    } catch (error) {
        console.error('Error saving Default Language Database Data:', error);
    }
    };

    saveDefaultLanguageDatabaseData();

    module.exports = Language;