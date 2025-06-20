// airdrop_tracker_backend_nodejs/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) { return res.status(401).json({ message: 'Token tidak valid. Pengguna tidak ditemukan.' }); }
            if (!req.user.emailVerified) { return res.status(403).json({ message: 'Akses ditolak. Email Anda belum diverifikasi.' }); }
            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') { return res.status(401).json({ message: 'Sesi kedaluwarsa. Silakan login ulang.' }); }
            if (error.name === 'JsonWebTokenError') { return res.status(401).json({ message: 'Token tidak valid. Silakan login ulang.' }); }
            console.error('Auth Middleware Error:', error);
            res.status(401).json({ message: 'Tidak terotentikasi. Token gagal.' });
        }
    }
    if (!token) { res.status(401).json({ message: 'Tidak terotentikasi. Tidak ada token otorisasi.' }); }
};
module.exports = protect;