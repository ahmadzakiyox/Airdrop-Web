// airdrop_tracker_backend_nodejs/controllers/airdropController.js
const Airdrop = require('../models/Airdrop');
const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');

exports.getAirdrops = async (req, res) => {
    try {
        // Jika user adalah admin, kembalikan semua airdrop. Jika bukan, kembalikan airdrop user itu saja.
        // Untuk admin, kita ingin populate user agar bisa menampilkan username di frontend
        const query = req.user.isAdmin ? {} : { user: req.user.id };
        const airdrops = await Airdrop.find(query)
                                    .populate('user', 'username email') // <<< TAMBAH POPULATE UNTUK ADMIN MELIHAT NAMA USER
                                    .sort({ createdAt: -1 });
        res.json(airdrops);
    } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
};

exports.getAirdropById = async (req, res) => {
    try {
        const airdrop = await Airdrop.findById(req.params.id);
        if (!airdrop) { return res.status(404).json({ message: 'Airdrop tidak ditemukan.' }); }
        // Admin bisa melihat airdrop siapapun
        if (airdrop.user.toString() !== req.user.id && !req.user.isAdmin) { return res.status(401).json({ message: 'Tidak diizinkan.' }); }
        res.json(airdrop);
    } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
};

exports.createAirdrop = async (req, res) => {
    const errors = validationResult(req); if (!errors.isEmpty()) { return res.status(400).json({ errors: errors.array() }); }
    const { name, description, link, blockchain, expectedValue, status, startDate, endDate, notes, tokenSymbol, contractAddress, claimDate, claimedAmount } = req.body;
    const screenshot = req.file ? `/uploads/screenshots/${req.file.filename}` : undefined;
    try {
        const newAirdrop = new Airdrop({ user: req.user.id, name, description, link, blockchain, expectedValue, status, startDate, endDate, notes, tokenSymbol, contractAddress, claimDate, claimedAmount, screenshot });
        const airdrop = await newAirdrop.save(); res.status(201).json(airdrop);
    } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
};

exports.updateAirdrop = async (req, res) => {
    const errors = validationResult(req); if (!errors.isEmpty()) { return res.status(400).json({ errors: errors.array() }); }
    const { name, description, link, blockchain, expectedValue, status, startDate, endDate, notes, tokenSymbol, contractAddress, claimDate, claimedAmount } = req.body;
    const screenshot = req.file ? `/uploads/screenshots/${req.file.filename}` : undefined;
    try {
        let airdrop = await Airdrop.findById(req.params.id);
        if (!airdrop) { return res.status(404).json({ message: 'Airdrop tidak ditemukan.' }); }
        // Admin bisa update airdrop siapapun
        if (airdrop.user.toString() !== req.user.id && !req.user.isAdmin) { return res.status(401).json({ message: 'Tidak diizinkan.' }); }

        if (screenshot && airdrop.screenshot) {
            const oldScreenshotPath = path.join(__dirname, '../', airdrop.screenshot);
            if (fs.existsSync(oldScreenshotPath)) { fs.unlinkSync(oldScreenshotPath); }
        }
        
        Object.assign(airdrop, { name, description, link, blockchain, expectedValue, status, startDate, endDate, notes, tokenSymbol, contractAddress, claimDate, claimedAmount });
        if (screenshot) airdrop.screenshot = screenshot;
        else if (req.body.clearScreenshot === 'true') airdrop.screenshot = undefined;

        await airdrop.save(); res.json(airdrop);
    } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
};

exports.deleteAirdrop = async (req, res) => {
    try {
        const airdrop = await Airdrop.findById(req.params.id);
        if (!airdrop) { return res.status(404).json({ message: 'Airdrop tidak ditemukan.' }); }
        // Admin bisa hapus airdrop siapapun
        if (airdrop.user.toString() !== req.user.id && !req.user.isAdmin) { return res.status(401).json({ message: 'Tidak diizinkan.' }); }
        if (airdrop.screenshot) {
            const screenshotPath = path.join(__dirname, '../', airdrop.screenshot);
            if (fs.existsSync(screenshotPath)) { fs.unlinkSync(screenshotPath); }
        }
        await airdrop.deleteOne(); res.json({ message: 'Airdrop berhasil dihapus.' });
    } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
};

exports.getAirdropStatusSummary = async (req, res) => {
    try {
        const summary = await Airdrop.aggregate([
            { $match: { user: req.user._id } },
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $project: { _id: 0, status: '$_id', count: 1 } }
        ]);
        const formattedSummary = {};
        Airdrop.schema.path('status').enumValues.forEach(status => formattedSummary[status] = 0);
        summary.forEach(item => formattedSummary[item.status] = item.count);
        res.json(formattedSummary);
    } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
};