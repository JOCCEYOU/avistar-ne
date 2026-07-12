/**
 * Migración: Añadir campos de trazabilidad de IA a la tabla sightings
 * 
 * Nuevos campos:
 *   - ai_source       : Qué API resolvió la identificación ('huggingface', 'inaturalist', 'manual', null)
 *   - ai_confidence   : Porcentaje de confianza 0.00-100.00 (NUMERIC para precisión exacta)
 *   - ai_raw_label    : Etiqueta en inglés devuelta por la IA (para auditoría)
 *   - ai_status       : Estado del proceso IA ('identified', 'low_confidence', 'failed', 'skipped')
 * 
 * Ejecutar: node backend/src/migrations/add_ai_fields_to_sightings.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { Client } = require('pg');

async function migrate() {
    const client = new Client({
        host:     process.env.DB_HOST     || 'localhost',
        port:     process.env.DB_PORT     || 5432,
        database: process.env.DB_NAME     || 'avistarNE',
        user:     process.env.DB_USER     || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
    });

    try {
        await client.connect();
        console.log('✅ Conectado a la base de datos.');

        // Usamos ADD COLUMN IF NOT EXISTS (PostgreSQL 9.6+) para que sea idempotente
        await client.query(`
            ALTER TABLE sightings
                ADD COLUMN IF NOT EXISTS ai_source      VARCHAR(30)      DEFAULT NULL,
                ADD COLUMN IF NOT EXISTS ai_confidence  NUMERIC(5, 2)    DEFAULT NULL,
                ADD COLUMN IF NOT EXISTS ai_raw_label   VARCHAR(150)     DEFAULT NULL,
                ADD COLUMN IF NOT EXISTS ai_status      VARCHAR(20)      DEFAULT 'skipped';
        `);

        // Índice para consultas de auditoría y estadísticas por fuente de IA
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_sightings_ai_source
            ON sightings (ai_source);
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_sightings_ai_status
            ON sightings (ai_status);
        `);

        console.log('✅ Migración completada exitosamente.');
        console.log('   Columnas añadidas: ai_source, ai_confidence, ai_raw_label, ai_status');
        console.log('   Índices creados: idx_sightings_ai_source, idx_sightings_ai_status');
    } catch (err) {
        console.error('❌ Error en migración:', err.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

migrate();
