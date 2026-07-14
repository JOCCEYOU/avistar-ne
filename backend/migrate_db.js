require('dotenv').config({ path: 'c:/Users/Hewlett-Packard/Downloads/Telegram Desktop/avistar-ne/backend/.env' });
const { Client } = require('pg');

async function migrate() {
    const oldDb = new Client({
        connectionString: 'postgresql://postgres.kwqnhaaklnsniualuquf:fraiderandres1234567890@aws-1-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true',
        ssl: { rejectUnauthorized: false }
    });

    const newDb = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Conectando a las bases de datos...');
        await oldDb.connect();
        await newDb.connect();

        // 1. Migrar Usuarios
        console.log('Migrando usuarios...');
        const usersRes = await oldDb.query('SELECT * FROM users');
        for (const user of usersRes.rows) {
            await newDb.query(`
                INSERT INTO users (id, name, email, password_hash, role, created_at, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (email) DO UPDATE SET 
                    name = EXCLUDED.name, 
                    password_hash = EXCLUDED.password_hash, 
                    role = EXCLUDED.role, 
                    status = EXCLUDED.status,
                    created_at = EXCLUDED.created_at;
            `, [user.id, user.name, user.email, user.password_hash, user.role, user.created_at, user.status || 'active']);
        }
        
        // Ajustar secuencia de ID de usuarios
        await newDb.query(`SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))`);

        // 2. Migrar Avistamientos
        console.log('Migrando avistamientos...');
        const sightingsRes = await oldDb.query('SELECT * FROM sightings');
        for (const s of sightingsRes.rows) {
            // Verificar si existe antes para evitar duplicados en multiples ejecuciones
            const exists = await newDb.query('SELECT id FROM sightings WHERE id = $1', [s.id]);
            if (exists.rowCount === 0) {
                await newDb.query(`
                    INSERT INTO sightings (id, user_id, user_name, bird_name, latitude, longitude, location_name, description, image_url, imagenes, status, ai_source, ai_confidence, ai_raw_label, ai_status, sighted_at, created_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
                `, [s.id, s.user_id, s.user_name, s.bird_name, s.latitude, s.longitude, s.location_name, s.description, s.image_url, s.imagenes, s.status, s.ai_source, s.ai_confidence, s.ai_raw_label, s.ai_status, s.sighted_at, s.created_at]);
            }
        }
        await newDb.query(`SELECT setval('sightings_id_seq', (SELECT MAX(id) FROM sightings))`);

        // 3. Migrar Logros de Usuarios
        console.log('Migrando logros de usuarios...');
        const uaRes = await oldDb.query('SELECT * FROM user_achievements');
        for (const ua of uaRes.rows) {
            await newDb.query(`
                INSERT INTO user_achievements (user_id, achievement_id, unlocked_at)
                VALUES ($1, $2, $3)
                ON CONFLICT (user_id, achievement_id) DO NOTHING;
            `, [ua.user_id, ua.achievement_id, ua.unlocked_at]);
        }

        console.log('¡Migración completada con éxito!');
        console.log(`- ${usersRes.rowCount} usuarios`);
        console.log(`- ${sightingsRes.rowCount} avistamientos`);
        console.log(`- ${uaRes.rowCount} logros desbloqueados`);

    } catch (err) {
        console.error('Error durante la migración:', err.message);
    } finally {
        await oldDb.end();
        await newDb.end();
    }
}

migrate();
