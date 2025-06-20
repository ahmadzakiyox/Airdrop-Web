// config/db.js
const mongoose = require('mongoose');
require('dotenv').config(); // Memuat variabel lingkungan

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
        // Keluar proses dengan kegagalan
        process.exit(1);
    }
};

module.exports = connectDB;