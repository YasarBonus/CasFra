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
    maxCasinos: {
        type: Number,
        default: 10
    },
})

const Tenancies = mongoose.model('Tenancies', tenanciesSchema);



const tenanciesEntries = [{
    name: 'Treudler',
}]

const saveDefaultTenanciesDatabaseData = async () => {
    try {
        const promises = [];

        for (const tenanciesEntry of tenancieEntries) {
            const existingTenancie = await Tenancies.findOne({
                name: tenancieEntry.name
            });

            if (!existingTenancies) {
                const newTenancies = new Tenancie(tenancieEntry);
                promises.push(newTenancie.save());
                console.log('Tenancies entry saved:', newTenancies);
            } else if (existingTenancies.description !== tenanciesEntry.description) {
                existingTenancies.description = tenanciesEntry.description;
                promises.push(existingTenancies.save());
                console.log('Tenancies entry updated:', existingTenancie);
            }
        }

        await Promise.all(promises);
    } catch (error) {
        console.error('Error saving Default Tenancies Database Data:', error);
    }
};

saveDefaultTenanciesDatabaseData();

module.exports = Tenancies;