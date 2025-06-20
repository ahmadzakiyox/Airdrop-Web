// airdrop_tracker_backend_nodejs/controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { sendVerificationEmail } = require('../utils/emailService');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const path = require('path'); // <<< Pastikan ini ada
const fs = require('fs');     // <<< Pastikan ini ada

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_LIFETIME,
    });
};

// --- Fungsi Google Login ---
exports.googleLogin = async (req, res) => {
    const { code } = req.body; // Menerima authorization code dari frontend

    // Pastikan GOOGLE_CLIENT_ID dan GOOGLE_CLIENT_SECRET tersedia
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        console.error('Backend Google Login Error: GOOGLE_CLIENT_ID atau GOOGLE_CLIENT_SECRET tidak ditemukan di environment variables.');
        return res.status(500).json({ message: 'Server error: Konfigurasi Google OAuth tidak lengkap.' });
    }

    // --- PERBAIKAN FOKUS DI SINI ---
    // Inisialisasi OAuth2Client hanya dengan Client ID di constructor
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    // Set Client Secret dan Redirect URI secara eksplisit sebelum getToken()
    // 'postmessage' adalah redirect_uri standar untuk @react-oauth/google saat ux_mode="popup"
    client.setCredentials({
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        // client_id: process.env.GOOGLE_CLIENT_ID, // Tidak perlu set client_id di sini
        // refresh_token: '...', // Ini untuk refresh token, bukan untuk initial auth code exchange
    });
    // Penting: Set redirect_uri secara terpisah karena getToken() memerlukannya
    client.redirect_uri = 'postmessage'; // <<< PENTING: Set redirect_uri di sini

    console.log('Backend Google Login: Client ID yang akan digunakan:', client.clientId_); // Log internal property
    console.log('Backend Google Login: Client Secret yang akan digunakan:', client.credentials.client_secret ? '***** (loaded)' : 'Undefined/Not loaded');
    console.log('Backend Google Login: Redirect URI yang akan digunakan:', client.redirect_uri);
    // --- AKHIR PERBAIKAN ---

    try {
        // Tukar authorization code dengan access_token dan id_token dari Google
        // Method getToken() akan menggunakan credentials dan redirect_uri yang sudah disetel di client object
        const { tokens } = await client.getToken(code);
        const idToken = tokens.id_token;

        // Verifikasi ID token
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID, // Audience harus Client ID kita
        });
        const payload = ticket.getPayload(); // Mendapatkan data profil dari payload
        const { sub, email, name, picture } = payload; // sub adalah Google ID unik, picture adalah URL foto profil

        console.log('Backend Google Login: Payload dari Google:', { email, name, sub, picture });

        // Cari user di database kita berdasarkan email Google
        let user = await User.findOne({ email });

        if (!user) {
            // Jika user belum terdaftar, buat user baru
            console.log('Backend Google Login: User baru akan dibuat dari Google:', email);
            user = new User({
                username: name || email.split('@')[0], // Gunakan nama Google atau bagian email sebagai username
                email: email,
                password: crypto.randomBytes(16).toString('hex'), // Generate password acak aman
                googleId: sub, // Simpan Google ID unik dari Google
                profilePicture: picture || null, // Simpan URL foto profil dari Google
                emailVerified: true, // Email otomatis terverifikasi oleh Google
            });
            await user.save();
            console.log('Backend Google Login: User baru berhasil dibuat dari Google:', user.email);
        } else {
            // Jika user sudah terdaftar, update info jika perlu
            let userUpdated = false;
            if (!user.googleId) {
                user.googleId = sub;
                userUpdated = true;
            }
            if (!user.profilePicture && picture) { // Update foto profil jika belum ada
                user.profilePicture = picture;
                userUpdated = true;
            }
            if (!user.emailVerified) { // Pastikan emailVerified sudah true
                user.emailVerified = true;
                userUpdated = true;
            }
            if(userUpdated) await user.save(); // Simpan jika ada perubahan
            console.log('Backend Google Login: User ditemukan di DB:', user.email);
        }

        // Buat token JWT untuk sesi login aplikasi kita
        res.json({
            message: 'Login Google berhasil!',
            token: generateToken(user._id), // Buat token aplikasi
            user: { // Kirim data user yang relevan ke frontend
                id: user._id,
                username: user.username,
                email: user.email,
                emailVerified: user.emailVerified,
                isAdmin: user.isAdmin,
                profilePicture: user.profilePicture, // Kirim URL foto profil
                level: user.level,
            },
        });

    } catch (error) {
        console.error('Backend Google Login Error:', error.message);
        // Log respons error Google API yang lebih detail jika ada (misal: invalid_grant)
        if (error.response && error.response.data) {
            console.error('Google API Error Response:', error.response.data);
            return res.status(500).json({ message: `Login Google gagal: ${error.response.data.error_description || error.response.data.error || error.message}` });
        }
        res.status(500).json({ message: 'Login Google gagal. Coba lagi.' });
    }
};

