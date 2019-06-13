const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        minlength: 6,
        required: true,
    }, 
    role: {
        type: Number,
        required: true
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