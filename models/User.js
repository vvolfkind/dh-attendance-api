const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    }, 
    qrstring: {
        type: String,
        required: false,
    },
    role: {
        type: Number,
        required: true
    },
    isActive: {
        type: Boolean,
        default: 0
    },
    isVerified: {
        type: Boolean,
        default: 0
    },
    date: {
        type: Date,
        dafault: Date.now
    }

});

module.exports = mongoose.model('user', UserSchema);