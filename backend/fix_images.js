require('dotenv').config({ path: 'c:/Users/Hewlett-Packard/Downloads/Telegram Desktop/avistar-ne/backend/.env' });
const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY);

async function fixImages() {
    const db = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await db.connect();
        
        // Buscar avistamientos que tengan image_url apuntando a /uploads
        const res = await db.query("SELECT id, image_url FROM sightings WHERE image_url LIKE '/uploads/%'");
        console.log(`Encontrados ${res.rowCount} avistamientos con imagenes locales.`);

        for (const row of res.rows) {
            const filename = row.image_url.replace('/uploads/', '');
            const localPath = path.join(__dirname, 'uploads', filename);

            if (fs.existsSync(localPath)) {
                console.log(`Subiendo ${filename} a Supabase...`);
                const fileBuffer = fs.readFileSync(localPath);
                const contentType = mime.lookup(localPath) || 'image/jpeg';

                const { data, error } = await supabase.storage
                    .from('aves')
                    .upload(filename, fileBuffer, {
                        contentType: contentType,
                        upsert: true
                    });

                if (error) {
                    console.error(`Error al subir ${filename}:`, error.message);
                } else {
                    const publicUrl = supabase.storage.from('aves').getPublicUrl(filename).data.publicUrl;
                    
                    await db.query("UPDATE sightings SET image_url = $1 WHERE id = $2", [publicUrl, row.id]);
                    console.log(`Avistamiento ${row.id} actualizado con nueva URL: ${publicUrl}`);
                }
            } else {
                console.log(`Archivo no encontrado localmente: ${localPath}`);
            }
        }

        console.log("¡Proceso de restauración de imágenes terminado!");

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await db.end();
    }
}

fixImages();
