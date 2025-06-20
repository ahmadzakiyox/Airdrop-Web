// airdrop_tracker_backend_nodejs/utils/emailService.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10),
    secure: process.env.EMAIL_USE_TLS === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendVerificationEmail = async (email, username, verificationLink) => {
    const plainTextContent = `
Halo ${username},

Terima kasih telah mendaftar di Airdrop Tracker.
Silakan klik link di bawah ini untuk memverifikasi alamat email Anda:

${verificationLink}

Jika Anda tidak mendaftar untuk layanan ini, mohon abaikan email ini.

Terima kasih,
Tim Airdrop Tracker
`;

    const htmlContent = `
        <p>Halo <strong>${username}</strong>,</p>
        <p>Terima kasih telah mendaftar di Airdrop Tracker.</p>
        <p>Silakan klik tombol di bawah ini untuk memverifikasi alamat email Anda:</p>
        <p style="text-align: center; margin: 20px 0;">
            <a href="${verificationLink}" 
               style="display: inline-block; padding: 12px 25px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
               Verifikasi Email Saya
            </a>
        </p>
        <p>Atau salin dan tempel link ini di browser Anda:</p>
        <p><code><a href="${verificationLink}">${verificationLink}</a></code></p>
        <p>Jika Anda tidak mendaftar untuk layanan ini, mohon abaikan email ini.</p>
        <p>Terima kasih,<br>Tim Airdrop Tracker</p>
    `;

    const mailOptions = {
        from: `Airdrop Tracker <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verifikasi Email Anda untuk Airdrop Tracker',
        text: plainTextContent,
        html: htmlContent,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully!');
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Gagal mengirim email verifikasi. Pastikan konfigurasi email sudah benar.');
    }
};

module.exports = { sendVerificationEmail };