const db = require('../config/db');

exports.getStats = async (req, res) => {
    try {
        // Total de avistamientos aprobados
        const sightingsResult = await db.query("SELECT COUNT(*) FROM sightings WHERE status = 'approved'");
        const totalSightings = parseInt(sightingsResult.rows[0].count, 10);

        // Usuarios por rol
        const usersResult = await db.query("SELECT role, COUNT(*) FROM users GROUP BY role");
        
        let totalUsers = 0;
        let adminUsers = 0;
        let normalUsers = 0;

        usersResult.rows.forEach(row => {
            const count = parseInt(row.count, 10);
            totalUsers += count;
            if (row.role === 'admin') {
                adminUsers += count;
            } else {
                normalUsers += count;
            }
        });

        // Especies más reportadas (Top Especies)
        const speciesResult = await db.query(`
            SELECT bird_name, COUNT(*) as count 
            from sightings 
            WHERE status = 'approved' 
            GROUP BY bird_name 
            ORDER BY count DESC 
            LIMIT 8
        `);

        // Histórico de avistamientos por mes
        const timeSeriesResult = await db.query(`
            SELECT TO_CHAR(sighted_at, 'YYYY-MM') as month, COUNT(*) as count 
            FROM sightings 
            WHERE status = 'approved' 
            GROUP BY TO_CHAR(sighted_at, 'YYYY-MM') 
            ORDER BY month ASC 
            LIMIT 12
        `);

        // Avistamientos por zona / municipio
        const zoneResult = await db.query(`
            SELECT location_name, COUNT(*) as count 
            FROM sightings 
            WHERE status = 'approved' AND location_name IS NOT NULL AND TRIM(location_name) != ''
            GROUP BY location_name 
            ORDER BY count DESC 
            LIMIT 6
        `);

        // Top avistadores
        const topObserversResult = await db.query(`
            SELECT user_name, COUNT(*) as count 
            FROM sightings 
            WHERE status = 'approved' AND user_name IS NOT NULL 
            GROUP BY user_name 
            ORDER BY count DESC 
            LIMIT 5
        `);

        const totalSpecies = 70; // Total catálogo nativo real
        const totalZones = zoneResult.rowCount > 0 ? zoneResult.rowCount : 10;

        res.json({
            totalSightings,
            totalSpecies,
            totalZones,
            users: {
                total: totalUsers,
                admins: adminUsers,
                normal: normalUsers
            },
            bySpecies: speciesResult.rows,
            byTime: timeSeriesResult.rows,
            byZone: zoneResult.rows,
            topObservers: topObserversResult.rows
        });

    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({ message: 'Error en el servidor al obtener estadísticas' });
    }
};
