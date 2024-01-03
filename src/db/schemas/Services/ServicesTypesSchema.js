const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ServicesTypesSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
});

module.exports = ServicesTypes = mongoose.model('servicesTypes', ServicesTypesSchema);

