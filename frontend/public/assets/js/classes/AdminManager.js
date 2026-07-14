class AdminManager {
    constructor() {
        this.container = document.getElementById('admin-sightings-container');
        this.injectStyles();
    }

    injectStyles() {
        const styleId = 'admin-manager-injected-styles';
        if (document.getElementById(styleId)) return;
        const styleEl = document.createElement('style');
        styleEl.id = styleId;
        styleEl.innerHTML = `
            .admin-header-row {
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                margin-bottom: 1.5rem !important;
                flex-wrap: wrap !important;
                gap: 1rem !important;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
                padding-bottom: 1.2rem !important;
            }
            .admin-header-title {
                color: var(--primary-color) !important;
                margin: 0 !important;
                font-size: 2rem !important;
            }
            .admin-header-actions {
                display: flex !important;
                gap: 1rem !important;
                align-items: center !important;
                flex-wrap: wrap !important;
            }

            .admin-pending-card {
                display: flex !important;
                flex-wrap: wrap !important;
                gap: 1.5rem !important;
                padding: 1.5rem !important;
                align-items: center !important;
                width: 100% !important;
                box-sizing: border-box !important;
            }
            .admin-pending-img-container {
                flex: 0 0 200px !important;
                height: 150px !important;
            }
            .admin-pending-info {
                flex: 1 1 300px !important;
            }
            .admin-pending-actions {
                flex: 0 0 auto !important;
                display: flex !important;
                flex-direction: column !important;
                gap: 0.8rem !important;
                justify-content: center !important;
                min-width: 160px !important;
                margin-left: auto !important;
            }

            /* Estilos específicos e inmunes a temas de botones en admin */
            .admin-btn-approve {
                background: #10b981 !important;
                background-image: none !important;
                border: none !important;
                color: #ffffff !important;
                font-weight: 700 !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                gap: 0.5rem !important;
                padding: 0.8rem !important;
                font-size: 0.9rem !important;
                border-radius: 8px !important;
                cursor: pointer !important;
                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2) !important;
                transition: all 0.2s ease !important;
                width: 100% !important;
            }
            .admin-btn-approve:hover {
                background: #059669 !important;
                transform: translateY(-1px) !important;
                box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3) !important;
            }
            .admin-btn-reject {
                background: transparent !important;
                background-image: none !important;
                border: 2px solid #ef4444 !important;
                color: #ef4444 !important;
                font-weight: 700 !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                gap: 0.5rem !important;
                padding: 0.8rem !important;
                font-size: 0.9rem !important;
                border-radius: 8px !important;
                cursor: pointer !important;
                transition: all 0.2s ease !important;
                width: 100% !important;
            }
            .admin-btn-reject:hover {
                background: #ef4444 !important;
                color: #ffffff !important;
                transform: translateY(-1px) !important;
            }

            @media (max-width: 900px) {
                #admin-view,
                #admin-users-view,
                #admin-all-sightings-view {
                    padding: 1rem !important;
                    margin-top: 70px !important;
                }
                .admin-pending-card {
                    flex-direction: column !important;
                    align-items: stretch !important;
                    gap: 1rem !important;
                    padding: 1.2rem !important;
                }
                .admin-pending-img-container {
                    flex: 1 1 100% !important;
                    width: 100% !important;
                    height: 200px !important;
                }
                .admin-pending-info {
                    flex: 1 1 100% !important;
                    width: 100% !important;
                }
                .admin-pending-actions {
                    flex: 1 1 100% !important;
                    width: 100% !important;
                    margin-left: 0 !important;
                    flex-direction: row !important;
                    flex-wrap: wrap !important;
                    gap: 0.5rem !important;
                }
                .admin-pending-actions .admin-btn-approve,
                .admin-pending-actions .admin-btn-reject {
                    flex: 1 1 120px !important;
                    width: auto !important;
                    padding: 0.7rem !important;
                    font-size: 0.85rem !important;
                    height: auto !important;
                }
            }

            @media (max-width: 768px) {
                .admin-header-row {
                    flex-direction: column !important;
                    align-items: stretch !important;
                    gap: 1.2rem !important;
                    text-align: center !important;
                }
                .admin-header-title {
                    width: 100% !important;
                    font-size: 1.6rem !important;
                }
                .admin-header-actions {
                    flex-direction: column !important;
                    width: 100% !important;
                    align-items: stretch !important;
                    gap: 0.8rem !important;
                }
                .admin-header-actions .btn {
                    width: 100% !important;
                    text-align: center !important;
                    justify-content: center !important;
                    display: flex !important;
                    padding: 0.8rem !important;
                    font-size: 0.95rem !important;
                }
                .admin-pending-card {
                    flex-direction: column !important;
                    align-items: stretch !important;
                    gap: 1.2rem !important;
                    padding: 1.2rem !important;
                    width: 100% !important;
                    box-sizing: border-box !important;
                }
                .admin-pending-img-container {
                    flex: 1 1 auto !important;
                    width: 100% !important;
                    height: 220px !important;
                }
                .admin-pending-info {
                    flex: 1 1 auto !important;
                    width: 100% !important;
                }
                .admin-pending-info select {
                    width: 100% !important;
                    box-sizing: border-box !important;
                }
                .admin-pending-actions {
                    flex: 1 1 auto !important;
                    width: 100% !important;
                    margin-left: 0 !important;
                    flex-direction: column !important;
                    gap: 0.7rem !important;
                }
                .admin-pending-actions .admin-btn-approve,
                .admin-pending-actions .admin-btn-reject {
                    width: 100% !important;
                    flex: 1 1 auto !important;
                    margin: 0 !important;
                    display: block !important;
                    text-align: center !important;
                }
            }

            @media (max-width: 540px) {
                #admin-view {
                    padding: 0.75rem !important;
                }
                .admin-pending-img-container {
                    height: 160px !important;
                }
                .admin-pending-actions {
                    flex-direction: column !important;
                    gap: 0.6rem !important;
                }
                .admin-pending-actions .admin-btn-approve,
                .admin-pending-actions .admin-btn-reject {
                    flex: 1 1 auto !important;
                    width: 100% !important;
                }
            }

            @media (max-width: 360px) {
                #admin-view {
                    padding: 0.5rem !important;
                }
            }
        `;
        document.head.appendChild(styleEl);
    }

    async loadPendingSightings() {
        if (!this.container) return;
        
        try {
            const token = sessionStorage.getItem('authToken');
            if (!token) throw new Error('No estás autenticado');

            const response = await fetch(window.APP_CONFIG.API_URL + '/sightings', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Error al obtener avistamientos');

            const sightings = await response.json();
            // Filtrar solo los pendientes
            const pending = sightings.filter(s => s.status === 'pending');

            this.renderSightings(pending);
        } catch (error) {
            console.error('Error:', error);
            this.container.innerHTML = `<div style="color: #ef4444; padding: 2rem; text-align: center;">Error al cargar: ${error.message}</div>`;
        }
    }

    parseImages(imagenes) {
        try {
            if (Array.isArray(imagenes)) return imagenes;
            if (typeof imagenes === 'string' && imagenes.trim().startsWith('[')) return JSON.parse(imagenes);
        } catch (e) { console.error("Error parsing images", e); }
        return [];
    }

    renderSightings(sightings) {
        if (sightings.length === 0) {
            this.container.innerHTML = `
                <div style="text-align: center; color: var(--text-muted); padding: 3rem; background: rgba(255,255,255,0.05); border-radius: 8px;">
                    <span style="font-size: 3rem; display: block; margin-bottom: 1rem;">🎉</span>
                    No hay avistamientos pendientes por revisar.
                </div>
            `;
            return;
        }

        if (!window.allLoadedSightings) window.allLoadedSightings = {};

        this.container.innerHTML = sightings.map(s => {
            window.allLoadedSightings[s.id] = s;
            const bName = s.bird_name || 'Especie Desconocida';
            const isUnknown = bName.toLowerCase().includes('desconocida') || bName.toLowerCase().includes('identificar');
            const imagenesArr = this.parseImages(s.imagenes);

            let birdOptionsHtml = '';
            if (isUnknown && window.nativeBirdsData) {
                birdOptionsHtml = `
                    <div style="margin-top: 1rem; width: 100%; text-align: left;" onclick="event.stopPropagation();">
                        <label style="color: #94a3b8; font-size: 0.85rem; font-weight: 600; display: block; margin-bottom: 0.4rem;">Asignar Especie Oficial:</label>
                        <select id="assign-species-${s.id}" class="glass-effect" style="width: 100%; background: #0f172a; color: #f8fafc; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 8px; padding: 0.6rem 1rem; font-size: 0.95rem; outline: none; transition: border-color 0.2s;" onfocus="this.style.borderColor='var(--primary-color)'" onblur="this.style.borderColor='rgba(255,255,255,0.15)'">
                            <option value="" disabled selected>❓ Selecciona el ave correcta...</option>
                            ${window.nativeBirdsData.map(bird => `<option value="${bird.name}">${bird.name} (${bird.scientificName})</option>`).join('')}
                        </select>
                    </div>
                `;
            }

            return `
            <div class="glass-effect admin-pending-card" style="border-radius: 12px; border-left: 4px solid ${isUnknown ? '#eab308' : 'var(--primary-color)'}; background: rgba(15, 23, 42, 0.6); cursor: pointer;" onclick="if(window.openSightingDetailsGlobal) window.openSightingDetailsGlobal(${s.id})">
                <div class="admin-pending-img-container" style="border-radius: 8px; overflow: hidden; background: rgba(0,0,0,0.5);">
                    ${imagenesArr.length > 0 ? 
                        `<div style="display: flex; gap: 2px; overflow-x: auto; height: 100%;">
                            ${imagenesArr.map(img => `<img src="${img.startsWith('http') ? img : window.APP_CONFIG.BASE_URL + img}" style="height: 100%; min-width: 100px; flex: 1; object-fit: cover;">`).join('')}
                        </div>`
                    : (s.image_url ? `<img src="${s.image_url.startsWith('http') ? s.image_url : window.APP_CONFIG.BASE_URL + s.image_url}" style="width: 100%; height: 100%; object-fit: cover;">` : '<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:#666;">Sin foto</div>')}
                </div>
                <div class="admin-pending-info" style="display: flex; flex-direction: column; justify-content: center;">
                    <h3 style="color: ${isUnknown ? '#eab308' : 'var(--primary-color)'}; margin-bottom: 0.5rem; font-size: 1.4rem; display: flex; align-items: center; gap: 0.5rem;">
                        ${isUnknown ? 'Especie en Revisión ⚠️' : escapeHtml(s.bird_name)}
                    </h3>
                    <p style="margin-bottom: 0.3rem; color: #cbd5e1; font-size: 0.9rem;"><strong>📍 Ubicación:</strong> ${escapeHtml(s.location_name) || s.latitude + ', ' + s.longitude}</p>
                    <p style="margin-bottom: 0.3rem; color: #cbd5e1; font-size: 0.9rem;"><strong>👤 Reportado por:</strong> ${escapeHtml(s.user_name) || 'Usuario Desconocido'}</p>
                    <p style="font-size: 0.9rem; color: #94a3b8; font-style: italic; background: rgba(0,0,0,0.2); padding: 0.6rem 0.8rem; border-radius: 6px; margin-top: 0.3rem;">"${escapeHtml(s.description) || 'Sin notas adicionales.'}"</p>
                    ${birdOptionsHtml}
                </div>
                <div class="admin-pending-actions">
                    <button class="admin-btn-approve" onclick="event.stopPropagation(); window.adminManager.approveSighting(${s.id})">
                        ${isUnknown ? '✅ Identificar y Aprobar' : '✅ Aprobar'}
                    </button>
                    <button class="admin-btn-reject" onclick="event.stopPropagation(); window.adminManager.rejectSighting(${s.id})">❌ Rechazar</button>
                </div>
            </div>
            `;
        }).join('');
    }

    async approveSighting(id, refreshFullscreen = false) {
        try {
            const token = sessionStorage.getItem('authToken');
            
            let bodyData = {};
            const selectEl = document.getElementById(`assign-species-${id}`);
            if (selectEl) {
                const assignedBirdName = selectEl.value;
                if (!assignedBirdName) {
                    if (window.modalManager) window.modalManager.showMessage('Aviso', 'Por favor selecciona la especie oficial identificada antes de aprobar.', 'warning');
                    return;
                }
                bodyData.bird_name = assignedBirdName;
            }

            const res = await fetch(window.APP_CONFIG.API_URL + `/sightings/${id}/approve`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bodyData)
            });
            if (res.ok) {
                if (window.modalManager) window.modalManager.showMessage('Aprobado', 'El avistamiento es ahora público.', 'success');
                this.loadPendingSightings(); // Recargar lista
                if (refreshFullscreen) this.showAllSightingsFullscreen();
                if (window.location.hash === '#/dashboard' || typeof window.loadDashboardData === 'function') {
                    // Refrescar mapa si está expuesto
                }
            } else {
                if (window.modalManager) window.modalManager.showMessage('Error', 'No se pudo aprobar.', 'error');
            }
        } catch (error) {
            console.error(error);
        }
    }

    async rejectSighting(id, refreshFullscreen = false) {
        try {
            const token = sessionStorage.getItem('authToken');
            const res = await fetch(window.APP_CONFIG.API_URL + `/sightings/${id}/reject`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                if (window.modalManager) {
                    window.modalManager.showMessage('Rechazado', 'El avistamiento ha sido rechazado/suspendido.', 'success');
                    // Solo cerrar si estamos en un modal de detalles
                    if (document.getElementById('closeModalBtn')) document.getElementById('closeModalBtn').click();
                }
                this.loadPendingSightings(); // Recargar lista
                if (refreshFullscreen) this.showAllSightingsFullscreen();
                if (window.loadActividadSightings) window.loadActividadSightings(); // Refrescar listas públicas
            } else {
                if (window.modalManager) window.modalManager.showMessage('Error', 'No se pudo rechazar.', 'error');
            }
        } catch (error) {
            console.error(error);
        }
    }

    async deleteSighting(id) {
        try {
            const token = sessionStorage.getItem('authToken');
            const res = await fetch(window.APP_CONFIG.API_URL + `/sightings/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                if (window.modalManager) {
                    window.modalManager.showMessage('Eliminado', 'El avistamiento ha sido eliminado correctamente.', 'success');
                    // Cerrar el modal actual
                    if (document.getElementById('closeModalBtn')) document.getElementById('closeModalBtn').click();
                }
                this.loadPendingSightings(); // Recargar lista
                this.showAllSightingsFullscreen();
                if (window.loadActividadSightings) window.loadActividadSightings(); // Refrescar listas públicas
            } else {
                if (window.modalManager) window.modalManager.showMessage('Error', 'No se pudo eliminar el avistamiento.', 'error');
            }
        } catch (error) {
            console.error(error);
        }
    }

    async showAllSightingsFullscreen() {
        const container = document.getElementById('admin-all-sightings-container');
        if (!container) return;
        
        container.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 3rem; grid-column: 1 / -1;">Cargando todos los avistamientos...</div>';

        try {
            const token = sessionStorage.getItem('authToken');
            if (!token) throw new Error('No estás autenticado');

            const response = await fetch(window.APP_CONFIG.API_URL + '/sightings', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Error al obtener avistamientos');

            const sightings = await response.json();
            
            if (sightings.length === 0) {
                container.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 3rem; grid-column: 1 / -1;">No hay avistamientos en el sistema.</div>';
                return;
            }

            if (!window.allLoadedSightings) window.allLoadedSightings = {};

            container.innerHTML = sightings.map(s => {
                window.allLoadedSightings[s.id] = s;

                // Parsear imagenes: puede venir como string JSON o como array
                let imagenesArr = [];
                try {
                    if (Array.isArray(s.imagenes)) imagenesArr = s.imagenes;
                    else if (typeof s.imagenes === 'string' && s.imagenes.trim().startsWith('[')) imagenesArr = JSON.parse(s.imagenes);
                } catch(e) { imagenesArr = []; }

                let statusBadge = '';
                if (s.status === 'pending') statusBadge = '<span style="background: var(--warning-color); color: #fff; padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.75rem; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.5);">Pendiente</span>';
                else if (s.status === 'approved') statusBadge = '<span style="background: #10b981; color: #fff; padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.75rem; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.5);">Aprobado</span>';
                else if (s.status === 'rejected') statusBadge = '<span style="background: #ef4444; color: #fff; padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.75rem; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.5);">Rechazado</span>';

                return `
                <div style="background: rgba(15, 23, 42, 0.8); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; border: 1px solid rgba(255,255,255,0.05); transition: transform 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.3); cursor: pointer;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'" onclick="if(window.openSightingDetailsGlobal) window.openSightingDetailsGlobal(${s.id})">
                    <div style="height: 180px; width: 100%; background: #0f172a; position: relative;">
                        ${imagenesArr.length > 0 ? 
                            `<div style="display: flex; gap: 2px; overflow-x: auto; height: 100%;">
                                ${imagenesArr.map(img => `<img src="${img.startsWith('http') ? img : window.APP_CONFIG.BASE_URL + img}" style="height: 100%; min-width: 100px; flex: 1; object-fit: cover;">`).join('')}
                            </div>`
                        : (s.image_url ? `<img src="${s.image_url.startsWith('http') ? s.image_url : window.APP_CONFIG.BASE_URL + s.image_url}" style="width: 100%; height: 100%; object-fit: cover;">` : '<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:#666;">Sin foto</div>')}
                        <div style="position: absolute; top: 10px; right: 10px; z-index: 10;">${statusBadge}</div>
                    </div>
                    <div style="padding: 1.2rem; display: flex; flex-direction: column; flex-grow: 1;">
                        <h4 style="color: var(--primary-color); margin-bottom: 0.5rem; font-size: 1.2rem;">${escapeHtml(s.bird_name)}</h4>
                        <p style="font-size: 0.85rem; color: #cbd5e1; margin-bottom: 0.3rem;"><strong>📍</strong> ${escapeHtml(s.location_name || 'Sin ubicación específica')}</p>
                        <p style="font-size: 0.85rem; color: #cbd5e1; margin-bottom: 0.5rem;"><strong>👤</strong> ${escapeHtml(s.user_name || 'Desconocido')}</p>
                        <p style="font-size: 0.85rem; color: #94a3b8; font-style: italic; flex-grow: 1;">"${escapeHtml(s.description || 'Sin descripción')}"</p>
                        
                        ${s.status === 'pending' ? `
                        <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                            <button class="admin-btn-approve" style="padding: 0.5rem !important; font-size: 0.85rem !important;" onclick="event.stopPropagation(); window.adminManager.approveSighting(${s.id}, true)">✅ Aprobar</button>
                            <button class="admin-btn-reject" style="padding: 0.5rem !important; font-size: 0.85rem !important;" onclick="event.stopPropagation(); window.adminManager.rejectSighting(${s.id}, true)">❌ Rechazar</button>
                        </div>
                        ` : ''}
                    </div>
                </div>
                `;
            }).join('');

        } catch (error) {
            console.error(error);
            container.innerHTML = `<div style="color: #ef4444; padding: 2rem; text-align: center; grid-column: 1 / -1;">Error: ${error.message}</div>`;
        }
    }

    async fetchAndRenderUserList() {
        const container = document.getElementById('admin-users-container');
        if (!container) return;
        
        container.innerHTML = '<div style="text-align: center; padding: 2rem;">Cargando directorio...</div>';

        try {
            const token = sessionStorage.getItem('authToken');
            if (!token) {
                container.innerHTML = '<div style="text-align: center; color: #ef4444; padding: 2rem;">No tienes permiso para ver esto.</div>';
                return;
            }
            const res = await fetch(window.APP_CONFIG.API_URL + '/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const users = await res.json();
                this.renderUserList(users, container);
            } else {
                container.innerHTML = '<div style="text-align: center; color: #ef4444; padding: 2rem;">Error al obtener la lista de usuarios.</div>';
            }
        } catch (error) {
            console.error(error);
            container.innerHTML = '<div style="text-align: center; color: #ef4444; padding: 2rem;">Error de conexión.</div>';
        }
    }

    renderUserList(users, container) {
        if (users.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 2rem;">No hay usuarios registrados.</div>';
            return;
        }

        const createRow = (u) => `
            <div class="admin-user-row" style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.2); margin-bottom: 0.5rem; border-radius: 8px;">
                <div class="admin-user-info" style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: ${u.role === 'admin' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)'}; color: ${u.role === 'admin' ? '#10b981' : '#3b82f6'}; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; border: 1px solid ${u.role === 'admin' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(59, 130, 246, 0.5)'}; flex-shrink: 0;">
                        ${u.role === 'admin' ? '🛡️' : '👤'}
                    </div>
                    <div>
                        <strong style="color: #f8fafc; font-size: 1rem; display: block;">${escapeHtml(u.name)}</strong>
                        <span style="color: var(--text-muted); font-size: 0.85rem;">${escapeHtml(u.email)}</span>
                    </div>
                </div>
                <div class="admin-user-actions" style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; justify-content: flex-end; margin-top: 0;">
                    ${u.status === 'suspended' ? '<span style="padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: bold; background: #ef4444; color: white;">Suspendido</span>' : ''}
                    <span style="padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.8rem; font-weight: bold; background: ${u.role === 'admin' ? '#10b981' : '#3b82f6'}; color: white; white-space: nowrap;">
                        ${u.role === 'admin' && u.id === 1 ? '👑 Super Admin' : (u.role === 'admin' ? 'Administrador' : 'Usuario')}
                    </span>
                    ${u.role !== 'admin' ? `
                        ${u.status === 'suspended' 
                            ? `<button onclick="window.adminManager.activateUser(${u.id})" class="btn btn-outline" style="border-color: #10b981; color: #10b981; font-size: 0.75rem; padding: 0.3rem 0.6rem;" title="Activar Usuario">✅ Activar</button>`
                            : `<button onclick="window.adminManager.suspendUser(${u.id})" class="btn btn-outline" style="border-color: #f59e0b; color: #f59e0b; font-size: 0.75rem; padding: 0.3rem 0.6rem;" title="Suspender Usuario">🚫 Suspender</button>`
                        }
                        <button onclick="window.modalManager.showConfirm('Confirmar Acción', '¿Eliminar usuario permanentemente?', () => window.adminManager.deleteUser(${u.id}), 'danger')" class="btn btn-outline" style="border-color: #ef4444; color: #ef4444; font-size: 0.75rem; padding: 0.3rem 0.6rem;" title="Eliminar Usuario">🗑️ Eliminar</button>
                        <button onclick="window.modalManager.showConfirm('Confirmar Acción', '¿Hacer Administrador a este usuario?', () => window.adminManager.makeAdmin(${u.id}), 'info')" class="btn btn-outline" style="border-color: #3b82f6; color: #3b82f6; font-size: 0.75rem; padding: 0.3rem 0.6rem;" title="Hacer Admin">🛡️ Crear Admin</button>
                    ` : ''}
                    ${u.role === 'admin' && u.id !== 1 ? `
                        <button onclick="window.modalManager.showConfirm('Confirmar Acción', '¿Eliminar permisos de Administrador?', () => window.adminManager.revokeAdmin(${u.id}), 'warning')" class="btn btn-outline" style="border-color: #ef4444; color: #ef4444; font-size: 0.75rem; padding: 0.3rem 0.6rem;" title="Revocar Admin">❌ Revocar Permisos</button>
                    ` : ''}
                </div>
            </div>
        `;


        const adminUsers = users.filter(u => u.role === 'admin');
        const normalUsers = users.filter(u => u.role !== 'admin');

        let html = '';
        
        if (adminUsers.length > 0) {
            html += '<h3 style="color: var(--primary-light); margin-bottom: 1rem; font-size: 1.2rem;">Administradores</h3>';
            html += '<div style="margin-bottom: 2rem;">' + adminUsers.map(createRow).join('') + '</div>';
        }

        if (normalUsers.length > 0) {
            html += '<h3 style="color: var(--text-muted); margin-bottom: 1rem; font-size: 1.2rem;">Usuarios Registrados</h3>';
            html += '<div>' + normalUsers.map(createRow).join('') + '</div>';
        }

        container.innerHTML = html;
    }

    async suspendUser(id) {
        try {
            const token = sessionStorage.getItem('authToken');
            const res = await fetch(window.APP_CONFIG.API_URL + `/users/${id}/suspend`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }});
            if (res.ok) {
                if (window.modalManager) window.modalManager.showMessage('Éxito', 'Usuario suspendido correctamente.', 'success');
                this.fetchAndRenderUserList();
            } else {
                if (window.modalManager) window.modalManager.showMessage('Error', 'No se pudo suspender al usuario.', 'error');
            }
        } catch (error) { console.error(error); }
    }

    async activateUser(id) {
        try {
            const token = sessionStorage.getItem('authToken');
            const res = await fetch(window.APP_CONFIG.API_URL + `/users/${id}/activate`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }});
            if (res.ok) {
                if (window.modalManager) window.modalManager.showMessage('Éxito', 'Usuario activado correctamente.', 'success');
                this.fetchAndRenderUserList();
            } else {
                if (window.modalManager) window.modalManager.showMessage('Error', 'No se pudo activar al usuario.', 'error');
            }
        } catch (error) { console.error(error); }
    }

    async deleteUser(id) {
        try {
            const token = sessionStorage.getItem('authToken');
            const res = await fetch(window.APP_CONFIG.API_URL + `/users/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
            if (res.ok) {
                if (window.modalManager) window.modalManager.showMessage('Éxito', 'Usuario eliminado correctamente.', 'success');
                this.fetchAndRenderUserList();
            } else {
                if (window.modalManager) window.modalManager.showMessage('Error', 'No se pudo eliminar al usuario.', 'error');
            }
        } catch (error) { console.error(error); }
    }

    async makeAdmin(id) {
        try {
            const token = sessionStorage.getItem('authToken');
            const res = await fetch(window.APP_CONFIG.API_URL + `/users/${id}/make-admin`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }});
            if (res.ok) {
                if (window.modalManager) window.modalManager.showMessage('Éxito', 'Usuario promovido a Administrador.', 'success');
                this.fetchAndRenderUserList();
            } else {
                if (window.modalManager) window.modalManager.showMessage('Error', 'No se pudo promover al usuario.', 'error');
            }
        } catch (error) { console.error(error); }
    }

    async revokeAdmin(id) {
        try {
            const token = sessionStorage.getItem('authToken');
            const res = await fetch(window.APP_CONFIG.API_URL + `/users/${id}/revoke-admin`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }});
            if (res.ok) {
                if (window.modalManager) window.modalManager.showMessage('Éxito', 'Se revocaron los permisos de administrador al usuario.', 'success');
                this.fetchAndRenderUserList();
            } else {
                if (window.modalManager) window.modalManager.showMessage('Error', 'No se pudieron revocar los permisos.', 'error');
            }
        } catch (error) { console.error(error); }
    }

    async exportDatabase() {
        try {
            const token = sessionStorage.getItem('authToken');
            if (!token) throw new Error('No estás autenticado');

            if (window.modalManager) window.modalManager.showLoading('Exportando base de datos...');

            const res = await fetch(window.APP_CONFIG.API_URL + '/backup/export', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                let errorMessage = 'Error al exportar la base de datos';
                try {
                    const errorData = await res.json();
                    errorMessage = errorData.message || errorMessage;
                } catch(e) {}
                throw new Error(errorMessage);
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            // Get filename from header if possible, else use default
            let filename = 'avistarNE_backup.json';
            const disposition = res.headers.get('content-disposition');
            if (disposition && disposition.indexOf('attachment') !== -1) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(disposition);
                if (matches != null && matches[1]) { 
                    filename = matches[1].replace(/['"]/g, '');
                }
            }

            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            if (window.modalManager) window.modalManager.showMessage('Éxito', 'Respaldo exportado correctamente.', 'success');
        } catch (error) {
            console.error(error);
            if (window.modalManager) window.modalManager.showMessage('Error', error.message, 'error');
        }
    }

    async importDatabase() {
        try {
            const fileInput = document.getElementById('backupFileInput');
            if (!fileInput || !fileInput.files[0]) {
                if (window.modalManager) window.modalManager.showMessage('Error', 'Debes seleccionar un archivo JSON para importar.', 'error');
                return;
            }

            const token = sessionStorage.getItem('authToken');
            if (!token) throw new Error('No estás autenticado');

            const confirmed = window.confirm("⚠️ ADVERTENCIA: Importar un respaldo sobreescribirá todos los usuarios y avistamientos actuales. ¿Estás seguro de que deseas continuar?");
            if (!confirmed) return;

            if (window.modalManager) window.modalManager.showLoading('Restaurando base de datos. Esto puede tardar unos momentos...');

            const formData = new FormData();
            formData.append('backup', fileInput.files[0]);

            const res = await fetch(window.APP_CONFIG.API_URL + '/backup/import', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const result = await res.json();

            if (res.ok) {
                if (window.modalManager) window.modalManager.showMessage('Éxito', result.message || 'Base de datos restaurada correctamente.', 'success');
                fileInput.value = '';
                
                // If user is restoring, data changed, maybe logout or refresh list
                this.loadPendingSightings();
            } else {
                throw new Error(result.message || 'Error al importar la base de datos');
            }
        } catch (error) {
            console.error(error);
            if (window.modalManager) window.modalManager.showMessage('Error', error.message, 'error');
        }
    }
}

window.AdminManager = AdminManager;
