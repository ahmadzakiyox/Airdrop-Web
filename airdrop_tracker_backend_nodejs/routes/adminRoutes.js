// airdrop_tracker_backend_nodejs/routes/adminRoutes.js
const express = require('express');
const { body } = require('express-validator');
const protect = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const User = require('../models/User');

const router = express.Router();

// --- PASTIKAN BAGIAN INI SAMA PERSIS ---
router.get('/users', protect, admin, async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) { console.error('Error fetching all users (Admin):', error.message); res.status(500).json({ message: 'Gagal mendapatkan data pengguna.' }); }
});
// --- AKHIR PASTIKAN ---
// Rute untuk update user role (isAdmin, emailVerified) (Admin only)
router.put('/users/:id/role', protect, admin, [
    body('isAdmin').optional().isBoolean(),
    body('emailVerified').optional().isBoolean(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { return res.status(400).json({ errors: errors.array() }); }
    const { isAdmin, emailVerified } = req.body;
    try {
        const user = await User.findById(req.params.id);
        if (!user) { return res.status(404).json({ message: 'Pengguna tidak ditemukan.' }); }
        if (isAdmin !== undefined) { user.isAdmin = isAdmin; }
        if (emailVerified !== undefined) { user.emailVerified = emailVerified; }
        await user.save();
        res.json({ message: 'Peran pengguna berhasil diperbarui.', user: { id: user._id, username: user.username, isAdmin: user.isAdmin, emailVerified: user.emailVerified } });
    } catch (error) { console.error('Error updating user role (Admin):', error.message); res.status(500).json({ message: 'Gagal memperbarui peran pengguna.' }); }
});

// Rute untuk menghapus user (Admin only)
router.delete('/users/:id', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) { return res.status(404).json({ message: 'Pengguna tidak ditemukan.' }); }
        await user.deleteOne();
        res.json({ message: 'Pengguna berhasil dihapus.' });
    } catch (error) { console.error('Error deleting user (Admin):', error.message); res.status(500).json({ message: 'Gagal menghapus pengguna.' }); }
});
module.exports = router;