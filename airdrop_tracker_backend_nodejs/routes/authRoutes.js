// airdrop_tracker_backend_nodejs/routes/authRoutes.js
const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', [
    body('username', 'Username diperlukan').not().isEmpty(),
    body('email', 'Sertakan email yang valid').isEmail(),
    body('password', 'Password minimal 6 karakter').isLength({ min: 6 }),
], authController.registerUser);

router.post('/login', [
    body('email', 'Sertakan email yang valid').isEmail(),
    body('password', 'Password diperlukan').not().isEmpty(),
], authController.loginUser);

router.get('/verify-email', authController.verifyEmail);
router.get('/profile', protect, authController.getUserProfile);
router.put('/profile', protect, [ // <<< RUTE BARU UNTUK UPDATE PROFILE
    body('username').optional().not().isEmpty().withMessage('Username tidak boleh kosong jika disediakan.'),
    body('newPassword').optional().isLength({ min: 6 }).withMessage('Kata sandi baru minimal 6 karakter.'),
    body('currentPassword').optional().not().isEmpty().withMessage('Kata sandi saat ini diperlukan untuk mengubah kata sandi.'),
], authController.updateUserProfile);

router.post('/google-login', authController.googleLogin);

module.exports = router;