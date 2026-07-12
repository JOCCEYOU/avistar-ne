const app = require('./src/app');
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`\n=================================================`);
    console.log(`✅ Servidor backend corriendo en: http://localhost:${PORT}`);
    console.log(`🌐 Aplicación Frontend (Vite) en: http://localhost:3000/`);
    console.log(`=================================================\n`);
    console.log(`CTRL + C para detener el servidor.\n`);
});

// Cierre limpio para que nodemon libere el puerto antes de reiniciar
process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT',  () => server.close(() => process.exit(0)));

