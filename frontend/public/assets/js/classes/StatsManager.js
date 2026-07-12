export class StatsManager {
    constructor(containerId) {
        this.containerId = containerId;
        this.data = null;
        this.animated = false;
        this.charts = {};
    }

    async fetchStats() {
        try {
            const response = await fetch('http://localhost:5000/api/stats');
            if (response.ok) {
                this.data = await response.json();
                localStorage.setItem('avistar_stats_backup', JSON.stringify(this.data));
            } else {
                throw new Error('Server returned ' + response.status);
            }
        } catch (error) {
            console.warn('Error fetching stats from server, trying local backup:', error);
            const localData = localStorage.getItem('avistar_stats_backup');
            if (localData) {
                try {
                    this.data = JSON.parse(localData);
                    console.log('Loaded stats from local backup.');
                } catch(e) {
                    console.error('Error parsing local stats backup:', e);
                }
            }
        }
    }

    async render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        let hasLocalData = false;
        
        // Intentar cargar datos locales primero (Stale-While-Revalidate)
        if (!this.data) {
            const localData = localStorage.getItem('avistar_stats_backup');
            if (localData) {
                try {
                    this.data = JSON.parse(localData);
                    hasLocalData = true;
                    this.renderContent(container);
                } catch(e) { }
            }
        }

        if (!hasLocalData) {
            container.innerHTML = '<div style="text-align:center; padding:2rem; color:var(--text-muted);">Cargando estadísticas...</div>';
        }

        // Fetch en segundo plano
        await this.fetchStats();

        if (!this.data) {
            if (!hasLocalData) {
                container.innerHTML = '<div style="text-align:center; padding:2rem; color:#ef4444;">Error al cargar estadísticas.</div>';
            }
            return;
        }

        // Re-renderizar con los datos frescos del servidor
        this.renderContent(container);
    }

    renderContent(container) {
        const isAdmin = window.authManager && window.authManager.isAdmin();

        container.innerHTML = `
            <div class="stats-export-buttons" style="display: flex; gap: 12px; justify-content: flex-end; margin-bottom: 1.5rem; flex-wrap: wrap;">
                <button id="btnExportCSV" class="btn btn-outline" style="display: flex; align-items: center; gap: 8px; font-weight: 600; padding: 0.6rem 1.2rem; border: 1px solid #10b981; background: transparent; color: #10b981; border-radius: 8px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(16,185,129,0.1)'" onmouseout="this.style.background='transparent'">
                    📥 Exportar CSV (Avistamientos)
                </button>
                <button id="btnExportPDF" class="btn btn-primary" style="display: flex; align-items: center; gap: 8px; font-weight: 600; padding: 0.6rem 1.2rem; background: var(--primary-color); border: none; color: #fff; border-radius: 8px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                    📄 Imprimir / Guardar PDF
                </button>
            </div>
            <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-bottom: 2rem;">
                <div class="stat-card glass-effect" data-stat="sightings" style="cursor: pointer; transition: transform 0.2s;" onclick="window.location.hash='#/actividad'" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                    <span class="stat-icon">🦅</span>
                    <span class="stat-number" data-target="${this.data.totalSightings}">0</span>
                    <span class="stat-label">Avistamientos Aprobados</span>
                    <small style="color: var(--primary-color); display:block; margin-top:5px; font-weight:bold;">Ver Avistamientos ➔</small>
                </div>
                
                <div class="stat-card glass-effect" data-stat="species" style="cursor: pointer; transition: transform 0.2s;" onclick="if(window.modalManager) window.modalManager.showSimpleBirdList()" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                    <span class="stat-icon">🐦</span>
                    <span class="stat-number" data-target="${this.data.totalSpecies}">0</span>
                    <span class="stat-label">Especies Nativas</span>
                    <a href="#/especies" style="text-decoration: none; color: var(--primary-color); display:block; margin-top:5px; font-weight:bold; position:relative; z-index:10;" onclick="event.stopPropagation();">Ver Bitácora ➔</a>
                </div>
 
                <div class="stat-card glass-effect" data-stat="zones" style="cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'" onclick="window.location.hash='#/dashboard'; setTimeout(() => { const sec = document.querySelector('.sanctuaries-section'); if(sec) { const y = sec.getBoundingClientRect().top + window.pageYOffset - 80; window.scrollTo({top: y, behavior: 'smooth'}); } }, 500);">
                    <span class="stat-icon">📍</span>
                    <span class="stat-number" data-target="${this.data.totalZones}">0</span>
                    <span class="stat-label">Zonas Registradas</span>
                    <small style="color: var(--primary-color); display:block; margin-top:5px; font-weight:bold;">Ver en Mapa ➔</small>
                </div>
                ${isAdmin ? `
                <div class="stat-card glass-effect" data-stat="users-total" onclick="window.location.hash='#/usuarios'" style="cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                    <span class="stat-icon">👥</span>
                    <span class="stat-number" data-target="${this.data.users.total}">0</span>
                    <span class="stat-label">Usuarios en Total</span>
                    <small style="color: var(--primary-color); display:block; margin-top:5px; font-weight:bold;">Ver Lista ➔</small>
                </div>
                ` : ''}
            </div>
 
            <!-- Sección de Gráficos Interactivos -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1.5rem; margin-top: 2rem;">
                <div class="stats-chart-card glass-effect" style="padding: 1.5rem; border-radius: 16px;">
                    <h3 class="stats-chart-title" style="margin-bottom: 1rem; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <span>📊</span> Especies Más Reportadas
                    </h3>
                    <div style="position: relative; height: 260px;">
                        <canvas id="chartBySpecies"></canvas>
                    </div>
                </div>
 
                <div class="stats-chart-card glass-effect" style="padding: 1.5rem; border-radius: 16px;">
                    <h3 class="stats-chart-title" style="margin-bottom: 1rem; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <span>📈</span> Avistamientos en el Tiempo
                    </h3>
                    <div style="position: relative; height: 260px;">
                        <canvas id="chartByTime"></canvas>
                    </div>
                </div>
 
                <div class="stats-chart-card glass-effect" style="padding: 1.5rem; border-radius: 16px;">
                    <h3 class="stats-chart-title" style="margin-bottom: 1rem; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <span>🏆</span> Top Avistadores Destacados
                    </h3>
                    <div style="position: relative; height: 260px;">
                        <canvas id="chartTopObservers"></canvas>
                    </div>
                </div>
            </div>
        `;
 
        this.animated = false;
        this.animate();
 
        // Configurar event listeners para los botones de exportación
        setTimeout(() => {
            const btnCSV = document.getElementById('btnExportCSV');
            if (btnCSV) {
                btnCSV.addEventListener('click', () => {
                    const token = localStorage.getItem('avistar_token');
                    const headers = {};
                    if (token) {
                        headers['Authorization'] = `Bearer ${token}`;
                    }
                    const url = 'http://localhost:5000/api/sightings/export';
                    fetch(url, { headers })
                        .then(response => {
                            if (response.ok) return response.blob();
                            throw new Error('Error al descargar el archivo');
                        })
                        .then(blob => {
                            const link = document.createElement('a');
                            link.href = window.URL.createObjectURL(blob);
                            link.download = 'avistamientos_avistar_ne.csv';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        })
                        .catch(err => {
                            console.error(err);
                            alert('No se pudo exportar a CSV: ' + err.message);
                        });
                });
            }
 
            const btnPDF = document.getElementById('btnExportPDF');
            if (btnPDF) {
                btnPDF.addEventListener('click', () => {
                    window.print();
                });
            }
        }, 50);
 
        // Renderizar los gráficos usando Chart.js
        setTimeout(() => this.renderCharts(), 100);
    }

    renderCharts() {
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js no está cargado');
            return;
        }

        // Destruir instancias previas si existen
        Object.values(this.charts).forEach(c => c && c.destroy());
        this.charts = {};

        const isLight = document.body.classList.contains('light-theme');
        const textColor = isLight ? '#334155' : '#cbd5e1';
        const gridColor = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';

        // 1. Gráfico por Especie (Barras horizontales)
        const ctxSpecies = document.getElementById('chartBySpecies');
        if (ctxSpecies) {
            const speciesData = this.data.bySpecies || [];
            const labels = speciesData.length > 0 ? speciesData.map(d => d.bird_name) : ['Cotorra Margariteña', 'Gonzalito', 'Guayamate', 'Turpial', 'Flamenco'];
            const values = speciesData.length > 0 ? speciesData.map(d => parseInt(d.count, 10)) : [12, 9, 7, 5, 4];

            this.charts.species = new Chart(ctxSpecies, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'Avistamientos',
                        data: values,
                        backgroundColor: 'rgba(16, 185, 129, 0.75)',
                        borderColor: '#10b981',
                        borderWidth: 1,
                        borderRadius: 6
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { ticks: { color: textColor, precision: 0 }, grid: { color: gridColor } },
                        y: { ticks: { color: textColor }, grid: { display: false } }
                    }
                }
            });
        }

        // 2. Gráfico en el Tiempo (Línea)
        const ctxTime = document.getElementById('chartByTime');
        if (ctxTime) {
            const timeData = this.data.byTime || [];
            const labels = timeData.length > 0 ? timeData.map(d => d.month) : ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
            const values = timeData.length > 0 ? timeData.map(d => parseInt(d.count, 10)) : [3, 7, 12, 18, 25, 30];

            this.charts.time = new Chart(ctxTime, {
                type: 'line',
                data: {
                    labels,
                    datasets: [{
                        label: 'Avistamientos',
                        data: values,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.15)',
                        fill: true,
                        tension: 0.3,
                        pointBackgroundColor: '#3b82f6',
                        pointRadius: 5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { ticks: { color: textColor }, grid: { color: gridColor } },
                        y: { ticks: { color: textColor, precision: 0 }, grid: { color: gridColor } }
                    }
                }
            });
        }

        // 3. Gráfico Top Avistadores (Doughnut)
        const ctxObservers = document.getElementById('chartTopObservers');
        if (ctxObservers) {
            const obsData = this.data.topObservers || [];
            const labels = obsData.length > 0 ? obsData.map(d => d.user_name) : ['Admin', 'Carlos R.', 'Maria G.'];
            const values = obsData.length > 0 ? obsData.map(d => parseInt(d.count, 10)) : [15, 8, 5];

            this.charts.observers = new Chart(ctxObservers, {
                type: 'doughnut',
                data: {
                    labels,
                    datasets: [{
                        data: values,
                        backgroundColor: [
                            'rgba(16, 185, 129, 0.8)',
                            'rgba(59, 130, 246, 0.8)',
                            'rgba(245, 158, 11, 0.8)',
                            'rgba(139, 92, 246, 0.8)',
                            'rgba(239, 68, 68, 0.8)'
                        ],
                        borderWidth: 2,
                        borderColor: 'rgba(15, 23, 42, 0.9)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'right', labels: { color: textColor, boxWidth: 12 } }
                    }
                }
            });
        }
    }

    animate() {
        if (this.animated) return;
        this.animated = true;

        const cards = document.querySelectorAll('.stat-card');
        cards.forEach(card => {
            const numberElement = card.querySelector('.stat-number');
            if (!numberElement) return;
            const target = parseInt(numberElement.dataset.target) || 0;
            const duration = 1500;
            const steps = 40;
            const increment = target / steps;
            let current = 0;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    numberElement.textContent = target;
                    clearInterval(timer);
                } else {
                    numberElement.textContent = Math.floor(current);
                }
            }, duration / steps);
        });
    }
}
