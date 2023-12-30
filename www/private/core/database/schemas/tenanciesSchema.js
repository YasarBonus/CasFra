const mongoose = require('mongoose');
const generateRandomPriority = require('../../utils/generateRandomPriority');

const tenanciesSchema = new mongoose.Schema({
    name: String,
    notes: String,
    createdBy: {
        type: String,
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    modifiedBy: String,
    modifiedDate: Date,
    image: String,
    admins: [String],
    active: {
        type: Boolean,
        default: true
    },
    imageUrl: String,
    priority: {
        type: Number,
        default: generateRandomPriority()
    },
    type: String,
})

const Tenancie = mongoose.model('Tenancie', tenanciesSchema);


  
const tenancieEntries = [{
    name: 'Treudler',
}]

const saveDefaultTenancieDatabaseData = async () => {
    try {
        const promises = [];

        for (const tenancieEntry of tenancieEntries) {
            const existingTenancie = await Tenancie.findOne({
                name: tenancieEntry.name
            });

            if (!existingTenancie) {
                const newTenancie = new Tenancie(tenancieEntry);
                promises.push(newTenancie.save());
                console.log('Tenancie entry saved:', newTenancie);
            } else if (existingTenancie.description !== tenancieEntry.description) {
                existingTenancie.description = tenancieEntry.description;
                promises.push(existingTenancie.save());
                console.log('Tenancie entry updated:', existingTenancie);
            }
        }

        await Promise.all(promises);
        console.log('Default Tenancies Database Data successfully saved.');
    } catch (error) {
        console.error('Error saving Default Tenancies Database Data:', error);
    }
};

saveDefaultTenancieDatabaseData();

module.exports = Tenancie;