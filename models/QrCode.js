const mongoose = require('mongoose');
const qrCodeSchema = new mongoose.Schema({
    _userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    code: {
        type: String,
        required: true
    },
    enabled: {
        type: Boolean,
        default: 1
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
        expires: 21700
    }
});

module.exports = mongoose.model('qrcode', qrCodeSchema);