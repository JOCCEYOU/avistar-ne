const { Client } = require('pg');

async function checkOldDB() {
    const client = new Client({
        connectionString: 'postgresql://postgres.kwqnhaaklnsniualuquf:fraiderandres1234567890@aws-1-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true',
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const res = await client.query('SELECT COUNT(*) FROM sightings');
        console.log('Old DB Sightings Count:', res.rows[0].count);
        
        const resPending = await client.query("SELECT COUNT(*) FROM sightings WHERE status = 'pending'");
        console.log('Old DB Pending Sightings:', resPending.rows[0].count);
        
        const users = await client.query('SELECT COUNT(*) FROM users');
        console.log('Old DB Users Count:', users.rows[0].count);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

checkOldDB();
