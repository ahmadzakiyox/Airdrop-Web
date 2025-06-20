// airdrop_tracker_backend_nodejs/models/Message.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Referensi ke model User
        required: true,
    },
    username: { // Menyimpan username pengirim agar tidak perlu populate setiap kali
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    // Jika ada multi-room chat, tambahkan field roomId
    // roomId: { type: String, required: true, default: 'general' }
});

module.exports = mongoose.model('Message', MessageSchema);