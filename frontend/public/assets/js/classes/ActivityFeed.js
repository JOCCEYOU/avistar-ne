import { escapeHtml } from '../utils/helpers.js';

export class ActivityFeed {
    constructor(containerId) {
        this.containerId = containerId;
        this.sightings = [];
    }

    renderSkeletons(count = 3) {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        let html = '';
        for (let i = 0; i < count; i++) {
            html += `
            <div class="bird-card glass-effect skeleton-card" style="flex: 0 0 auto; padding: 0; display: flex; flex-direction: column; overflow: hidden; height: 380px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 1px solid var(--border-color);">
                <div class="skeleton-image" style="height: 200px; width: 100%;"></div>
                <div style="flex: 1; padding: 1rem; display: flex; flex-direction: column; justify-content: space-between; align-items: center;">
                    <div style="width: 100%; display: flex; flex-direction: column; align-items: center; gap: 8px;">
                        <div class="skeleton-text" style="width: 70%; height: 18px; border-radius: 4px;"></div>
                        <div class="skeleton-text" style="width: 40%; height: 12px; border-radius: 4px;"></div>
                    </div>
                    <div style="width: 100%; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                        <div class="skeleton-text" style="width: 50%; height: 12px; border-radius: 4px;"></div>
                        <div class="skeleton-text" style="width: 30%; height: 10px; border-radius: 4px;"></div>
                    </div>
                </div>
            </div>
            `;
        }

        container.style.cssText = "display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 2rem;";
        container.innerHTML = html;
    }

    render(sightings = null) {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        if (sightings) {
            this.sightings = sightings;
        }

        if (this.sightings.length === 0) {
            container.innerHTML = `
                <div class="activity-empty text-center p-4">
                    <p>No hay avistamientos recientes</p>
                    <p>¡Sé el primero en reportar uno!</p>
                </div>
            `;
            return;
        }

        if (!window.allLoadedSightings) window.allLoadedSightings = {};

        const html = this.sightings.slice(0, 15).map(sighting => {
            window.allLoadedSightings[sighting.id] = sighting;
            let imagenesArr = [];
            try {
                if (Array.isArray(sighting.imagenes)) {
                    imagenesArr = sighting.imagenes;
                } else if (typeof sighting.imagenes === 'string' && sighting.imagenes.trim().startsWith('[')) {
                    imagenesArr = JSON.parse(sighting.imagenes);
                }
            } catch(e) {
                console.error("Error parsing sighting.imagenes in ActivityFeed", e);
            }
            const imgUrl = imagenesArr.length > 0 ? imagenesArr[0] : (sighting.image_url || sighting.imageUrl);
            const fullImgUrl = imgUrl ? (imgUrl.startsWith('http') ? imgUrl : window.APP_CONFIG.BASE_URL + imgUrl) : '';

            return `
            <div class="bird-card glass-effect" style="flex: 0 0 auto; padding: 0; cursor: pointer; transition: transform 0.3s; display: flex; flex-direction: column; overflow: hidden; height: 380px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='none'" onclick="if(window.openSightingDetailsGlobal) window.openSightingDetailsGlobal(${sighting.id})">
                <div style="height: 200px; width: 100%; background: #000; flex-shrink: 0; position: relative;">
                    ${fullImgUrl ? `<img src="${fullImgUrl}" alt="Foto" style="width: 100%; height: 100%; object-fit: cover; object-position: center;" onerror="this.src='${imgUrl}'">` : `<div style="width:100%; height:100%; background:#1e293b; display:flex; align-items:center; justify-content:center;">Sin foto</div>`}
                    <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 40%; background: linear-gradient(to top, rgba(15,23,42,1), transparent);"></div>
                    <span class="badge ${sighting.status === 'approved' ? 'badge-success' : 'badge-warning'}" style="position: absolute; top: 10px; right: 10px; z-index: 2;">
                        ${sighting.status === 'approved' ? 'Confirmado' : 'Pendiente'}
                    </span>
                </div>
                <div style="flex: 1; padding: 1rem; display: flex; flex-direction: column; justify-content: space-between; text-align: center;">
                    <div>
                        <h4 style="margin: 0 0 0.3rem 0; font-size: 1.1rem; line-height: 1.2; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${escapeHtml(sighting.bird_name || sighting.species?.commonName || 'Especie desconocida')}</h4>
                        <p style="font-size: 0.8rem; font-style: italic; margin: 0 0 0.5rem 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">📍 ${escapeHtml(sighting.location_name || sighting.locationName || 'Sin ubicación')}</p>
                    </div>
                    <div>
                        <small style="color: var(--primary-color); font-size: 0.75rem; font-weight: 500;">Por: ${escapeHtml(sighting.user_name || sighting.user?.name || 'Observador Registrado')}</small>
                        <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;">${(sighting.sighted_at || sighting.sightedAt || sighting.created_at) ? new Date(sighting.sighted_at || sighting.sightedAt || sighting.created_at).toLocaleDateString('es-ES') : ''}</div>
                    </div>
                </div>
            </div>
            `;
        }).join('');

        container.style.cssText = "display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 2rem;";
        container.innerHTML = html;
    }

    addSighting(sighting) {
        this.sightings.unshift(sighting);
        this.render();
    }
}
