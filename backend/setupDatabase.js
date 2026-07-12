require('dotenv').config();
const { Client } = require('pg');

async function setup() {
    console.log("Iniciando configuración de base de datos...");
    
    let appDb;
    if (process.env.DATABASE_URL) {
        console.log("Detectado DATABASE_URL. Conectando directamente a la base de datos remota...");
        appDb = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });
    } else {
        // Conectar a la base de datos por defecto 'postgres' para crear la nueva bd
        const client = new Client({
            user: 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            host: 'localhost',
            port: 5432,
            database: 'postgres'
        });

        try {
            await client.connect();
            console.log("Conectado a PostgreSQL (default). Verificando si avistarNE existe...");
            
            const res = await client.query(`SELECT datname FROM pg_catalog.pg_database WHERE datname = 'avistarNE'`);
            if (res.rowCount === 0) {
                console.log("Creando base de datos avistarNE...");
                await client.query(`CREATE DATABASE "avistarNE"`);
                console.log("Base de datos creada exitosamente.");
            } else {
                console.log("La base de datos avistarNE ya existe.");
            }
        } catch (err) {
            console.error("Error al crear la base de datos:", err.message);
        } finally {
            await client.end();
        }

        // Ahora conectar a 'avistarNE' para crear las tablas
        appDb = new Client({
            user: 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            host: 'localhost',
            port: 5432,
            database: 'avistarNE'
        });
    }

    try {
        await appDb.connect();
        console.log("Conectado a la base de datos. Creando tablas...");

        await appDb.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Tabla 'users' creada o ya existe.");

        // Crear tabla de sightings
        await appDb.query(`
            CREATE TABLE IF NOT EXISTS sightings (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                user_name VARCHAR(100),
                bird_name VARCHAR(100) NOT NULL,
                latitude DOUBLE PRECISION NOT NULL,
                longitude DOUBLE PRECISION NOT NULL,
                location_name VARCHAR(255),
                description TEXT,
                image_url VARCHAR(500),
                status VARCHAR(20) DEFAULT 'pending',
                ai_source VARCHAR(50),
                ai_confidence DOUBLE PRECISION,
                ai_raw_label VARCHAR(100),
                ai_status VARCHAR(50),
                sighted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Tabla 'sightings' creada o ya existe.");

        // Crear tabla de logros (achievements)
        await appDb.query(`
            CREATE TABLE IF NOT EXISTS achievements (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description VARCHAR(255) NOT NULL,
                icon VARCHAR(10) NOT NULL,
                color VARCHAR(20) NOT NULL,
                requirement_type VARCHAR(50) NOT NULL,
                requirement_value VARCHAR(100) NOT NULL
            );
        `);
        console.log("Tabla 'achievements' creada o ya existe.");

        // Crear tabla de logros de usuario (user_achievements)
        await appDb.query(`
            CREATE TABLE IF NOT EXISTS user_achievements (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                achievement_id VARCHAR(50) REFERENCES achievements(id) ON DELETE CASCADE,
                unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, achievement_id)
            );
        `);
        console.log("Tabla 'user_achievements' creada o ya existe.");

        // Poblar la tabla achievements con 30 semillas temáticas
        const achievementsSeed = [
            ['first_sighting', 'Observador Novato', 'Realizó su primer avistamiento aprobado.', '🔭', '#3b82f6', 'total_count', '1'],
            ['five_sightings', 'Descubridor de Especies', 'Contribuyó con 5 avistamientos aprobados.', '🌿', '#10b981', 'total_count', '5'],
            ['ten_sightings', 'Fotógrafo Experto', 'Un experto con 10 o más avistamientos.', '📷', '#f59e0b', 'total_count', '10'],
            ['cotorra_protector', 'Protector de la Cotorra', 'Reportó y ayudó a documentar la Cotorra Margariteña en peligro.', '🦜', '#ec4899', 'bird_name', 'Cotorra Margariteña'],
            ['mangrove_fan', 'Explorador de Manglares', 'Registró aves en ecosistemas de manglar.', '🌳', '#06b6d4', 'type', 'Manglares'],
            ['migradora_tracker', 'Rastreador de Migradoras', 'Registró aves migratorias de paso por la isla.', '✈️', '#8b5cf6', 'type', 'Migratoria'],
            ['restinga_sentinel', 'Guardián de La Restinga', 'Registró avistamientos en el P.N. Laguna de La Restinga.', '🚣', '#0284c7', 'type', 'Laguna de La Restinga'],
            ['copey_climber', 'Conquistador del Copey', 'Exploró y documentó especies en la selva nublada de Cerro El Copey.', '⛰️', '#15803d', 'type', 'Cerro El Copey'],
            ['macanao_ranger', 'Ránger de Macanao', 'Recorrió el ecosistema xerófilo de la Península de Macanao.', '🌵', '#d97706', 'type', 'Península de Macanao'],
            ['flamenco_watcher', 'Almirante del Flamenco', 'Fotografió y registró un Flamenco del Caribe en las salinas.', '🦩', '#f43f5e', 'bird_name', 'Flamenco'],
            ['ibis_collector', 'Coleccionista de Corocoras', 'Documentó la deslumbrante Corocora Roja en humedales.', '🪶', '#e11d48', 'bird_name', 'Corocora'],
            ['pelican_patrol', 'Patrullero de Pelícanos', 'Observó al Pelícano Pardo pescando en las costas margariteñas.', '🌊', '#0ea5e9', 'bird_name', 'Pelícano'],
            ['cardenal_seeker', 'Buscador del Cardenalito', 'Visualizó al Cardenal Coriano en los espinares.', '🔴', '#dc2626', 'bird_name', 'Cardenal'],
            ['turpial_master', 'Maestro del Turpial', 'Registró al Ave Nacional Turpial en su hábitat natural.', '🎶', '#eab308', 'bird_name', 'Turpial'],
            ['osprey_guardian', 'Ojo de Águila Pescadora', 'Documentó un ave rapaz cazando en aguas salobres.', '🦅', '#78350f', 'bird_name', 'Águila Pescadora'],
            ['colibri_whisperer', 'Susurrador de Colibríes', 'Fotografió al fugaz Colibrí Anteado o Esmeralda.', '🌸', '#a855f7', 'bird_name', 'Colibrí'],
            ['guacharaca_sound', 'Eco de la Guacharaca', 'Registró el emblemático canto de la Guacharaca culirroja.', '📢', '#b45309', 'bird_name', 'Guacharaca'],
            ['twenty_five_sightings', 'Naturalista Consagrado', 'Alcanzó los 25 avistamientos aprobados en la plataforma.', '🎖️', '#6366f1', 'total_count', '25'],
            ['fifty_sightings', 'Leyenda Ornitho-NE', 'Alcanzó la impresionante cifra de 50 avistamientos registrados.', '👑', '#eab308', 'total_count', '50'],
            ['night_owl', 'Vigía Nocturno', 'Documentó una lechuza o ave de hábitos crepusculares.', '🦉', '#475569', 'bird_name', 'Lechuza'],
            ['coastal_wader', 'Caminante de Salinas', 'Registró aves playeras y garzas en la franja intermareal.', '🏝️', '#06b6d4', 'type', 'Costeras'],
            ['interior_explorer', 'Explorador del Bosque Húmedo', 'Documentó aves de interior y montaña.', '🌲', '#166534', 'type', 'De Interior'],
            ['photo_master', 'Maestro de la Fotografía', 'Subió 15 avistamientos con fotografías nítidas y detalladas.', '📸', '#f97316', 'total_count', '15'],
            ['chick_protector', 'Guardián del Nido', 'Reportó avistamientos con información sobre reproducción y crías.', '🪹', '#84cc16', 'type', 'Nidificación'],
            ['pico_tijera', 'Señor de las Olas', 'Registró al singular Pico de Tijera rasgando el agua.', '✂️', '#0f766e', 'bird_name', 'Pico de Tijera'],
            ['zamuro_cleaner', 'Limpiador Ecológico', 'Documentó el rol vital del Zamuro en el ecosistema.', '🖤', '#334155', 'bird_name', 'Zamuro'],
            ['parakeet_chatter', 'Simpatía del Perico', 'Registró un grupo de Pericos Cara Sucia o Ñángaros.', '🦜', '#10b981', 'bird_name', 'Perico'],
            ['gaviota_breeze', 'Brisa del Golfo', 'Identificó Gaviotas Guanaguanare o Charranes en vuelo.', '🕊️', '#38bdf8', 'bird_name', 'Gaviota'],
            ['community_hero', 'Héroe de la Biodiversidad', 'Realizó reportes constantes validados por la comunidad.', '🌟', '#f59e0b', 'total_count', '30'],
            ['master_orotologia', 'Gran Ornitólogo de NE', 'El máximo galardón para los mayores defensores de la avifauna.', '🏆', '#eab308', 'total_count', '40'],
            ['trivia_king', 'Rey de la Trivia', 'Respondió correctamente todas las preguntas en una ronda de trivia.', '🧠', '#a855f7', 'trivia_score', '300']
        ];

        for (const [id, name, desc, icon, color, reqType, reqVal] of achievementsSeed) {
            await appDb.query(`
                INSERT INTO achievements (id, name, description, icon, color, requirement_type, requirement_value)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (id) DO UPDATE SET 
                    name = EXCLUDED.name, description = EXCLUDED.description, icon = EXCLUDED.icon,
                    color = EXCLUDED.color, requirement_type = EXCLUDED.requirement_type, requirement_value = EXCLUDED.requirement_value;
            `, [id, name, desc, icon, color, reqType, reqVal]);
        }
        console.log("Semillas de 30 logros inicializadas correctamente.");

        // Insertar usuario admin por defecto con contraseña hasheada
        const bcrypt = require('bcrypt');
        const adminEmail = 'admin@avistarne.com';
        
        const adminExists = await appDb.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
        
        if (adminExists.rowCount === 0) {
            const salt = await bcrypt.genSalt(10);
            const adminHash = await bcrypt.hash('kkloihh56Ab', salt);
            
            await appDb.query(`
                INSERT INTO users (name, email, password_hash, role) 
                VALUES ('Administrador', $1, $2, 'admin')
            `, [adminEmail, adminHash]);
            console.log("Usuario administrador creado (admin@avistarne.com / kkloihh56Ab).");
        } else {
            console.log("Usuario administrador ya existe.");
        }
    } catch (err) {
        console.error("Error al crear tablas:", err.message);
    } finally {
        await appDb.end();
        console.log("Configuración finalizada.");
    }
}

setup();
