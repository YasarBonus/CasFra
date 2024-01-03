const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ServicesPricingSchema = new Schema({
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

const ServicesSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    type: {
        type: Schema.Types.ObjectId,
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
});

module.exports = Services = mongoose.model('Services', ServicesSchema);