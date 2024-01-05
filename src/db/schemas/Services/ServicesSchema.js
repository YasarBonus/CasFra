const mongoose = require('mongoose');

const ServicesPricingSchema = new mongoose.Schema({
    recurring: {
        type: Boolean,
        default: false,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        default: 0,
    },
    second: {
        type: Number,
    },
    minute: {
        type: Number,
    },
    hour: {
        type: Number,
    },
    day: {
        type: Number,
    },
    week: {
        type: Number,
    },
    month: {
        type: Number,
    },
    year: {
        type: Number,
    },
});

const ServicesDetailsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    value: {
        type: String,
        required: true,
    },
    unit: {
        type: String,
    },
});

const ServicesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    shortname: {
        type: String,
        required: true,
        unique: true,
    },
    type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServicesTypes'
    },
    description: {
        type: String,
        required: true,
    },
    details: [ServicesDetailsSchema],
    pricing: ServicesPricingSchema,
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
    orderable: {
        type: Boolean,
        default: true,
    },
});

const Services = mongoose.model('Services', ServicesSchema);

// Default data

const ServicesData = [
    {
        name: 'VPS 1',
        type: 'VPS',
        description: 'VPS 1 description',
        details: [
            {
                name: 'CPU',
                value: '1',
                unit: 'Core',
            },
            {
                name: 'RAM',
                value: '1',
                unit: 'GB',
            },
            {
                name: 'SSD',
                value: '10',
                unit: 'GB',
            },
            {
                name: 'Bandwidth',
                value: '1',
                unit: 'TB',
            },
        ],
        pricing: {
            recurring: true,
            price: 5,
            second: 0.000005787,
            minute: 0.00034722,
            hour: 0.0208333,
            day: 0.5,
            week: 3.5,
            month: 5,
            year: 60,
        },
    },
    {
        name: 'VPS 2',
        type: 'VPS',
        description: 'VPS 2 description',
        pricing: {
            recurring: true,
            price: 10,
            price_1_month: 10,
            price_3_months: 30,
            price_6_months: 60,
            price_12_months: 120,
        },
    },
];

const ServicesTypes = require('./ServicesTypesSchema');

ServicesData.forEach(async (item) => {
    const service = await Services.findOne({ name: item.name });
    if (!service) {
        const serviceType = await ServicesTypes.findOne({ name: item.type });
        item.type = serviceType._id;
        Services.create(item);
    }
} );


module.exports = Services;