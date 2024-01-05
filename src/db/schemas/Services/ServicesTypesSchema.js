const mongoose = require('mongoose');

const ServicesTypesAdapterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    internal_name: {
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

const ServicesTypesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    internal_name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    active: {
        type: Boolean,
        default: true,
    },
    adapter: ServicesTypesAdapterSchema,
});

const ServicesTypes = mongoose.model('ServicesTypes', ServicesTypesSchema);

const ServicesTypesData = [
    {
        name: 'Nothing',
        internal_name: 'nothing',
        active: true,
    },
    {
        name: 'VPS',
        internal_name: 'vps',
        active: true,
        adapter: {
            name: 'VPS',
            internal_name: 'vps',
            active: true,
        },
    },
    {
        name: 'Web Hosting',
        active: true,
        adapter: {
            name: 'Web Hosting',
            internal_name: 'plesk',
            active: true,
        },
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
