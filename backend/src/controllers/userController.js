const db = require('../config/db');

exports.getAllUsers = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        
        const result = await db.query('SELECT id, name, email, role, status, created_at FROM users ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

exports.getUserAchievements = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const result = await db.query(`
            SELECT 
                a.id, 
                a.name, 
                a.description, 
                a.icon, 
                a.color, 
                a.requirement_type, 
                a.requirement_value,
                ua.unlocked_at,
                (ua.id IS NOT NULL) as is_unlocked
            FROM achievements a
            LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = $1
            ORDER BY a.id ASC
        `, [userId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener logros del usuario:', error);
        res.status(500).json({ message: 'Error en el servidor al obtener logros' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Acceso denegado' });
        const { id } = req.params;
        if (id === '1') return res.status(403).json({ message: 'No se puede eliminar al super administrador' });
        await db.query('DELETE FROM users WHERE id = $1', [id]);
        res.json({ message: 'Usuario eliminado' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

exports.suspendUser = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Acceso denegado' });
        const { id } = req.params;
        if (id === '1') return res.status(403).json({ message: 'No se puede suspender al super administrador' });
        await db.query('UPDATE users SET status = $1 WHERE id = $2', ['suspended', id]);
        res.json({ message: 'Usuario suspendido' });
    } catch (error) {
        console.error('Error al suspender usuario:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

exports.activateUser = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Acceso denegado' });
        const { id } = req.params;
        if (id === '1') return res.status(403).json({ message: 'No se puede modificar al super administrador' });
        await db.query('UPDATE users SET status = $1 WHERE id = $2', ['active', id]);
        res.json({ message: 'Usuario activado' });
    } catch (error) {
        console.error('Error al activar usuario:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

exports.makeAdmin = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Acceso denegado' });
        const { id } = req.params;
        if (id === '1') return res.status(403).json({ message: 'El super administrador ya es administrador' });
        await db.query('UPDATE users SET role = $1 WHERE id = $2', ['admin', id]);
        res.json({ message: 'Usuario ahora es administrador' });
    } catch (error) {
        console.error('Error al hacer administrador:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

exports.revokeAdmin = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Acceso denegado' });
        const { id } = req.params;
        if (id === '1') return res.status(403).json({ message: 'No se le pueden revocar los permisos al super administrador' });
        await db.query('UPDATE users SET role = $1 WHERE id = $2', ['user', id]);
        res.json({ message: 'Permisos de administrador revocados' });
    } catch (error) {
        console.error('Error al revocar administrador:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

exports.unlockAchievement = async (req, res) => {
    try {
        const userId = req.user.id;
        const { achievementId } = req.body;

        if (!achievementId) {
            return res.status(400).json({ message: 'Falta el ID del logro' });
        }

        // Verificar si el logro existe
        const achRes = await db.query('SELECT * FROM achievements WHERE id = $1', [achievementId]);
        if (achRes.rowCount === 0) {
            return res.status(404).json({ message: 'Logro no encontrado' });
        }
        const achievement = achRes.rows[0];

        // Verificar si el usuario ya tiene el logro
        const userAchRes = await db.query(
            'SELECT id FROM user_achievements WHERE user_id = $1 AND achievement_id = $2',
            [userId, achievementId]
        );

        if (userAchRes.rowCount > 0) {
            return res.json({ message: 'Logro ya desbloqueado', alreadyUnlocked: true, achievement });
        }

        // Otorgar el logro
        await db.query(
            'INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [userId, achievementId]
        );

        res.json({
            message: `¡Logro desbloqueado!: ${achievement.name}`,
            newlyUnlocked: true,
            achievement
        });
    } catch (error) {
        console.error('Error al desbloquear logro:', error);
        res.status(500).json({ message: 'Error en el servidor al desbloquear logro' });
    }
};
