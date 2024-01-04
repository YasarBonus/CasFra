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
    price_1_month: {
        type: Number,
    },
    price_3_months: {
        type: Number,
    },
    price_6_months: {
        type: Number,
    },
    price_12_months: {
        type: Number,
    },
});

const ServicesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServicesTypes'
    },
    description: {
        type: String,
        required: true,
    },
    pricing: ServicesPricingSchema,
    active: {
        type: Boolean,
        default: true,
    },
    orderable: {
        type: Boolean,
        default: true,
    },
});

const Services = mongoose.model('Services', ServicesSchema);

module.exports = Services;