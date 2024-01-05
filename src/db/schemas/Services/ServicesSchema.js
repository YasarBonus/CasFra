const mongoose = require('mongoose');

const ServicesPricingSchema = new mongoose.Schema({
    available_intervals: {
        type: [String],
        enum: ['once', 'second', 'minute', 'hour', 'day', 'week', 'month', 'year'],
    },
    price: {
        type: Number,
        required: true,
        default: 0,
    },
    once: {
        type: Number,
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
        shortname: 'vps1',
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
            available_intervals: ['once', 'second', 'minute', 'hour', 'day', 'week', 'month', 'year'],
            price: 5,
            once: 5,
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
        shortname: 'vps2',
        type: 'VPS',
        description: 'VPS 2 description',
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
            available_intervals: ['once', 'second', 'minute', 'hour', 'day', 'week', 'month', 'year'],
            price: 5,
            once: 5,
            second: 0.000005787,
            minute: 0.00034722,
            hour: 0.0208333,
            day: 0.5,
            week: 3.5,
            month: 5,
            year: 60,
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
        console.log(`Service ${item.name} created`);
    }
} );


module.exports = Services;