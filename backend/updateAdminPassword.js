require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcrypt');

async function update() {
    console.log("Conectando...");
    const appDb = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    
    try {
        await appDb.connect();
        const salt = await bcrypt.genSalt(10);
        const adminHash = await bcrypt.hash('kkloihh56Ab', salt);
        await appDb.query(`UPDATE users SET password_hash = $1 WHERE email = 'admin@avistarne.com'`, [adminHash]);
        console.log("Contraseña de admin actualizada con éxito!");
    } catch (e) {
        console.error(e);
    } finally {
        await appDb.end();
    }
}
update();
