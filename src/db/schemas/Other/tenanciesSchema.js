const mongoose = require('mongoose');
const generateRandomPriority = require('../../../utils/generateRandomPriority');
 
const tenanciesSchema = new mongoose.Schema({
    name: String,
    notes: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    modifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    modifiedDate: Date,
    image: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Images'
    },
    admins: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User'
    },
    active: {
        type: Boolean,
        default: true
    },
    priority: {
        type: Number,
        default: 0
    },
    type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TenanciesTypes'
    },
    maxCasinos: {
        type: Number,
        default: 10
    },
})

const Tenancies = mongoose.model('Tenancies', tenanciesSchema);



const tenanciesEntries = [{
    name: 'Treudler',
    active: true,
}]

const saveDefaultTenanciesDatabaseData = async () => {
    try {
        const promises = [];

        for (const tenanciesEntry of tenanciesEntries) {
            const existingTenancies = await Tenancies.findOne({
                name: tenanciesEntry.name
            });

            if (!existingTenancies) {
                const newTenancies = new Tenancies(tenanciesEntry);
                promises.push(newTenancies.save());
                console.log('Tenancies entry saved:', newTenancies);
            } else if (existingTenancies.description !== tenanciesEntry.description) {
                existingTenancies.description = tenanciesEntry.description;
                promises.push(existingTenancies.save());
                console.log('Tenancies entry updated:', existingTenancies);
            }
        }

        await Promise.all(promises);
    } catch (error) {
        console.error('Error saving Default Tenancies Database Data:', error);
    }
};

saveDefaultTenanciesDatabaseData();

module.exports = Tenancies;