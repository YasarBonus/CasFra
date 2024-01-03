const mongoose = require('mongoose');

const userPersonalAddressSchema = new mongoose.Schema({
    street: {
        type: String,
        maxlength: 50
    },
    street_number: {
        type: String,
        maxlength: 50
    },
    city: {
        type: String,
        maxlength: 50
    },
    country: {
        type: String,
        maxlength: 50
    },
    zip_code: {
        type: String,
        maxlength: 50
    },
    additional_info: {
        type: String,
        maxlength: 1000
    },
});
