const db = require('../config/db');
const fs = require('fs');

exports.exportDatabase = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'No tienes permisos para realizar esta acción.' });
        }

        const usersResult = await db.query('SELECT * FROM users');
        const sightingsResult = await db.query('SELECT * FROM sightings');

        const backupData = {
            timestamp: new Date().toISOString(),
            users: usersResult.rows,
            sightings: sightingsResult.rows
        };

        res.setHeader('Content-disposition', 'attachment; filename=avistarNE_backup.json');
        res.setHeader('Content-type', 'application/json');
        res.status(200).send(JSON.stringify(backupData, null, 2));
    } catch (error) {
        console.error('Error exportando base de datos:', error);
        res.status(500).json({ message: 'Error exportando la base de datos', error: error.message });
    }
};

exports.importDatabase = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(403).json({ message: 'No tienes permisos para realizar esta acción.' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No se subió ningún archivo de respaldo.' });
        }

        const fileContent = fs.readFileSync(req.file.path, 'utf-8');
        const backupData = JSON.parse(fileContent);

        if (!backupData.users || !backupData.sightings) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'El archivo de respaldo no tiene el formato correcto.' });
        }

        await db.query('BEGIN');

        // Delete existing data to restore backup cleanly
        await db.query('DELETE FROM sightings');
        await db.query('DELETE FROM users');

        // Re-insert users
        for (const user of backupData.users) {
            await db.query(
                'INSERT INTO users (id, name, email, password_hash, role, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
                [user.id, user.name, user.email, user.password_hash, user.role, user.created_at]
            );
        }

        // Re-insert sightings
        for (const sighting of backupData.sightings) {
            await db.query(
                'INSERT INTO sightings (id, user_id, user_name, bird_name, latitude, longitude, location_name, description, image_url, status, sighted_at, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
                [sighting.id, sighting.user_id, sighting.user_name, sighting.bird_name, sighting.latitude, sighting.longitude, sighting.location_name, sighting.description, sighting.image_url, sighting.status, sighting.sighted_at, sighting.created_at]
            );
        }

        // Update sequences to max ID + 1 to avoid conflicts on future inserts
        await db.query(`SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1), true)`);
        await db.query(`SELECT setval('sightings_id_seq', COALESCE((SELECT MAX(id) FROM sightings), 1), true)`);

        await db.query('COMMIT');

        fs.unlinkSync(req.file.path);
        res.status(200).json({ message: 'Base de datos restaurada correctamente.' });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error('Error importando base de datos:', error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: 'Error importando la base de datos', error: error.message });
    }
};
