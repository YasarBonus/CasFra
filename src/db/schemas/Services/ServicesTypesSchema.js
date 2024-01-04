const mongoose = require('mongoose');

const ServicesTypesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
});

const ServicesTypes = mongoose.model('ServicesTypes', ServicesTypesSchema);

module.exports = ServicesTypes;
