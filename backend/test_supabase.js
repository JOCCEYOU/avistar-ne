const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'c:/Users/Hewlett-Packard/Downloads/Telegram Desktop/avistar-ne/backend/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY);

async function testUpload() {
    const buffer = Buffer.from('test image content');
    const { data, error } = await supabase.storage
        .from('aves')
        .upload('test.jpg', buffer, {
            contentType: 'image/jpeg',
            upsert: false
        });

    if (error) {
        console.error('Upload Error:', error);
    } else {
        console.log('Upload Success:', data);
    }
}

testUpload();