// --- Fungsi Registrasi Normal ---
exports.registerUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;
    console.log('Backend Register: Attempt for:', { username, email });

    try {
        let user = await User.findOne({ email });
        if (user) {
            console.log('Backend Register: Email already registered:', email);
            return res.status(400).json({ message: 'Email sudah terdaftar.' });
        }
        user = await User.findOne({ username });
        if (user) {
            console.log('Backend Register: Username already taken:', username);
            return res.status(400).json({ message: 'Username sudah digunakan.' });
        }

        user = new User({ username, email, password });
        user.verificationToken = crypto.randomBytes(32).toString('hex');

        console.log('Backend Register: Token verifikasi yang akan disimpan (sebelum save):', user.verificationToken);

        await user.save();
        console.log('Backend Register: User berhasil disimpan. Token verifikasi yang *tersimpan* (dari objek user setelah save):', user.verificationToken);

        const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${user.verificationToken}&email=${user.email}`;
        console.log('Backend Register: Link verifikasi yang dihasilkan:', verificationLink);

        try {
            await sendVerificationEmail(user.email, user.username, verificationLink);
            console.log('Backend Register: Email verifikasi berhasil dikirim ke:', user.email);
            res.status(201).json({ message: 'Registrasi berhasil! Silakan cek email Anda untuk verifikasi.' });
        } catch (emailError) {
            console.error("Backend Register: Gagal mengirim email verifikasi setelah user registration:", emailError);
            await User.deleteOne({ _id: user._id });
            return res.status(500).json({ message: 'Registrasi berhasil, tetapi gagal mengirim email verifikasi. Coba lagi atau hubungi admin.' });
        }
    } catch (err) {
        console.error('Backend Register: Error selama registrasi user:', err.message);
        console.error(err);
        res.status(500).send('Server Error: Gagal memproses registrasi.');
    }
};

// --- Fungsi Login Normal ---
exports.loginUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Email atau password salah.' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Email atau password salah.' });
        }

        if (!user.emailVerified) {
            return res.status(403).json({ message: 'Akun Anda belum diverifikasi. Silakan cek email Anda untuk verifikasi.' });
        }

        res.json({
            message: 'Login berhasil!',
            token: generateToken(user._id),
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                emailVerified: user.emailVerified,
                isAdmin: user.isAdmin,
            },
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// --- Fungsi Verifikasi Email ---
exports.verifyEmail = async (req, res) => {
    const { token, email } = req.query;
    const trimmedToken = token ? String(token).trim() : null;
    const trimmedEmail = email ? String(email).trim() : null;

    console.log('Backend Verify: Menerima permintaan verifikasi untuk email (trimmed):', trimmedEmail, 'dengan token (trimmed):', trimmedToken);
    try {
        let user = await User.findOne({ email: trimmedEmail });

        if (!user) {
            console.log('Backend Verify: Pengguna tidak ditemukan dengan email:', trimmedEmail);
            return res.status(400).json({ message: 'Email tidak terdaftar atau link verifikasi tidak valid.' });
        }

        if (user.emailVerified) {
            console.log('Backend Verify: Email sudah diverifikasi untuk user:', user.email);
            return res.status(200).json({ message: 'Email Anda sudah terverifikasi sebelumnya!' });
        }

        if (user.verificationToken !== trimmedToken) {
            console.log('Backend Verify: Token tidak cocok untuk user:', user.email);
            console.log('Backend Verify: Token dari DB:', user.verificationToken);
            console.log('Backend Verify: Token dari URL:', trimmedToken);
            return res.status(400).json({ message: 'Tautan verifikasi tidak valid atau sudah kedaluwarsa.' });
        }

        user.emailVerified = true;
        user.verificationToken = undefined;
        await user.save();

        console.log('Backend Verify: Email berhasil diverifikasi untuk:', user.email);
        res.status(200).json({ message: 'Email berhasil diverifikasi!' });

    } catch (err) {
        console.error('Backend Verify: Error selama verifikasi email:', err.message);
        console.error(err);
        res.status(500).send('Server Error: Gagal verifikasi email.');
    }
};

// --- Fungsi Update Profil Pengguna ---
exports.updateUserProfile = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, currentPassword, newPassword, clearProfilePicture } = req.body;
    const userId = req.user.id;
    const profilePictureFile = req.files && req.files.profilePicture;

    console.log('Backend Profile Update: Permintaan diterima untuk user ID:', userId);
    console.log('Backend Profile Update: Data body (termasuk non-file):', req.body);
    console.log('Backend Profile Update: File yang diterima (req.files.profilePicture):', profilePictureFile ? profilePictureFile.name : 'Tidak ada');


    try {
        const user = await User.findById(userId);

        if (!user) {
            console.log('Backend Profile Update: User tidak ditemukan untuk ID:', userId);
            return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
        }
        console.log('Backend Profile Update: User ditemukan:', user.username);

        // Update Username
        if (typeof username !== 'undefined' && username !== user.username) {
            const existingUserWithUsername = await User.findOne({ username });
            if (existingUserWithUsername && String(existingUserWithUsername._id) !== String(userId)) {
                return res.status(400).json({ message: 'Username sudah digunakan.' });
            }
            user.username = username;
            console.log('Backend Profile Update: Username akan diupdate menjadi:', username);
        }

        // Update Password
        if (newPassword !== undefined && newPassword !== '') {
            if (!currentPassword) {
                console.log('Backend Profile Update: New password provided, but current password is missing.');
                return res.status(400).json({ message: 'Kata sandi saat ini diperlukan untuk mengubah kata sandi.' });
            }
            const isMatch = await user.matchPassword(currentPassword);
            if (!isMatch) {
                return res.status(400).json({ message: 'Kata sandi saat ini salah.' });
            }
            user.password = newPassword;
            console.log('Backend Profile Update: Password akan diupdate.');
        }

        // --- Handle Profile Picture Upload ---
        if (profilePictureFile) {
            const uploadDir = path.join(__dirname, '../uploads/profile_pictures');
            console.log('Backend Profile Update: File foto profil diterima:', profilePictureFile.name);
            console.log('Backend Profile Update: Direktori upload:', uploadDir);

            if (!fs.existsSync(uploadDir)) {
                console.log('Backend Profile Update: Membuat direktori upload:', uploadDir);
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const fileName = `${Date.now()}-${profilePictureFile.name}`;
            const uploadPath = path.join(uploadDir, fileName);

            console.log('Backend Profile Update: Memindahkan file ke:', uploadPath);
            await profilePictureFile.mv(uploadPath)
                .then(() => {
                    console.log('Backend Profile Update: File berhasil dipindahkan.');
                })
                .catch(err => {
                    console.error('Backend Profile Update: GAGAL MEMINDAHKAN FILE:', err);
                    throw new Error('Gagal memindahkan file foto profil.');
                });

            // Hapus foto profil lama jika ada
            if (user.profilePicture) {
                const oldProfilePicturePath = path.join(__dirname, '../', user.profilePicture);
                console.log('Backend Profile Update: Menghapus foto profil lama:', oldProfilePicturePath);
                if (fs.existsSync(oldProfilePicturePath)) {
                    fs.unlinkSync(oldProfilePicturePath);
                    console.log('Backend Profile Update: Foto profil lama berhasil dihapus.');
                } else {
                    console.log('Backend Profile Update: Foto profil lama tidak ditemukan di path, tidak dihapus.');
                }
            }
            user.profilePicture = `/uploads/profile_pictures/${fileName}`; // Simpan path baru
            console.log('Backend Profile Update: Path foto profil baru disetel:', user.profilePicture);

        } else if (clearProfilePicture === 'true') {
            console.log('Backend Profile Update: Permintaan untuk menghapus foto profil.');
            if (user.profilePicture) {
                const oldProfilePicturePath = path.join(__dirname, '../', user.profilePicture);
                console.log('Backend Profile Update: Menghapus foto profil lama karena permintaan hapus:', oldProfilePicturePath);
                if (fs.existsSync(oldProfilePicturePath)) {
                    fs.unlinkSync(oldProfilePicturePath);
                    console.log('Backend Profile Update: Foto profil lama berhasil dihapus karena permintaan hapus.');
                } else {
                    console.log('Backend Profile Update: Foto profil lama tidak ditemukan di path, tidak dihapus karena permintaan hapus.');
                }
            }
            user.profilePicture = null;
            console.log('Backend Profile Update: Path foto profil di DB disetel ke null.');
        } else {
            console.log('Backend Profile Update: Tidak ada file foto profil baru diupload dan tidak ada permintaan hapus.');
        }

        console.log('Backend Profile Update: Menyimpan perubahan user ke database.');
        await user.save();
        console.log('Backend Profile Update: Perubahan user berhasil disimpan ke database.');

        // --- PERBAIKAN KRITIS DI SINI: Pastikan kita mengirim user object yang benar ---
        // PENTING: Jangan gunakan findById lagi. Cukup gunakan user object yang sudah di-save dan hapus passwordnya.
        const userToRespond = user.toObject(); // Konversi ke objek JS biasa
        delete userToRespond.password; // Hapus password sebelum dikirim ke frontend

        console.log('Backend Profile Update: User terbaru diambil untuk respons (setelah save):', userToRespond.profilePicture); // Log ini harus menampilkan path foto jika ada

        res.status(200).json({
            message: 'Profil berhasil diperbarui!',
            user: {
                id: userToRespond._id,
                username: userToRespond.username,
                email: userToRespond.email,
                emailVerified: userToRespond.emailVerified,
                isAdmin: userToRespond.isAdmin,
                profilePicture: userToRespond.profilePicture, // Ini harus berisi path yang benar
                level: userToRespond.level,
            }
        });

    } catch (err) {
        console.error('Backend Update Profile Error:', err.message);
        console.error(err);
        res.status(500).send('Server Error: Gagal memperbarui profil.');
    }
};

// --- Fungsi Get User Profile ---
exports.getUserProfile = async (req, res) => {
    const user = req.user;
    res.json({
        id: user._id,
        username: user.username,
        email: user.email,
        emailVerified: user.emailVerified,
        isAdmin: user.isAdmin,
        profilePicture: user.profilePicture, // <<< SERTAKAN URL FOTO
        level: user.level, // <<< SERTAKAN LEVEL
    });
};