export class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        window.addEventListener('hashchange', () => this.handleRoute());
        window.addEventListener('load', () => this.handleRoute());
    }

    add(path, callback) {
        this.routes[path] = callback;
    }

    handleRoute() {
        let path = window.location.hash.slice(1) || '/';
        
        // Detener cualquier audio de ave activo al cambiar de ruta
        if (typeof window.stopActiveBirdAudio === 'function') {
            window.stopActiveBirdAudio();
        }

        // Match route with potential params like /sighting/123
        for (const routePath in this.routes) {
            const regexPath = routePath.replace(/:[^\s/]+/g, '([\\w-]+)');
            const match = path.match(new RegExp(`^${regexPath}$`));
            
            if (match) {
                this.currentRoute = routePath;
                // Extraer parámetros si existen
                const params = match.slice(1);
                this.routes[routePath](...params);
                return;
            }
        }

        // Default to root if no route matches
        if (this.routes['/']) {
            this.routes['/']();
        } else {
            console.error('No route defined for', path);
        }
    }

    navigate(path) {
        window.location.hash = path;
    }
}
