const fs = require('fs');
const { Client } = require('pg');
require('dotenv').config();

async function restore() {
    console.log("Iniciando restauración de base de datos...");
    
    const client = new Client({
        user: 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        host: 'localhost',
        port: 5432,
        database: 'avistarNE'
    });

    try {
        await client.connect();
        console.log("Conectado a avistarNE. Leyendo archivo SQL...");
        
        const sql = fs.readFileSync('../backup_avistarNE.sql', 'utf8');
        
        console.log("Ejecutando SQL...");
        await client.query(sql);
        console.log("Restauración completada con éxito.");
    } catch (err) {
        console.error("Error al restaurar:", err.message);
    } finally {
        await client.end();
    }
}

restore();
