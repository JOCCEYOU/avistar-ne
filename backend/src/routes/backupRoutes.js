const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backupController');
const { requireAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Asegurar que existe el directorio de subidas temporales
const uploadDir = path.join(__dirname, '../../uploads/temp');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({ dest: uploadDir });

router.get('/export', requireAuth, backupController.exportDatabase);
router.post('/import', requireAuth, upload.single('backup'), backupController.importDatabase);

module.exports = router;
