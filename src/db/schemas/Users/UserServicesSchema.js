const mongoose = require('mongoose');

const UserServicesSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'services'
    },
    creation_date: {
        type: Date,
    },
    start_date: {
        type: Date,
    },
    active: {
        type: Boolean,
        default: false,
    },
});

const UserServices = mongoose.model('UserServices', UserServicesSchema);

module.exports = UserServices;