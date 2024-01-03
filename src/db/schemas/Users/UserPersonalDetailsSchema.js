const mongoose = require('mongoose');

const userPersonalDetailsSchema = new mongoose.Schema({
    first_name: {
        type: String,
        maxlength: 50
    },
    second_name: {
        type: String,
        maxlength: 50
    },
    last_name: {
        type: String,
        maxlength: 50
    },
    nationality: {
        type: String,
        maxlength: 50
    },
    date_of_birth: {
        type: Date,
        maxlength: 50
    },
    place_of_birth: {
        type: String,
        maxlength: 50
    },
});

