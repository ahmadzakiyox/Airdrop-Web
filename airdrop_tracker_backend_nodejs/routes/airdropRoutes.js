// airdrop_tracker_backend_nodejs/routes/airdropRoutes.js
const fs = require('fs');
const express = require('express');
const { body } = require('express-validator');
const airdropController = require('../controllers/airdropController');
const protect = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/screenshots');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

router.get('/', protect, airdropController.getAirdrops);
router.get('/summary', protect, airdropController.getAirdropStatusSummary);
router.get('/:id', protect, airdropController.getAirdropById);

router.post('/', protect, upload.single('screenshot'), [
    body('name', 'Nama airdrop diperlukan').not().isEmpty(),
    body('status', 'Status airdrop diperlukan').isIn(['TODO', 'IN_PROGRESS', 'COMPLETED', 'CLAIMED', 'MISSED', 'RESEARCH']),
], airdropController.createAirdrop);

router.put('/:id', protect, upload.single('screenshot'), [
    body('name', 'Nama airdrop diperlukan').optional().not().isEmpty(),
    body('status', 'Status airdrop harus valid').optional().isIn(['TODO', 'IN_PROGRESS', 'COMPLETED', 'CLAIMED', 'MISSED', 'RESEARCH']),
], airdropController.updateAirdrop);

router.delete('/:id', protect, airdropController.deleteAirdrop);

module.exports = router;