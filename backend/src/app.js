const express = require('express');
const cors = require('cors');
const path = require('path');
const compression = require('compression');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const sightingRoutes = require('./routes/sightingRoutes');
const speciesRoutes = require('./routes/speciesRoutes');
const userRoutes = require('./routes/userRoutes');
const statsRoutes = require('./routes/statsRoutes');
const backupRoutes = require('./routes/backupRoutes');

const app = express();

// Middlewares
app.use(compression());
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5500'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos subidos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/sightings', sightingRoutes);
app.use('/api/species', speciesRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/backup', backupRoutes);

// Ruta base
app.get('/', (req, res) => {
    res.json({ message: 'Bienvenido a la API de Avistar NE' });
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Error interno del servidor', error: err.message });
});

module.exports = app;
