const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');

router.get('/me/achievements', requireAuth, userController.getUserAchievements);
router.post('/me/achievements/unlock', requireAuth, userController.unlockAchievement);
router.get('/', requireAuth, userController.getAllUsers);

router.get('/:id', (req, res) => { res.json({ message: 'Get user by id' }); });
router.put('/:id', (req, res) => { res.json({ message: 'Update user' }); });
router.delete('/:id', requireAuth, userController.deleteUser);

// Rutas de administración
router.put('/:id/suspend', requireAuth, userController.suspendUser);
router.put('/:id/activate', requireAuth, userController.activateUser);
router.put('/:id/make-admin', requireAuth, userController.makeAdmin);
router.put('/:id/revoke-admin', requireAuth, userController.revokeAdmin);

router.get('/:id/sightings', (req, res) => { res.json([]); });

module.exports = router;
