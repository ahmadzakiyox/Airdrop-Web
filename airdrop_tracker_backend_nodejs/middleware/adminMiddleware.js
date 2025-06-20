// airdrop_tracker_backend_nodejs/middleware/adminMiddleware.js
const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ message: 'Akses ditolak. Hanya admin yang diizinkan.' });
    }
};
module.exports = admin;