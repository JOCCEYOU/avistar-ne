export class MapManager {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.map = null;
        this.markers = [];
        this.heatmapLayers = [];   // capas temporales por ave (círculos, rutas, L.heatLayer)
        this.center = options.center || [10.9833, -63.9167];
        this.zoom = options.zoom || 10;
        this.initialized = false;
        this.birdHeatLayer = null; // heat layer individual del ave activa
    }

    init() {
        if (this.initialized) return;
        const container = document.getElementById(this.containerId);
        if (!container) return;
        if (typeof L === 'undefined') { console.error('Leaflet no está cargado'); return; }

        const margaritaBounds = [[10.74, -64.45], [11.20, -63.75]];
        this.map = L.map(this.containerId, {
            center: this.center, zoom: this.zoom,
            maxBounds: margaritaBounds, maxBoundsViscosity: 1.0, minZoom: 10
        });

        const satelliteBase = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Tiles © Esri', maxZoom: 19 });
        const osmBase = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap', maxZoom: 19 });
        const labelsOverlay = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 });

        satelliteBase.addTo(this.map);
        labelsOverlay.addTo(this.map);

        // heatLayer global para avistamientos de usuarios (se llena con addSighting)
        this.heatLayer = L.heatLayer([], {
            radius: 35, blur: 25, maxZoom: 15,
            gradient: { 0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1.0: 'red' }
        });

        const baseMaps = { "Satélite": satelliteBase, "Mapa Estándar": osmBase };
        const overlayMaps = { "Nombres de Zonas": labelsOverlay, "Mapa de Calor (Avistamientos)": this.heatLayer };
        L.control.layers(baseMaps, overlayMaps, { position: 'topright' }).addTo(this.map);

        if (typeof L.markerClusterGroup !== 'undefined') {
            this.markerClusterGroup = L.markerClusterGroup({
                showCoverageOnHover: false,
                maxClusterRadius: 40,
                iconCreateFunction: function(cluster) {
                    const childCount = cluster.getChildCount();
                    return new L.DivIcon({
                        html: `<div style="background: rgba(16, 185, 129, 0.85); backdrop-filter: blur(4px); border: 2px solid #10b981; color: white; border-radius: 50%; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; font-weight: bold; box-shadow: 0 4px 15px rgba(16,185,129,0.4); font-family: 'Inter', sans-serif; font-size: 14px;"><span>${childCount}</span></div>`,
                        className: 'custom-marker-cluster',
                        iconSize: new L.Point(42, 42)
                    });
                }
            });
            this.map.addLayer(this.markerClusterGroup);
        }

        if (!document.getElementById('leaflet-custom-style')) {
            const style = document.createElement('style');
            style.id = 'leaflet-custom-style';
            style.innerHTML = `
                .leaflet-control-layers { background: rgba(15,23,42,0.95)!important; color:white!important; border:1px solid var(--primary-color)!important; border-radius:8px!important; }
                .leaflet-control-layers-toggle { background-color:var(--primary-color)!important; border-radius:6px; }
                .leaflet-control-layers-expanded { padding:10px!important; }
                .leaflet-popup-content-wrapper { background:rgba(15,23,42,0.95)!important; color:#f8fafc!important; box-shadow:0 10px 25px rgba(0,0,0,0.8)!important; backdrop-filter:blur(10px)!important; border:1px solid rgba(255,255,255,0.1)!important; border-radius:12px!important; }
                .leaflet-popup-tip { background:rgba(15,23,42,0.95)!important; }
                .leaflet-popup-content { margin:15px!important; }
                .leaflet-container a.leaflet-popup-close-button { color:#94a3b8!important; font-size:18px!important; padding:4px 8px!important; }
                .leaflet-container a.leaflet-popup-close-button:hover { color:#ef4444!important; }
                .custom-bird-bubble > div { transition:transform 0.2s ease!important; }
                .custom-bird-bubble > div:hover { transform:scale(1.15)!important; }
                @keyframes migPulse { 0%{stroke-dashoffset:0} 100%{stroke-dashoffset:-40} }
                .migration-path { animation: migPulse 1.2s linear infinite; }
            `;
            document.head.appendChild(style);
        }

        this.map.attributionControl.setPrefix('');
        this.initialized = true;
    }

    // ─── Datos de distribución por especie ───────────────────────────────────
    _getBirdHeatData(bird) {
        const name = (bird.name || '').toLowerCase();
        const type = (bird.type || '').toLowerCase();
        const hab  = (bird.habitat || '').toLowerCase();
        const lat  = bird.coords[0];
        const lng  = bird.coords[1];

        const isMigratory = type.includes('migrat') || (bird.habitats || []).includes('Migratoria');
        const isCoastal   = type.includes('costera') || type.includes('mangle') || hab.includes('costa') || hab.includes('laguna') || hab.includes('mangle');
        const isInterior  = type.includes('interior') || type.includes('terrestre');

        // ── Puntos del mapa de calor (zona de hábitat simulada) ──
        let heatPoints = [];
        const spread = isCoastal ? 0.06 : isInterior ? 0.08 : 0.05;

        // Núcleo de alta densidad en coord principal
        for (let i = 0; i < 8; i++) {
            heatPoints.push([
                lat + (Math.random() - 0.5) * spread * 0.4,
                lng + (Math.random() - 0.5) * spread * 0.4,
                0.9
            ]);
        }
        // Zona media
        for (let i = 0; i < 12; i++) {
            heatPoints.push([
                lat + (Math.random() - 0.5) * spread,
                lng + (Math.random() - 0.5) * spread,
                0.5
            ]);
        }
        // Zona periférica
        for (let i = 0; i < 10; i++) {
            heatPoints.push([
                lat + (Math.random() - 0.5) * spread * 1.8,
                lng + (Math.random() - 0.5) * spread * 1.8,
                0.2
            ]);
        }

        // ── Rutas migratorias reales (Venezuela → Norteamérica) ──
        let migrationRoute = null;
        if (isMigratory) {
            // Corredor migratorio Caribe: sale por el norte de Margarita hacia el Caribe
            migrationRoute = this._getMigrationRoute(name, lat, lng);
        }

        return { heatPoints, migrationRoute, isMigratory, isCoastal };
    }

    _getMigrationRoute(name, lat, lng) {
        // Rutas migratorias aproximadas por tipo de ave
        // Basadas en corredores reales del Caribe/Atlántico

        if (name.includes('flamenco')) {
            // Flamenco: ruta circular por el Caribe
            return [
                [lat, lng],
                [11.50, -63.60], // Norte de Margarita → mar
                [12.20, -63.00], // Trinidad/Tobago area
                [11.80, -62.40], // Barbados area
                [13.10, -61.20], // St. Vincent
                [14.00, -60.98], // Martinica
                [15.00, -61.37], // Guadalupe
                [18.50, -66.10], // Puerto Rico
                [21.00, -71.00], // Bahamas sur
                [25.20, -78.00], // Bahamas norte / Cuba
            ];
        }

        if (name.includes('becasa') || name.includes('playero blanco') || name.includes('aguja')) {
            // Playeros: ruta Atlántica hacia Norteamérica
            return [
                [lat, lng],
                [11.40, -63.50],
                [12.50, -62.20], // Trinidad
                [14.00, -60.90], // Arco antillano
                [18.00, -66.50], // Puerto Rico
                [22.00, -76.00], // Cuba
                [26.00, -80.00], // Florida sur
                [35.00, -75.00], // Carolina del Norte
                [41.00, -70.00], // Nueva Inglaterra
                [46.00, -64.00], // Canadá Atlántico
            ];
        }

        if (name.includes('porrón') || name.includes('pato collar')) {
            // Pato migratorio: ruta hacia interior de Norteamérica
            return [
                [lat, lng],
                [11.60, -64.20],
                [14.00, -67.00],
                [18.50, -69.90], // República Dominicana
                [23.00, -81.00], // Cuba / Florida
                [30.00, -90.00], // Golfo de México
                [40.00, -88.00], // Grandes Lagos
                [45.00, -93.00], // Minnesota
            ];
        }

        if (name.includes('charrán') || name.includes('gaviotin')) {
            // Charrán común: ruta transatlántica larga
            return [
                [lat, lng],
                [11.50, -63.00],
                [13.00, -59.00], // Barbados
                [16.00, -54.00], // Atlántico
                [20.00, -40.00], // Atlántico central
                [28.00, -20.00], // Canarias area
                [35.00, -7.00],  // Portugal
                [43.00, 0.0],    // Francia
                [50.00, 4.00],   // Bélgica/UK
            ];
        }

        // Ruta genérica para otras migratorias: dirección norte-caribe
        return [
            [lat, lng],
            [lat + 0.5, lng + 0.4],
            [lat + 1.5, lng + 0.8],
            [12.50, lng + 0.5],
            [14.00, lng - 0.5],
            [16.00, lng - 2.0],
            [18.50, lng - 4.0],
            [22.00, lng - 8.0],
        ];
    }

    // ─── Mostrar mapa de calor individual al abrir popup ────────────────────
    applyHeatmapEffect(marker, lat, lng, color, bird) {
        marker.on('popupopen', () => {
            // Atenuar los demás marcadores
            this.markers.forEach(m => {
                if (m !== marker && m._icon) { m._icon.style.opacity = '0.12'; m.setZIndexOffset(-1000); }
                else if (m === marker && m._icon) { m.setZIndexOffset(1000); }
            });

            this._clearBirdHeatLayers();

            const birdData = bird ? this._getBirdHeatData(bird) : null;

            if (birdData) {
                const { heatPoints, migrationRoute, isMigratory, isCoastal } = birdData;

                // ── 1. Heat layer individual del ave ──
                const gradient = isMigratory
                    ? { 0.2: '#fbbf24', 0.5: '#f97316', 0.8: '#ef4444', 1.0: '#dc2626' }  // naranja/rojo migratorio
                    : isCoastal
                        ? { 0.2: '#38bdf8', 0.5: '#0ea5e9', 0.8: '#0284c7', 1.0: '#1e40af' } // azul costero
                        : { 0.2: '#86efac', 0.5: '#22c55e', 0.8: '#16a34a', 1.0: '#14532d' }; // verde interior

                this.birdHeatLayer = L.heatLayer(heatPoints, {
                    radius: 40, blur: 30, maxZoom: 17, max: 1.0, gradient
                }).addTo(this.map);
                this.heatmapLayers.push(this.birdHeatLayer);

                // ── 2. Círculo de zona núcleo ──
                const zoneColor = isMigratory ? '#f97316' : isCoastal ? '#38bdf8' : '#22c55e';
                const zoneRadius = isCoastal ? 4500 : 6000;
                const zone = L.circle([lat, lng], {
                    color: zoneColor, fillColor: zoneColor,
                    fillOpacity: 0.08, opacity: 0.5, weight: 2, radius: zoneRadius,
                    dashArray: '6 4'
                }).addTo(this.map);
                this.heatmapLayers.push(zone);

                // ── 3. Ruta migratoria animada (solo aves migratorias) ──
                if (isMigratory && migrationRoute && migrationRoute.length > 1) {
                    // Línea principal de migración
                    const migPath = L.polyline(migrationRoute, {
                        color: '#f97316', weight: 3, opacity: 0.85,
                        dashArray: '10 6', className: 'migration-path'
                    }).addTo(this.map);
                    this.heatmapLayers.push(migPath);

                    // Flechas indicadoras de dirección cada N puntos
                    for (let i = 0; i < migrationRoute.length - 1; i += 2) {
                        const p1 = migrationRoute[i];
                        const p2 = migrationRoute[i + 1];
                        const arrowIcon = L.divIcon({
                            className: '',
                            html: `<div style="color:#f97316;font-size:16px;transform:rotate(${this._bearing(p1,p2)}deg);opacity:0.9;">▲</div>`,
                            iconSize: [16, 16], iconAnchor: [8, 8]
                        });
                        const midLat = (p1[0] + p2[0]) / 2;
                        const midLng = (p1[1] + p2[1]) / 2;
                        const arrowMarker = L.marker([midLat, midLng], { icon: arrowIcon, interactive: false }).addTo(this.map);
                        this.heatmapLayers.push(arrowMarker);
                    }

                    // Tooltip de ruta migratoria en el popup
                    const destLabel = migrationRoute[migrationRoute.length - 1];
                    const destMarker = L.marker(destLabel, {
                        icon: L.divIcon({
                            className: '',
                            html: `<div style="background:rgba(249,115,22,0.9);color:white;padding:3px 8px;border-radius:6px;font-size:11px;font-weight:600;white-space:nowrap;">🛬 Destino migratorio</div>`,
                            iconSize: [140, 24], iconAnchor: [70, 12]
                        }), interactive: false
                    }).addTo(this.map);
                    this.heatmapLayers.push(destMarker);

                    // Zoom out para ver la ruta completa
                    const routeBounds = L.latLngBounds(migrationRoute);
                    this.map.fitBounds(routeBounds.pad(0.1), { animate: true, duration: 1.2 });
                }

            } else {
                // Fallback básico (sin data de ave)
                const circle = L.circle([lat, lng], {
                    color, fillColor: color, fillOpacity: 0.15, radius: 4000
                }).addTo(this.map);
                this.heatmapLayers.push(circle);
            }
        });

        marker.on('popupclose', () => {
            // Restaurar marcadores
            this.markers.forEach(m => {
                if (m._icon) { m._icon.style.opacity = '1'; m.setZIndexOffset(0); }
            });
            this._clearBirdHeatLayers();
            // Regresar vista a la isla
            if (this.map) {
                this.map.flyTo(this.center, this.zoom, { animate: true, duration: 0.8 });
            }
        });
    }

    _clearBirdHeatLayers() {
        this.heatmapLayers.forEach(layer => {
            try { this.map.removeLayer(layer); } catch(e) {}
        });
        this.heatmapLayers = [];
        this.birdHeatLayer = null;
    }

    // Calcular ángulo de bearing entre dos puntos (para las flechas)
    _bearing(p1, p2) {
        const dLng = p2[1] - p1[1];
        const dLat = p2[0] - p1[0];
        const angle = Math.atan2(dLng, dLat) * (180 / Math.PI);
        return Math.round(angle);
    }

    addSighting(sighting) {
        if (!this.initialized || !sighting.latitude || !sighting.longitude) return;
        const { latitude, longitude, locationName, id, sightedAt } = sighting;
        const imageUrl = sighting.image_url || sighting.imageUrl;
        const routeColor = imageUrl ? '#10b981' : '#3b82f6';

        const iconHtml = imageUrl
            ? `<div style="width:46px;height:46px;border-radius:50%;border:3px solid ${routeColor};overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,0.6);background:#1e293b;"><img src="${imageUrl.startsWith('http') ? imageUrl : window.APP_CONFIG.BASE_URL + imageUrl}" style="width:100%;height:100%;object-fit:cover;" onerror="this.src='${imageUrl}'"></div>`
            : `<div style="width:46px;height:46px;border-radius:50%;border:3px solid ${routeColor};overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,0.6);background:#1e293b;display:flex;align-items:center;justify-content:center;font-size:22px;">🐦</div>`;

        const customIcon = L.divIcon({ className: 'custom-bird-bubble', html: iconHtml, iconSize: [46,46], iconAnchor: [23,23], popupAnchor: [0,-23] });
        const marker = L.marker([latitude, longitude], { icon: customIcon });
        if (this.markerClusterGroup) {
            this.markerClusterGroup.addLayer(marker);
        } else {
            marker.addTo(this.map);
        }

        const bName = sighting.bird_name || 'Especie Desconocida';
        const isUnknown = bName.toLowerCase().includes('desconocida') || bName.toLowerCase().includes('identificar');
        
        let commonName = bName;
        let scientificName = 'Pendiente de clasificación';
        
        if (isUnknown) {
            commonName = 'Especie en Revisión';
        } else {
            const nativeBird = (window.nativeBirdsData || []).find(b => b.name === bName);
            if (nativeBird) {
                scientificName = nativeBird.scientificName;
            }
        }

        const popupContent = `
            <div class="map-popup-card bg-slate-900 text-slate-100 p-3 rounded-xl border border-slate-700/50 shadow-2xl flex flex-col gap-2 min-w-[260px] max-w-[300px]">
                <div style="position: relative; width:100%; height:130px; border-radius:8px; overflow:hidden; background:#0b0f19; display:flex; align-items:center; justify-content:center; border:1px solid rgba(255,255,255,0.06);">
                    ${imageUrl 
                        ? `<img src="${imageUrl.startsWith('http') ? imageUrl : window.APP_CONFIG.BASE_URL + imageUrl}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='${imageUrl}'">`
                        : `<span style="font-size:2.5rem;">🐦</span>`
                    }
                    ${isUnknown 
                        ? `<span class="absolute top-2 right-2 px-2 py-0.5 text-[9px] font-extrabold tracking-wider uppercase bg-amber-500 text-slate-950 rounded-full shadow-lg animate-pulse" style="position: absolute; top: 8px; right: 8px; font-family: sans-serif;">⚠️ En Revisión</span>`
                        : ``
                    }
                </div>
                <div style="display:flex; flex-direction:column; gap:2px; font-family: sans-serif;">
                    <strong style="color:${isUnknown ? '#f59e0b' : 'var(--primary-color)'}; font-size:1.1rem; display:block; line-height:1.2;">
                        ${commonName}
                    </strong>
                    <span style="color:#94a3b8; font-size:0.75rem; font-style:italic; display:block; margin-bottom:4px;">
                        ${scientificName}
                    </span>
                    <div style="width:100%; height:1px; background:rgba(255,255,255,0.08); margin:4px 0;"></div>
                    <p style="color:#cbd5e1; font-size:0.78rem; margin:2px 0; display:flex; align-items:center; gap:6px;">
                        <span>📅</span> <strong>Fecha:</strong> ${sightedAt ? new Date(sightedAt).toLocaleDateString('es-ES', {year:'numeric', month:'short', day:'numeric'}) : 'Reciente'}
                    </p>
                    <p style="color:#cbd5e1; font-size:0.78rem; margin:2px 0; display:flex; align-items:center; gap:6px;">
                        <span>📍</span> <strong>Lugar:</strong> ${locationName || 'Ubicación'}
                    </p>
                    <p style="color:#cbd5e1; font-size:0.78rem; margin:2px 0; display:flex; align-items:center; gap:6px;">
                        <span>👤</span> <strong>Observador:</strong> ${sighting.user_name || sighting.user?.name || 'Observador Registrado'}
                    </p>
                    ${sighting.description 
                        ? `<div style="background:rgba(0,0,0,0.25); border:1px solid rgba(255,255,255,0.04); padding:6px 8px; border-radius:6px; margin-top:4px; max-height:60px; overflow-y:auto;">
                             <p style="color:#94a3b8; font-size:0.72rem; font-style:italic; margin:0; line-height:1.3;">"${sighting.description}"</p>
                           </div>`
                        : ''
                    }
                </div>
            </div>`;

        marker.bindPopup(popupContent);
        this.markers.push(marker);

        if (this.heatLayer) { this.heatLayer.addLatLng([latitude, longitude]); }
        this.applyHeatmapEffect(marker, latitude, longitude, routeColor, null);
    }

    addSightings(sightings) { sightings.forEach(s => this.addSighting(s)); }

    flyTo(lat, lng, zoom = 15) { if (this.map) this.map.flyTo([lat, lng], zoom); }

    clearMarkers() {
        if (this.markerClusterGroup) {
            this.markerClusterGroup.clearLayers();
        }
        this.markers.forEach(m => {
            if (m && m.remove) m.remove();
        });
        this.markers = [];
        if (this.heatLayer) this.heatLayer.setLatLngs([]);
        this._clearBirdHeatLayers();
        if (window.currentTriangulation) { this.map.removeLayer(window.currentTriangulation); window.currentTriangulation = null; }
    }

    fitBounds() {
        if (this.markers.length > 0) {
            const group = L.featureGroup(this.markers);
            this.map.fitBounds(group.getBounds().pad(0.1));
        }
    }
}
