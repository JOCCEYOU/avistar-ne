const { spawn, execSync } = require('child_process');
const path = require('path');
const os = require('os');

console.log("===================================================");
console.log("       Iniciando Sistema Avistar NE                ");
console.log("===================================================");

const isWindows = os.platform() === 'win32';

// 1. Limpieza de Puertos (Crucial para Windows cuando se cierra la terminal con la "X")
function killPortWindows(port) {
    try {
        const result = execSync(`netstat -ano | findstr :${port}`).toString();
        const lines = result.split('\n');
        const pids = new Set();
        
        lines.forEach(line => {
            const parts = line.trim().split(/\s+/);
            if (parts.length >= 5 && parts[1].includes(`:${port}`) && parts[3] === 'LISTENING') {
                const pid = parts[4];
                if (pid && pid !== '0') pids.add(pid);
            }
        });

        pids.forEach(pid => {
            try {
                execSync(`taskkill /F /PID ${pid} > NUL 2>&1`);
                console.log(`[LIMPIEZA] Se detuvo un proceso antiguo en el puerto ${port} (PID: ${pid}).`);
            } catch (e) {}
        });
    } catch (e) {
        // No hay procesos escuchando en ese puerto
    }
}

if (isWindows) {
    killPortWindows(5000);
    killPortWindows(3000);
}

const npmCmd = isWindows ? 'npm.cmd' : 'npm';

console.log("\n[1/2] Arrancando el Backend (Base de datos)...");
const backend = spawn(npmCmd, ['run', 'dev'], {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'pipe',
    shell: true
});

backend.stdout.on('data', (data) => {
    const msg = data.toString().trim();
    if (msg) console.log(`[BACKEND] ${msg}`);
});

backend.stderr.on('data', (data) => {
    const msg = data.toString().trim();
    if (msg && !msg.includes('Debugger attached')) console.error(`[BACKEND ERROR] ${msg}`);
});

console.log("[2/2] Arrancando el Frontend (Interfaz)...");
const frontend = spawn(npmCmd, ['run', 'dev'], {
    cwd: path.join(__dirname, 'frontend'),
    stdio: 'pipe',
    shell: true
});

let frontendReady = false;

frontend.stdout.on('data', (data) => {
    const msg = data.toString().trim();
    if (msg) console.log(`[FRONTEND] ${msg}`);
    
    if (!frontendReady && (msg.includes('ready in') || msg.includes('http://localhost:3000/'))) {
        frontendReady = true;
        console.log("\n===================================================");
        console.log("✅ SISTEMA LISTO Y FUNCIONANDO PERFECTAMENTE");
        console.log("👉 Entra desde tu navegador a: http://localhost:3000/");
        console.log("🛑 Para apagar el sistema, cierra esta ventana de terminal o presiona CTRL+C.");
        console.log("===================================================\n");
        
        // Opcional: Abrir el navegador automáticamente
        if (isWindows) {
            execSync('start http://localhost:3000/');
        }
    }
});

frontend.stderr.on('data', (data) => {
    const msg = data.toString().trim();
    if (msg) console.error(`[FRONTEND ERROR] ${msg}`);
});

// Si el usuario presiona CTRL+C
process.on('SIGINT', () => {
    console.log("\nApagando el sistema...");
    if (isWindows) {
        // En Windows, matar los procesos hijos lanzados con shell=true es complicado
        // La forma más segura es matarlos por puerto como hacemos al inicio, o matar todo el árbol.
        execSync(`taskkill /F /T /PID ${backend.pid} > NUL 2>&1`);
        execSync(`taskkill /F /T /PID ${frontend.pid} > NUL 2>&1`);
    } else {
        backend.kill('SIGINT');
        frontend.kill('SIGINT');
    }
    process.exit(0);
});
