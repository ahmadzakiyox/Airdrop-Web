// airdrop_tracker_backend_nodejs/models/Airdrop.js
const mongoose = require('mongoose');

const AirdropSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    link: { type: String, trim: true },
    blockchain: { type: String, trim: true },
    expectedValue: { type: Number },
    status: { type: String, enum: ['TODO', 'IN_PROGRESS', 'COMPLETED', 'CLAIMED', 'MISSED', 'RESEARCH'], default: 'TODO' },
    startDate: { type: Date },
    endDate: { type: Date },
    notes: { type: String, trim: true },
    tokenSymbol: { type: String, trim: true },
    contractAddress: { type: String, trim: true },
    claimDate: { type: Date },
    claimedAmount: { type: Number },
    screenshot: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
AirdropSchema.pre('save', function(next) { this.updatedAt = Date.now(); next(); });
module.exports = mongoose.model('Airdrop', AirdropSchema);