const db = require('../config/db');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY);

// Helper: upload image to Supabase Storage, fallback to local disk if it fails
async function uploadImageWithFallback(file) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = (file.originalname.match(/\.[^.]+$/)?.[0] || '.jpg').toLowerCase();
    const fileName = 'bird-' + uniqueSuffix + ext;

    // Attempt Supabase upload first
    try {
        const { error } = await supabase.storage
            .from('aves')
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (!error) {
            const { data: publicUrlData } = supabase.storage
                .from('aves')
                .getPublicUrl(fileName);
            return publicUrlData.publicUrl;
        }
        console.warn('[Supabase] Upload failed, falling back to local storage. Error:', error.message);
    } catch (supabaseErr) {
        console.warn('[Supabase] Upload exception, falling back to local storage:', supabaseErr.message);
    }

    // Fallback: save to local /uploads directory
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    const localPath = path.join(uploadDir, fileName);
    fs.writeFileSync(localPath, file.buffer);
    return `/uploads/${fileName}`;
}

// Obtener todos los avistamientos (Admin los ve todos, usuarios ven los aprobados)
exports.getAllSightings = async (req, res) => {
    try {
        const isAdmin = req.user && req.user.role === 'admin';
        
        let query = `
            SELECT s.*, COALESCE(s.user_name, u.name, 'Observador Registrado') AS user_name 
            FROM sightings s
            LEFT JOIN users u ON s.user_id = u.id
            ORDER BY s.created_at DESC
        `;
        if (!isAdmin) {
            query = `
                SELECT s.*, COALESCE(s.user_name, u.name, 'Observador Registrado') AS user_name 
                FROM sightings s
                LEFT JOIN users u ON s.user_id = u.id
                WHERE s.status = 'approved' 
                ORDER BY s.created_at DESC
            `;
        }
        
        const result = await db.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener avistamientos:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Obtener avistamientos de un usuario específico
exports.getUserSightings = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user ? req.user.id : null;
        const isAdmin = req.user && req.user.role === 'admin';

        let query = 'SELECT * FROM sightings WHERE user_id = $1 ORDER BY created_at DESC';
        if (!isAdmin && String(currentUserId) !== String(userId)) {
            query = "SELECT * FROM sightings WHERE user_id = $1 AND status = 'approved' ORDER BY created_at DESC";
        }

        const result = await db.query(query, [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener avistamientos del usuario:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Crear un nuevo avistamiento
exports.createSighting = async (req, res) => {
    try {
        let { bird_name, latitude, longitude, location_name, description,
              ai_source, ai_confidence, ai_raw_label, ai_status } = req.body;
        
        if (location_name && location_name.length > 100) {
            return res.status(400).json({ message: 'El lugar de referencia no puede exceder los 100 caracteres' });
        }
        
        // Reemplazar comas por puntos (por problemas de localización del navegador)
        latitude = String(latitude).replace(',', '.');
        longitude = String(longitude).replace(',', '.');

        if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
            return res.status(400).json({ message: 'Ubicación GPS (latitud y longitud) requerida y debe ser válida' });
        }

        const user_id = req.user.id;
        const userResult = await db.query('SELECT name, status FROM users WHERE id = $1', [user_id]);
        
        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        if (userResult.rows[0].status === 'suspended') {
            return res.status(403).json({ message: 'Tu cuenta está suspendida. No puedes realizar reportes.' });
        }

        const user_name = userResult.rows[0].name;
        
        let image_url = null;
        let imagenes = [];
        
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const url = await uploadImageWithFallback(file);
                imagenes.push(url);
            }
            if (imagenes.length > 0) {
                image_url = imagenes[0];
            }
        }

        // Normalizar metadatos de IA
        const safeAiSource      = ai_source      || null;
        const safeAiConfidence  = ai_confidence  ? parseFloat(ai_confidence)  : null;
        const safeAiRawLabel    = ai_raw_label    || null;
        const safeAiStatus      = ai_status       || 'skipped';
        
        const newSighting = await db.query(`
            INSERT INTO sightings 
                (user_id, user_name, bird_name, latitude, longitude, location_name,
                 description, image_url, imagenes, status,
                 ai_source, ai_confidence, ai_raw_label, ai_status)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending',$10,$11,$12,$13)
            RETURNING *
        `, [user_id, user_name, bird_name, latitude, longitude, location_name,
            description, image_url, JSON.stringify(imagenes),
            safeAiSource, safeAiConfidence, safeAiRawLabel, safeAiStatus]);
        
        res.status(201).json(newSighting.rows[0]);
    } catch (error) {
        console.error('Error al crear avistamiento:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Aprobar avistamiento (Solo Admin)
exports.approveSighting = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        
        const { id } = req.params;
        const { bird_name } = req.body;
        
        let updated;
        if (bird_name) {
            updated = await db.query(`
                UPDATE sightings 
                SET status = 'approved', bird_name = $1 
                WHERE id = $2 
                RETURNING *
            `, [bird_name, id]);
        } else {
            updated = await db.query(`
                UPDATE sightings 
                SET status = 'approved' 
                WHERE id = $1 
                RETURNING *
            `, [id]);
        }
        
        if (updated.rowCount === 0) return res.status(404).json({ message: 'Avistamiento no encontrado' });
        
        const sighting = updated.rows[0];

        // Obtener email del usuario y evaluar logros desbloqueados
        if (sighting.user_id) {
            const newlyUnlocked = await checkAndGrantAchievements(sighting.user_id, sighting);
            
            const userRes = await db.query('SELECT email, name FROM users WHERE id = $1', [sighting.user_id]);
            if (userRes.rowCount > 0) {
                const user = userRes.rows[0];
                const mailer = require('../utils/mailer');
                mailer.sendApprovalEmail(user.email, user.name, sighting.bird_name, newlyUnlocked);
            }
        }
        
        res.json({ message: 'Avistamiento aprobado', sighting });
    } catch (error) {
        console.error('Error al aprobar avistamiento:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

async function checkAndGrantAchievements(userId, sighting = {}) {
    if (!userId) return [];
    try {
        const approvedRes = await db.query("SELECT * FROM sightings WHERE user_id = $1 AND status = 'approved'", [userId]);
        const totalApproved = approvedRes.rowCount;

        const allAchRes = await db.query("SELECT * FROM achievements");
        const userAchRes = await db.query("SELECT achievement_id FROM user_achievements WHERE user_id = $1", [userId]);
        const unlockedIds = new Set(userAchRes.rows.map(r => r.achievement_id));

        const newlyUnlocked = [];
        const birdName = (sighting.bird_name || '').toLowerCase();
        const locationName = (sighting.location_name || '').toLowerCase();
        const description = (sighting.description || '').toLowerCase();

        for (const ach of allAchRes.rows) {
            if (unlockedIds.has(ach.id)) continue;

            let isEligible = false;
            const reqVal = (ach.requirement_value || '').toLowerCase();

            if (ach.requirement_type === 'total_count') {
                const targetCount = parseInt(ach.requirement_value, 10);
                if (totalApproved >= targetCount) isEligible = true;
            } else if (ach.requirement_type === 'bird_name') {
                if (birdName.includes(reqVal) || description.includes(reqVal)) {
                    isEligible = true;
                }
            } else if (ach.requirement_type === 'type') {
                if (locationName.includes(reqVal) || description.includes(reqVal) || birdName.includes(reqVal)) {
                    isEligible = true;
                } else if (reqVal === 'manglares' && (description.includes('manglar') || locationName.includes('restinga'))) {
                    isEligible = true;
                } else if (reqVal === 'migratoria' && (description.includes('migra') || birdName.includes('playero') || birdName.includes('zarapito'))) {
                    isEligible = true;
                } else if (reqVal === 'costeras' && (description.includes('costa') || description.includes('playa') || locationName.includes('salina') || locationName.includes('restinga'))) {
                    isEligible = true;
                } else if (reqVal === 'de interior' && (description.includes('bosque') || description.includes('cerro') || locationName.includes('copey'))) {
                    isEligible = true;
                } else if (reqVal === 'nidificación' && (description.includes('nido') || description.includes('cría') || description.includes('huevo'))) {
                    isEligible = true;
                }
            }

            if (isEligible) {
                await db.query(`
                    INSERT INTO user_achievements (user_id, achievement_id) 
                    VALUES ($1, $2) ON CONFLICT (user_id, achievement_id) DO NOTHING
                `, [userId, ach.id]);
                newlyUnlocked.push(ach);
            }
        }
        return newlyUnlocked;
    } catch (err) {
        console.error('Error evaluando logros:', err);
        return [];
    }
}

// Rechazar avistamiento (Solo Admin)
exports.rejectSighting = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }
        
        const { id } = req.params;
        const updated = await db.query(`
            UPDATE sightings SET status = 'rejected' WHERE id = $1 RETURNING *
        `, [id]);
        
        if (updated.rowCount === 0) return res.status(404).json({ message: 'Avistamiento no encontrado' });
        
        res.json({ message: 'Avistamiento rechazado', sighting: updated.rows[0] });
    } catch (error) {
        console.error('Error al rechazar avistamiento:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Eliminar avistamiento (Admin o Creador)
exports.deleteSighting = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user.id;
        const isAdmin = req.user.role === 'admin';

        // Verificar si existe y si el usuario tiene permiso
        const sightingRes = await db.query('SELECT * FROM sightings WHERE id = $1', [id]);
        
        if (sightingRes.rowCount === 0) {
            return res.status(404).json({ message: 'Avistamiento no encontrado' });
        }

        const sighting = sightingRes.rows[0];

        // Solo los administradores pueden eliminar avistamientos por seguridad
        if (!isAdmin) {
            return res.status(403).json({ message: 'No tienes permiso para eliminar avistamientos. Solo los administradores pueden hacerlo.' });
        }

        await db.query('DELETE FROM sightings WHERE id = $1', [id]);
        
        res.json({ message: 'Avistamiento eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar avistamiento:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Editar avistamiento (Admin o Creador)
exports.updateSighting = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user.id;
        const isAdmin = req.user.role === 'admin';
        const { bird_name, description } = req.body;

        // Verificar si existe y si el usuario tiene permiso
        const sightingRes = await db.query('SELECT * FROM sightings WHERE id = $1', [id]);
        
        if (sightingRes.rowCount === 0) {
            return res.status(404).json({ message: 'Avistamiento no encontrado' });
        }

        const sighting = sightingRes.rows[0];

        // Solo los administradores pueden editar avistamientos por seguridad
        if (!isAdmin) {
            return res.status(403).json({ message: 'No tienes permiso para editar avistamientos. Solo los administradores pueden hacerlo.' });
        }

        // Actualizar solo nombre y descripcion, la ubicacion se mantiene (segun solicitud)
        const updated = await db.query(`
            UPDATE sightings 
            SET bird_name = COALESCE($1, bird_name),
                description = COALESCE($2, description)
            WHERE id = $3 
            RETURNING *
        `, [bird_name, description, id]);
        
        res.json({ message: 'Avistamiento actualizado exitosamente', sighting: updated.rows[0] });
    } catch (error) {
        console.error('Error al editar avistamiento:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// MAPA ENRIQUECIDO DE ESPECIES NATIVAS (NOMBRES CIENTÍFICOS Y PALABRAS CLAVE)
// ─────────────────────────────────────────────────────────────────────────────
const NATIVE_SPECIES_CATALOG = [
    { name: "Cotorra Margariteña", scientific: "Amazona barbadensis", keywords: ["amazona", "barbadensis", "yellow-shouldered", "cotorra", "parrot", "amazon"] },
    { name: "Gonzalito o Pespé margariteño", scientific: "Icterus nigrogularis", keywords: ["icterus nigrogularis", "yellow oriole", "gonzalito", "pespé"] },
    { name: "Guayamate o Cardenal Coriano", scientific: "Cardinalis phoeniceus", keywords: ["cardinalis phoeniceus", "vermilion cardinal", "guayamate", "cardenal"] },
    { name: "Cuclillo Canela", scientific: "Coccyzus melacoryphus", keywords: ["coccyzus melacoryphus", "dark-billed cuckoo", "cuclillo"] },
    { name: "Guacharaca culirroja", scientific: "Ortalis ruficauda", keywords: ["ortalis ruficauda", "chachalaca", "guacharaca"] },
    { name: "Turpial", scientific: "Icterus icterus", keywords: ["icterus icterus", "troupial", "turpial"] },
    { name: "Paraulata Llanera o Chulinga", scientific: "Mimus gilvus", keywords: ["mimus gilvus", "tropical mockingbird", "paraulata", "chulinga"] },
    { name: "Conoto Negro", scientific: "Psarocolius decumanus", keywords: ["psarocolius decumanus", "crested oropendola", "conoto"] },
    { name: "Pitirre chicharrero", scientific: "Tyrannus melancholicus", keywords: ["tyrannus melancholicus", "tropical kingbird", "pitirre"] },
    { name: "Potoca", scientific: "Columbina passerina", keywords: ["columbina passerina", "ground dove", "potoca"] },
    { name: "Chirito", scientific: "Polioptila plumbea", keywords: ["polioptila plumbea", "tropical gnatcatcher", "chirito"] },
    { name: "Corocora", scientific: "Eudocimus ruber", keywords: ["eudocimus ruber", "scarlet ibis", "corocora"] },
    { name: "Pavita", scientific: "Glaucidium", keywords: ["glaucidium", "pygmy owl", "pavita"] },
    { name: "Tijereta", scientific: "Fregata magnificens", keywords: ["fregata magnificens", "frigatebird", "tijereta"] },
    { name: "Angoleta", scientific: "Quiscalus lugubris", keywords: ["quiscalus lugubris", "carib grackle", "angoleta", "chiquia"] },
    { name: "Guacamaya", scientific: "Ara ararauna", keywords: ["ara ararauna", "ara macao", "macaw", "guacamaya"] },
    { name: "Becasa", scientific: "Scolopacidae", keywords: ["scolopacidae", "sandpiper", "becasa"] },
    { name: "Buzo", scientific: "Phalacrocorax brasilianus", keywords: ["phalacrocorax brasilianus", "neotropic cormorant", "buzo"] },
    { name: "Flamenco del Caribe", scientific: "Phoenicopterus ruber", keywords: ["phoenicopterus ruber", "american flamingo", "caribbean flamingo", "flamenco"] },
    { name: "Gallineta", scientific: "Porphyrio martinica", keywords: ["porphyrio martinica", "purple gallinule", "gallineta"] },
    { name: "Gallineta Plata", scientific: "Fulica americana", keywords: ["fulica americana", "american coot", "gallineta plata"] },
    { name: "Garcita Azul", scientific: "Egretta caerulea", keywords: ["egretta caerulea", "little blue heron", "garcita azul"] },
    { name: "Garcita Blanca", scientific: "Egretta thula", keywords: ["egretta thula", "snowy egret", "garcita blanca"] },
    { name: "Garza Morena", scientific: "Ardea herodias", keywords: ["ardea herodias", "great blue heron", "garza morena"] },
    { name: "Garza Real", scientific: "Ardea alba", keywords: ["ardea alba", "great egret", "garza real"] },
    { name: "Soldadito", scientific: "Himantopus mexicanus", keywords: ["himantopus mexicanus", "black-necked stilt", "soldadito"] },
    { name: "Águila Pescadora", scientific: "Pandion haliaetus", keywords: ["pandion haliaetus", "osprey", "águila pescadora"] },
    { name: "Pelícano Pardo", scientific: "Pelecanus occidentalis", keywords: ["pelecanus occidentalis", "brown pelican", "pelícano"] },
    { name: "Colibrí Anteado", scientific: "Leucippus fallax", keywords: ["leucippus fallax", "buffy hummingbird", "colibrí anteado"] },
    { name: "Espatula Rosada", scientific: "Platalea ajaja", keywords: ["platalea ajaja", "roseate spoonbill", "espatula rosada"] },
    { name: "Zarapito Trinador", scientific: "Numenius hudsonicus", keywords: ["numenius hudsonicus", "whimbrel", "zarapito"] },
    { name: "Agujeta Gris", scientific: "Limnodromus griseus", keywords: ["limnodromus griseus", "short-billed dowitcher", "agujeta gris"] },
    { name: "Charrán Común - Gaviotin", scientific: "Sterna hirundo", keywords: ["sterna hirundo", "common tern", "charrán", "gaviotin"] },
    { name: "Gaviota Guanaguanare", scientific: "Leucophaeus atricilla", keywords: ["leucophaeus atricilla", "laughing gull", "gaviota guanaguanare"] },
    { name: "Busardo Coliblanco-Gavilán Coliblanco", scientific: "Geranoaetus albicaudatus", keywords: ["geranoaetus albicaudatus", "white-tailed hawk", "gavilán coliblanco"] },
    { name: "Cotara - Rascón de Manglar", scientific: "Rallus longirostris", keywords: ["rallus longirostris", "clapper rail", "cotara"] },
    { name: "Guitío", scientific: "Synallaxis", keywords: ["synallaxis", "spinetail", "guitío"] },
    { name: "Caracara Carancho-Caricare", scientific: "Caracara plancus", keywords: ["caracara plancus", "crested caracara", "caricare", "carancho"] },
    { name: "Tijereta Sabanera", scientific: "Tyrannus savana", keywords: ["tyrannus savana", "fork-tailed flycatcher", "tijereta sabanera"] },
    { name: "Paloma Bravía", scientific: "Columba livia", keywords: ["columba livia", "rock pigeon", "paloma bravía"] },
    { name: "Esmeralda Coliazul", scientific: "Chlorostilbon mellisugus", keywords: ["chlorostilbon mellisugus", "blue-tailed emerald", "esmeralda coliazul"] },
    { name: "Garceta Tricolor-Garza Pechiblanca", scientific: "Egretta tricolor", keywords: ["egretta tricolor", "tricolored heron", "garceta tricolor"] },
    { name: "Lechuza de Campanario", scientific: "Tyto alba", keywords: ["tyto alba", "barn owl", "lechuza de campanario"] },
    { name: "Pecho Colorado", scientific: "Sturnella magna", keywords: ["sturnella magna", "eastern meadowlark", "pecho colorado"] },
    { name: "Perico Cara Sucia", scientific: "Eupsittula pertinax", keywords: ["eupsittula pertinax", "brown-throated parakeet", "perico cara sucia"] },
    { name: "Pico de Tijera", scientific: "Rynchops niger", keywords: ["rynchops niger", "black skimmer", "pico de tijera"] },
    { name: "Playero", scientific: "Calidris", keywords: ["calidris", "sandpiper", "playero"] },
    { name: "Zamuro", scientific: "Coragyps atratus", keywords: ["coragyps atratus", "black vulture", "zamuro"] },
    { name: "Cormorán Biguá-Cotua", scientific: "Nannopterum brasilianum", keywords: ["nannopterum brasilianum", "neotropic cormorant", "cotua"] },
    { name: "Tangara Azuleja-Azulejo de jardin", scientific: "Thraupis episcopus", keywords: ["thraupis episcopus", "blue-gray tanager", "azulejo"] },
    { name: "Carpintero Coronirrojo", scientific: "Melanerpes rubricapillus", keywords: ["melanerpes rubricapillus", "red-crowned woodpecker", "carpintero"] },
    { name: "Diamante Cebra", scientific: "Taeniopygia guttata", keywords: ["taeniopygia guttata", "zebra finch", "diamante cebra"] },
    { name: "Pato Negro", scientific: "Cairina moschata", keywords: ["cairina moschata", "muscovy duck", "pato negro"] },
    { name: "Semillero Pechirrufo", scientific: "Sporophila minuta", keywords: ["sporophila minuta", "ruddy-breasted seedeater", "semillero"] },
    { name: "Bienteveo Rayado-Atrapa Moscas", scientific: "Myiodynastes maculatus", keywords: ["myiodynastes maculatus", "streaked flycatcher", "bienteveo"] },
    { name: "Porrón Acollarado-Pato Collar", scientific: "Aythya collaris", keywords: ["aythya collaris", "ring-necked duck", "porrón"] },
    { name: "Varillero Capuchino-Turpial de Agua", scientific: "Chrysomus icterocephalus", keywords: ["chrysomus icterocephalus", "yellow-hooded blackbird", "varillero"] },
    { name: "Paloma Isleña", scientific: "Patagioenas squamosa", keywords: ["patagioenas squamosa", "scaly-naped pigeon", "paloma isleña"] },
    { name: "Añapero Ñacundá", scientific: "Chordeiles nacunda", keywords: ["chordeiles nacunda", "nacunda nighthawk", "añapero"] },
    { name: "Garza Chiflona", scientific: "Syrigma sibilatrix", keywords: ["syrigma sibilatrix", "whistling heron", "garza chiflona"] },
    { name: "Cardenilla Enmascarada", scientific: "Paroaria nigrogenis", keywords: ["paroaria nigrogenis", "masked cardinal", "cardenilla"] },
    { name: "Martinete Coronado", scientific: "Nyctanassa violacea", keywords: ["nyctanassa violacea", "yellow-crowned night-heron", "martinete"] },
    { name: "Reinita Amarilla", scientific: "Setophaga aestiva", keywords: ["setophaga aestiva", "yellow warbler", "reinita amarilla"] },
    { name: "Aguja Canela", scientific: "Limosa fedoa", keywords: ["limosa fedoa", "marbled godwit", "aguja canela"] },
    { name: "Garrapatero Asurcado-Tijereto", scientific: "Crotophaga sulcirostris", keywords: ["crotophaga sulcirostris", "groove-billed ani", "garrapatero"] },
    { name: "Playero Blanco", scientific: "Calidris alba", keywords: ["calidris alba", "sanderling", "playero blanco"] },
    { name: "Ñángaro", scientific: "Aratinga acuticaudata neoxena", keywords: ["aratinga acuticaudata", "blue-crowned parakeet", "ñángaro"] },
    { name: "Gavilán Habado", scientific: "Rupornis magnirostris", keywords: ["rupornis magnirostris", "roadside hawk", "gavilán habado"] }
];

function mapToLocalSpecies(label, scientificName = '') {
    if (!label && !scientificName) return null;

    const textToSearch = `${label || ''} ${scientificName || ''}`.toLowerCase();

    // 1. Coincidencia por Nombre Científico completo
    for (const item of NATIVE_SPECIES_CATALOG) {
        const sci = item.scientific.toLowerCase();
        if (textToSearch.includes(sci)) {
            return item.name;
        }
    }

    // 2. Coincidencia por Palabras Clave
    for (const item of NATIVE_SPECIES_CATALOG) {
        for (const kw of item.keywords) {
            if (textToSearch.includes(kw.toLowerCase())) {
                return item.name;
            }
        }
    }

    // 3. Coincidencia por Género científico
    for (const item of NATIVE_SPECIES_CATALOG) {
        const genus = item.scientific.toLowerCase().split(' ')[0];
        if (genus.length >= 5 && textToSearch.includes(genus)) {
            return item.name;
        }
    }

    return null;
}

// ─── API 1: iNaturalist Computer Vision ───────────────────────────────────────
async function classifyWithINaturalist(imageBuffer, mimeType) {
    const boundary = '----AvistarBoundary' + Date.now().toString(16);
    const CRLF = '\r\n';
    const headerPart = `--${boundary}${CRLF}Content-Disposition: form-data; name="image"; filename="bird.jpg"${CRLF}Content-Type: ${mimeType || 'image/jpeg'}${CRLF}${CRLF}`;
    const footerPart = `${CRLF}--${boundary}--${CRLF}`;
    const body = Buffer.concat([Buffer.from(headerPart), imageBuffer, Buffer.from(footerPart)]);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000); // 12s timeout

    let response;
    try {
        response = await fetch('https://api.inaturalist.org/v1/computervision/score_image', {
            method: 'POST',
            headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
            body,
            signal: controller.signal
        });
    } finally {
        clearTimeout(timer);
    }

    if (!response.ok) {
        const txt = await response.text();
        throw new Error(`iNaturalist HTTP ${response.status}: ${txt}`);
    }

    const data = await response.json();
    if (!data.results || data.results.length === 0) throw new Error('iNaturalist sin resultados');

    let localMatch = null;
    let bestResult = data.results[0];

    // Ampliar búsqueda a las primeras 15 predicciones
    for (const r of data.results.slice(0, 15)) {
        const commonName = r.taxon?.preferred_common_name || '';
        const sciName = r.taxon?.name || '';
        const matched = mapToLocalSpecies(commonName, sciName);
        if (matched) {
            localMatch = matched;
            bestResult = r;
            break;
        }
    }

    const commonName = bestResult.taxon?.preferred_common_name || bestResult.taxon?.name || 'Unknown Bird';
    const scientificName = bestResult.taxon?.name || '';
    let rawScore = bestResult.combined_score !== undefined ? bestResult.combined_score : (bestResult.vision_score * 100 || 50);
    const score = rawScore > 1 ? rawScore / 100 : rawScore;

    return {
        rawLabel: commonName + (scientificName ? ` (${scientificName})` : ''),
        score,
        localSpecies: localMatch,
        allPredictions: data.results.slice(0, 8).map(r => {
            const cn = r.taxon?.preferred_common_name || '';
            const sn = r.taxon?.name || '';
            return {
                label: cn ? `${cn} (${sn})` : sn,
                score: r.combined_score !== undefined ? (r.combined_score > 1 ? r.combined_score / 100 : r.combined_score) : 0,
                localSpecies: mapToLocalSpecies(cn, sn)
            };
        })
    };
}

// ─── API 2 & 3: Hugging Face (Modelos especializados en aves) ─────────────────
async function classifyWithHuggingFace(imageBuffer, modelId = 'edwinhung/bird_classifier') {
    const headers = { 'Content-Type': 'application/octet-stream' };
    if (process.env.HUGGINGFACE_TOKEN) {
        headers['Authorization'] = `Bearer ${process.env.HUGGINGFACE_TOKEN}`;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000); // 20s (HF puede cargar modelos)

    let response;
    try {
        response = await fetch(
            `https://api-inference.huggingface.co/models/${modelId}`,
            { method: 'POST', headers, body: imageBuffer, signal: controller.signal }
        );
    } finally {
        clearTimeout(timer);
    }

    if (!response.ok) {
        const txt = await response.text();
        throw new Error(`HuggingFace [${modelId}] HTTP ${response.status}: ${txt.slice(0, 120)}`);
    }

    const data = await response.json();
    // HF devuelve array o {error: ...} mientras el modelo carga
    if (data.error) throw new Error(`HF model loading: ${data.error}`);
    if (!Array.isArray(data) || data.length === 0) throw new Error('HuggingFace sin resultados');

    const best = data[0];
    return {
        rawLabel:       best.label,
        score:          best.score,
        localSpecies:   mapToLocalSpecies(best.label),
        allPredictions: data.slice(0, 8).map(p => ({
            label: p.label,
            score: p.score,
            localSpecies: mapToLocalSpecies(p.label)
        }))
    };
}

// ─── FLUJO EN CASCADA 3 PASOS ─────────────────────────────────────────────────
exports.classifyBird = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'Se requiere una imagen para clasificar' });

    const imageBuffer = req.file.buffer;
    let result   = null;
    let aiSource = null;
    let aiStatus = 'failed';
    let usedApi  = '';

    // ── PASO 1: iNaturalist ──────────────────────────────────────────────────
    console.log('[AI] Paso 1: iNaturalist...');
    try {
        const inat = await classifyWithINaturalist(imageBuffer, req.file.mimetype);
        console.log(`[AI] iNat → "${inat.rawLabel}" | local: "${inat.localSpecies}" | ${(inat.score*100).toFixed(1)}%`);

        if (inat.localSpecies && inat.score >= 0.10) {
            result = inat; aiSource = 'inaturalist'; aiStatus = 'identified'; usedApi = 'iNaturalist';
        } else if (inat.score >= 0.30) {
            result = inat; aiSource = 'inaturalist'; aiStatus = 'low_confidence'; usedApi = 'iNaturalist';
        }
    } catch (err) {
        console.warn('[AI] iNaturalist falló:', err.message);
    }

    // ── PASO 2: HuggingFace modelo primario (bird_classifier) ────────────────
    if (!result || !result.localSpecies) {
        console.log('[AI] Paso 2: HuggingFace bird_classifier...');
        try {
            const hf = await classifyWithHuggingFace(imageBuffer, 'edwinhung/bird_classifier');
            console.log(`[AI] HF-1 → "${hf.rawLabel}" | local: "${hf.localSpecies}" | ${(hf.score*100).toFixed(1)}%`);

            if (hf.localSpecies && hf.score >= 0.20) {
                result = hf; aiSource = 'huggingface'; aiStatus = 'identified'; usedApi = 'HF-BirdClassifier';
            } else if (hf.score >= 0.20 && !result) {
                result = hf; aiSource = 'huggingface'; aiStatus = 'low_confidence'; usedApi = 'HF-BirdClassifier';
            }
        } catch (err) {
            console.warn('[AI] HF-1 falló:', err.message);
        }
    }

    // ── PASO 3: HuggingFace modelo secundario (ViT general) ──────────────────
    if (!result || !result.localSpecies) {
        console.log('[AI] Paso 3: HuggingFace ViT-base...');
        try {
            const hf2 = await classifyWithHuggingFace(imageBuffer, 'google/vit-base-patch16-224');
            console.log(`[AI] HF-2 → "${hf2.rawLabel}" | local: "${hf2.localSpecies}" | ${(hf2.score*100).toFixed(1)}%`);

            if (hf2.localSpecies && hf2.score >= 0.15) {
                result = hf2; aiSource = 'huggingface_vit'; aiStatus = 'identified'; usedApi = 'HF-ViT';
            } else if (hf2.score >= 0.15 && !result) {
                result = hf2; aiSource = 'huggingface_vit'; aiStatus = 'low_confidence'; usedApi = 'HF-ViT';
            }
        } catch (err) {
            console.warn('[AI] HF-2 falló:', err.message);
        }
    }

    // ── PASO 4: Fallback graceful ─────────────────────────────────────────────
    if (!result) {
        console.log('[AI] Todos los modelos fallaron → Especie Desconocida');
        return res.json({
            aiSource: null, aiStatus: 'failed', aiConfidence: null,
            rawLabel: null, localSpecies: 'Especie Desconocida (para revisión)',
            isUnknown: true, bestSuggestion: null, predictions: [],
            message: 'No fue posible identificar el ave automáticamente. Será revisada por un experto.'
        });
    }

    const confidencePercent = parseFloat((result.score * 100).toFixed(2));
    console.log(`[AI] ✅ ${usedApi}: "${result.rawLabel}" (${confidencePercent}%) → "${result.localSpecies}"`);

    return res.json({
        aiSource,
        aiStatus,
        aiConfidence:    confidencePercent,
        rawLabel:        result.rawLabel,
        localSpecies:    result.localSpecies || 'Especie Desconocida (para revisión)',
        isUnknown:       !result.localSpecies,
        isLowConfidence: aiStatus === 'low_confidence',
        bestSuggestion:  { label: result.rawLabel, score: result.score, suggestedBird: result.localSpecies },
        predictions:     result.allPredictions || []
    });
};

// Exportar avistamientos a CSV
exports.exportSightings = async (req, res) => {
    try {
        const isAdmin = req.user && req.user.role === 'admin';
        let query = `
            SELECT s.id, s.bird_name, s.latitude, s.longitude, s.location_name, 
                   s.description, s.status, s.created_at,
                   COALESCE(s.user_name, u.name, 'Observador Registrado') AS observer_name,
                   u.email AS observer_email
            FROM sightings s
            LEFT JOIN users u ON s.user_id = u.id
            ORDER BY s.created_at DESC
        `;
        if (!isAdmin) {
            query = `
                SELECT s.id, s.bird_name, s.latitude, s.longitude, s.location_name, 
                       s.description, s.status, s.created_at,
                       COALESCE(s.user_name, u.name, 'Observador Registrado') AS observer_name
                FROM sightings s
                LEFT JOIN users u ON s.user_id = u.id
                WHERE s.status = 'approved'
                ORDER BY s.created_at DESC
            `;
        }
        
        const result = await db.query(query);
        const rows = result.rows;
        
        // Generar CSV
        let csvContent = '\ufeff'; // BOM para asegurar codificación UTF-8 en Excel
        const headers = isAdmin 
            ? ['ID', 'Ave', 'Latitud', 'Longitud', 'Lugar', 'Notas', 'Estado', 'Fecha', 'Observador', 'Email Observador']
            : ['ID', 'Ave', 'Latitud', 'Longitud', 'Lugar', 'Notas', 'Estado', 'Fecha', 'Observador'];
            
        csvContent += headers.join(';') + '\n';
        
        rows.forEach(row => {
            const dateStr = row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : '';
            const fields = [
                row.id,
                row.bird_name || 'Desconocido',
                row.latitude,
                row.longitude,
                row.location_name || '',
                row.description || '',
                row.status,
                dateStr,
                row.observer_name || ''
            ];
            if (isAdmin) {
                fields.push(row.observer_email || '');
            }
            
            // Sanitizar campos para evitar problemas con comillas y saltos de línea
            const sanitizedFields = fields.map(field => {
                if (field === null || field === undefined) return '""';
                let val = String(field).replace(/"/g, '""'); // escapar comillas dobles
                if (val.includes(';') || val.includes('\n') || val.includes('\r')) {
                    val = `"${val}"`; // envolver en comillas si tiene delimitadores
                }
                return val;
            });
            
            csvContent += sanitizedFields.join(';') + '\n';
        });
        
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=avistamientos_avistar_ne.csv');
        res.status(200).send(csvContent);
    } catch (error) {
        console.error('Error al exportar avistamientos:', error);
        res.status(500).json({ message: 'Error en el servidor al exportar datos' });
    }
};

exports._mapToLocalSpecies = mapToLocalSpecies;


