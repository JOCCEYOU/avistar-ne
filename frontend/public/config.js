// Configuración global para Entornos de Avistar NE
window.APP_CONFIG = {
    // Si estás en producción, cambiaremos las URLs
    API_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:5000/api' 
        : 'https://avistar-ne.onrender.com/api', // <-- URL de Render
    BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:5000' 
        : 'https://avistar-ne.onrender.com'
};
