const mongoose = require('mongoose');

const userEmailsSchema = new mongoose.Schema({
    email: {
        type: String,
        maxlength: 50
    },
    is_primary: {
        type: Boolean,
        maxlength: 50
    },
    is_confirmed: {
        type: Boolean,
        default: false,
        maxlength: 50
    },
    confirmation_code: {
        type: String,
        maxlength: 50
    },
    confirmation_code_sent: {
        type: Date,
        maxlength: 50
    },
    confirmation_code_expires: {
        type: Date,
        maxlength: 50
    },
    confirmation_date: {
        type: Date,
        maxlength: 50
    },
});