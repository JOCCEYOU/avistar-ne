require('dotenv').config({ path: 'c:/Users/Hewlett-Packard/Downloads/Telegram Desktop/avistar-ne/backend/.env' });
const { Client } = require('pg');

async function testDB() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const res = await client.query('SELECT NOW()');
        console.log('Database Connection Success:', res.rows[0]);
    } catch (err) {
        console.error('Database Connection Error:', err.message);
    } finally {
        await client.end();
    }
}

testDB();
