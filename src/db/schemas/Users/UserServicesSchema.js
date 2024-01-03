const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserServicesSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    service: [{
        type: Schema.Types.ObjectId,
        ref: 'services'
    }],
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

module.exports = UserServices = mongoose.model('userServices', UserServicesSchema);