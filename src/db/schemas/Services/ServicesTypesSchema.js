const mongoose = require('mongoose');

const ServicesTypesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    active: {
        type: Boolean,
        default: true,
    },
});

const ServicesTypes = mongoose.model('ServicesTypes', ServicesTypesSchema);

const ServicesTypesData = [
    {
        name: 'Nothing',
        active: true,
    },
    {
        name: 'VPS',
        active: true,
    },
    {
        name: 'Web Hosting',
        active: true,
    },
    {
        name: 'Domain',
        active: true,
    },
    {
        name: 'SSL',
        active: false
    },
];

ServicesTypesData.forEach(async (item) => {
    const serviceType = await ServicesTypes.findOne({ name: item.name });
    if (!serviceType) {
        ServicesTypes.create(item);
    }
} );

module.exports = ServicesTypes;
