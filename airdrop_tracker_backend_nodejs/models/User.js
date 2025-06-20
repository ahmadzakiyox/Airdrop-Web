// airdrop_tracker_backend_nodejs/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    emailVerified: { type: Boolean, default: false },
    verificationToken: { type: String, default: null },
    googleId: { type: String, unique: true, sparse: true }, // <<< PENTING UNTUK LOGIN GOOGLE
    isAdmin: { type: Boolean, default: false },
    profilePicture: { type: String, default: null }, // <<< UNTUK FOTO PROFIL GOOGLE
    level: { type: Number, default: 1 },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: { type: Date, default: Date.now },
});

UserSchema.pre('save', async function (next) {
    if (this.isModified('password') && this.password) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};
module.exports = mongoose.model('User', UserSchema);