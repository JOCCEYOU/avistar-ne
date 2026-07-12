const express = require('express');
const router = express.Router();
const sightingController = require('../controllers/sightingController');
const { optionalAuth, requireAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Asegurar que existe el directorio de subidas
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Rutas públicas / de lectura general
router.get('/', optionalAuth, sightingController.getAllSightings);
router.get('/user/:userId', optionalAuth, sightingController.getUserSightings);
router.get('/export', optionalAuth, sightingController.exportSightings);

// Rutas protegidas para usuarios (con subida de imagen)
router.post('/', requireAuth, upload.array('imagenes', 4), sightingController.createSighting);
router.post('/classify', requireAuth, upload.single('imagenes'), sightingController.classifyBird);
router.put('/:id', requireAuth, sightingController.updateSighting);

// Rutas exclusivas para admin
router.put('/:id/approve', requireAuth, sightingController.approveSighting);
router.put('/:id/reject', requireAuth, sightingController.rejectSighting);

// Ruta para eliminar avistamiento (Admin o creador)
router.delete('/:id', requireAuth, sightingController.deleteSighting);

module.exports = router;
