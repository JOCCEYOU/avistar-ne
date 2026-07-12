@echo off
echo ===================================================
echo        Iniciando el Sistema Avistar NE...
echo ===================================================
echo.

:: Matar procesos en los puertos 3000 y 5000 por si se quedaron pegados
echo Limpiando procesos en segundo plano...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| find "LISTENING"') do taskkill /f /pid %%a > NUL 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| find "LISTENING"') do taskkill /f /pid %%a > NUL 2>&1

:: Asegurar que las dependencias raíz estén instaladas
if not exist node_modules (
    echo Instalando dependencias principales (Concurrently)...
    call npm install
)

:: Asegurar que dependencias del backend estén instaladas
cd backend
if not exist node_modules (
    echo Instalando dependencias del Backend...
    call npm install
)
cd ..

:: Asegurar que dependencias del frontend estén instaladas
cd frontend
if not exist node_modules (
    echo Instalando dependencias del Frontend...
    call npm install
)
cd ..

echo.
echo ===================================================
echo Iniciando servidores (Backend y Frontend) en esta misma ventana...
echo Por favor, NO cierres esta ventana mientras uses el sistema.
echo Para detener todo de forma segura, presiona CTRL + C o cierra esta ventana.
echo ===================================================
echo.

:: Abre el navegador
start "" "http://localhost:3000/"

:: Ejecuta el proyecto usando concurrently
call npm run dev

pause
