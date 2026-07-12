const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public');

function walkDir(d) {
    const files = fs.readdirSync(d);
    for (const f of files) {
        const fullPath = path.join(d, f);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;
            
            // Reemplazar http://localhost:5000/api
            content = content.replace(/['"`]http:\/\/localhost:5000\/api(.*?)['"`]/g, "window.APP_CONFIG.API_URL + '$1'");
            
            // Reemplazar http://localhost:5000 (sin /api)
            content = content.replace(/['"`]http:\/\/localhost:5000(.*?)['"`]/g, "window.APP_CONFIG.BASE_URL + '$1'");

            // Casos especiales para template literals anidados
            // Ej: `http://localhost:5000${s.image_url}` -> window.APP_CONFIG.BASE_URL + `${s.image_url}`
            content = content.replace(/http:\/\/localhost:5000\$\{/g, "${window.APP_CONFIG.BASE_URL}${");
            
            // Limpieza de concatenaciones vacías tipo window.APP_CONFIG.API_URL + ''
            content = content.replace(/ \+ ''/g, "");

            if (content !== original) {
                fs.writeFileSync(fullPath, content);
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

walkDir(dir);
console.log('Terminado');
