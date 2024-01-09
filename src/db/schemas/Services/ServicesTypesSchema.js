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
        adapter: {
            name: 'Nothing',
            internal_name: 'nothing',
            active: true,
        },
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
        internal_name: 'web-hosting',
        active: true,
        adapter: {
            name: 'Web Hosting',
            internal_name: 'plesk',
            active: true,
        },
    },
    {
        name: 'Domain',
        internal_name: 'domain',
        active: true,
        adapter: {
            name: 'Web Hosting',
            internal_name: 'plesk',
            active: true,
        },
    },
    {
        name: 'SSL',
        internal_name: 'ssl',
        active: false,
        adapter: {
            name: 'Web Hosting',
            internal_name: 'plesk',
            active: true,
        },
    },
    {
        name: 'Twitch Wishlist Bot',
        internal_name: 'twitch-wishlist-bot',
        active: true,
        adapter: {
            name: 'Twitch Wishlist Bot v1',
            internal_name: 'TwitchWishListBotv1',
            active: true,
        },
    },
];

ServicesTypesData.forEach(async (item) => {
    const serviceType = await ServicesTypes.findOne({ internal_name: item.internal_name });
    if (!serviceType) {
        ServicesTypes.create(item);
    }
} );

module.exports = ServicesTypes;
