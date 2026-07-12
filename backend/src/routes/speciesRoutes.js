const express = require('express');
const router = express.Router();
const speciesController = require('../controllers/speciesController');

router.get('/audio', speciesController.getBirdAudio);
router.get('/', (req, res) => { res.json([]); });
router.get('/:id', (req, res) => { res.json({ message: 'Get species by id' }); });

module.exports = router;
