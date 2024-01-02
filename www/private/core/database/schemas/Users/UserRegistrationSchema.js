const mongoose = require('mongoose');

const userRegistrationSchema = new mongoose.Schema({
    registration_date: {
        type: Date,
        maxlength: 50
    },
    registration_ip: {
        type: String,
        maxlength: 50
    },
    registration_key: {
        type: String,
        maxlength: 50
    },
    registration_code: {
        type: String,
        maxlength: 50
    },
    registration_code_expires: {
        type: Date,
        maxlength: 50
    },
});