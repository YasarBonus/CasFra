const mongoose = require('mongoose');

const userStatusSchema = new mongoose.Schema({
    active: {
        type: Boolean,
        default: false,
        required: true
    },
    banned: {
        type: Boolean,
        default: false
    },
    online: {
        type: Boolean,
        default: false
    },
    last_seen: {
        type: Date,
        maxlength: 50
    },
});