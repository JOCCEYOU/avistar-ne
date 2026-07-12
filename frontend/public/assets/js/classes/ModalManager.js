import { escapeHtml } from '../utils/helpers.js';

export class ModalManager {
    constructor() {
        this.modal = null;
        this.overlay = null;
        this.callbacks = {};
    }

    createModal(content) {
        // Limpiar cualquier overlay existente en el DOM para evitar acumulación
        const existingOverlays = document.querySelectorAll('.modal-overlay');
        existingOverlays.forEach(el => el.remove());
        this.overlay = null;
        this.modal = null;

        // Crear overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'modal-overlay';
        this.overlay.addEventListener('click', (e) => {
            if(e.target === this.overlay) this.close();
        });

        // Crear modal
        this.modal = document.createElement('div');
        this.modal.className = 'modal-content glass-effect';
        this.modal.innerHTML = content;

        this.overlay.appendChild(this.modal);
        document.body.appendChild(this.overlay);

        // Eventos de teclado
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    handleKeyDown(e) {
        if (e.key === 'Escape') {
            this.close();
        }
    }

    openLogin() {
        const content = `
            <button class="modal-close" id="closeModalBtn" style="position:absolute; top:15px; right:20px; z-index:10; font-size:2rem; background:rgba(0,0,0,0.5); width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; border:1px solid rgba(255,255,255,0.2); transition: background 0.3s;">&times;</button>
            <div class="modal-body" style="padding: 0; display: flex; flex-wrap: wrap; border-radius: 12px; overflow: hidden; min-height: 500px;">
                <div style="flex: 1 1 350px; position: relative; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; overflow: hidden;">
                    <img src="./img-frontend/guacamaya.jpg" alt="Aves de Margarita" style="width: 100%; height: 100%; object-fit: cover; object-position: center; position: absolute; top: 0; left: 0;">
                    <div style="position: absolute; bottom: 0; left: 0; width: 100%; padding: 30px 20px 20px; background: linear-gradient(to top, rgba(0,0,0,0.9), transparent); text-align: center;">
                        <h3 style="color: white; margin: 0; font-size: 1.5rem; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">¡Bienvenido de nuevo!</h3>
                        <p style="color: #e2e8f0; margin-top: 8px; font-size: 0.95rem; text-shadow: 0 1px 3px rgba(0,0,0,0.5);">Sigue descubriendo y protegiendo la avifauna de nuestra isla.</p>
                    </div>
                </div>
                <div style="flex: 1 1 350px; padding: 3rem; display: flex; flex-direction: column; justify-content: center; background: rgba(15,23,42,0.95);">
                    <h2 style="font-size: 2rem; margin-bottom: 2rem; color: white; text-align: center;">Iniciar Sesión</h2>
                    <form id="loginForm">
                        <div class="form-group">
                            <label for="loginEmail" style="color: white !important;">Correo</label>
                            <input type="email" id="loginEmail" placeholder="tu@email.com" required>
                        </div>
                        <div class="form-group">
                            <label for="loginPassword" style="color: white !important;">Contraseña</label>
                            <input type="password" id="loginPassword" placeholder="••••••••" required minlength="6">
                        </div>
                        <button type="submit" class="btn btn-primary w-100 mt-3" style="font-size: 1.1rem; padding: 0.8rem;">Iniciar Sesión</button>
                        <p class="text-center mt-3" style="color: #94a3b8;">
                            ¿No tienes cuenta? <a href="#" id="toRegisterBtn" style="color: var(--primary-light); font-weight: bold;">Regístrate</a>
                        </p>
                    </form>
                </div>
            </div>
        `;
        this.createModal(content);
        this.modal.style.maxWidth = '900px';
        this.modal.style.padding = '0';

        document.getElementById('closeModalBtn').addEventListener('click', () => this.close());
        document.getElementById('toRegisterBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.close();
            this.openRegister();
        });

        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('[ModalManager] Login form submitted:', { email: document.getElementById('loginEmail').value });
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            if (this.callbacks.onLogin) {
                console.log('[ModalManager] Triggering onLogin callback...');
                this.callbacks.onLogin(email, password);
            } else {
                console.warn('[ModalManager] onLogin callback is not registered!');
            }
        });
    }

    openRegister() {
        const content = `
            <button class="modal-close" id="closeModalBtn" style="position:absolute; top:15px; right:20px; z-index:10; font-size:2rem; background:rgba(0,0,0,0.5); width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; border:1px solid rgba(255,255,255,0.2); transition: background 0.3s;">&times;</button>
            <div class="modal-body" style="padding: 0; display: flex; flex-wrap: wrap; border-radius: 12px; overflow: hidden; min-height: 550px;">
                <div style="flex: 1 1 350px; position: relative; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; overflow: hidden;">
                    <img src="./img-frontend/turpial.jpg" alt="Aves de Margarita" style="width: 100%; height: 100%; object-fit: cover; object-position: center; position: absolute; top: 0; left: 0;">
                    <div style="position: absolute; bottom: 0; left: 0; width: 100%; padding: 30px 20px 20px; background: linear-gradient(to top, rgba(0,0,0,0.9), transparent); text-align: center;">
                        <h3 style="color: white; margin: 0; font-size: 1.5rem; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">Únete a Avistar NE</h3>
                        <p style="color: #e2e8f0; margin-top: 8px; font-size: 0.95rem; text-shadow: 0 1px 3px rgba(0,0,0,0.5);">Tu participación ayuda a conservar las especies endémicas de Nueva Esparta.</p>
                    </div>
                </div>
                <div style="flex: 1 1 350px; padding: 2.5rem 3rem; display: flex; flex-direction: column; justify-content: center; background: rgba(15,23,42,0.95);">
                    <h2 style="font-size: 2rem; margin-bottom: 1.5rem; color: white; text-align: center;">Crear Cuenta</h2>
                    <form id="registerForm">
                        <div class="form-group">
                            <label for="registerName" style="color: white !important;">Nombre completo</label>
                            <input type="text" id="registerName" placeholder="Juan Pérez" required>
                        </div>
                        <div class="form-group">
                            <label for="registerEmail" style="color: white !important;">Correo</label>
                            <input type="email" id="registerEmail" placeholder="tu@email.com" required>
                        </div>
                        <div class="form-group">
                            <label for="registerPassword" style="color: white !important;">Contraseña</label>
                            <input type="password" id="registerPassword" placeholder="Mínimo 6 caracteres" required minlength="6">
                        </div>
                        <div class="form-group">
                            <label for="registerConfirmPassword" style="color: white !important;">Confirmar contraseña</label>
                            <input type="password" id="registerConfirmPassword" placeholder="Repite la contraseña" required>
                        </div>
                        <button type="submit" class="btn btn-primary w-100 mt-2" style="font-size: 1.1rem; padding: 0.8rem;">Registrarse</button>
                        <p class="text-center mt-3" style="color: #94a3b8;">
                            ¿Ya tienes cuenta? <a href="#" id="toLoginBtn" style="color: var(--primary-light); font-weight: bold;">Inicia sesión</a>
                        </p>
                    </form>
                </div>
            </div>
        `;
        this.createModal(content);
        this.modal.style.maxWidth = '900px';
        this.modal.style.padding = '0';

        document.getElementById('closeModalBtn').addEventListener('click', () => this.close());
        document.getElementById('toLoginBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.close();
            this.openLogin();
        });

        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('[ModalManager] Register form submitted:', { 
                name: document.getElementById('registerName').value,
                email: document.getElementById('registerEmail').value 
            });
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;

            if (password !== confirmPassword) {
                console.warn('[ModalManager] Password confirmation mismatch');
                alert('Las contraseñas no coinciden');
                return;
            }

            if (this.callbacks.onRegister) {
                console.log('[ModalManager] Triggering onRegister callback...');
                this.callbacks.onRegister({ name, email, password });
            } else {
                console.warn('[ModalManager] onRegister callback is not registered!');
            }
        });
    }

    showSimpleBirdList() {
        if (!window.nativeBirdsData) return;
        
        let listHtml = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 1rem; padding: 1.5rem; overflow-y: auto; max-height: 70vh;">';
        
        window.nativeBirdsData.forEach(bird => {
            const imgUrl = bird.images && bird.images.length > 0 ? bird.images[0] : '';
            listHtml += `
                <div style="text-align: center; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" onclick="window.modalManager.close(); setTimeout(() => { window.modalManager.openBirdDetailsModal('${bird.name}') }, 100);">
                    <div style="width: 80px; height: 80px; margin: 0 auto; border-radius: 50%; overflow: hidden; border: 2px solid var(--primary-color);">
                        <img src="${imgUrl}" alt="${bird.name}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <div style="font-size: 0.8rem; margin-top: 5px; color: #e2e8f0; line-height: 1.2;">${bird.name}</div>
                </div>
            `;
        });
        
        listHtml += '</div>';

        const content = `
            <div class="modal-header" style="border-bottom: 1px solid rgba(255,255,255,0.1); padding: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; color: white;">Lista de Especies Nativas (${window.nativeBirdsData.length})</h3>
                <button class="modal-close" id="closeBirdListBtn" style="color: white; background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
            </div>
            <div class="modal-body" style="padding: 0; background: rgba(15,23,42,0.95);">
                ${listHtml}
            </div>
        `;
        
        this.createModal(content);
        this.modal.style.maxWidth = '800px';
        this.modal.style.padding = '0';
        
        document.getElementById('closeBirdListBtn').addEventListener('click', () => this.close());
    }



    close() {
        const existingOverlays = document.querySelectorAll('.modal-overlay');
        existingOverlays.forEach(el => el.remove());
        this.overlay = null;
        this.modal = null;
        document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    }

    setCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }

    showLoading(message = 'Cargando...') {
        const content = `
            <div class="modal-body text-center py-4">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>
        `;
        this.createModal(content);
    }

    showMessage(title, message, type = 'success') {
        const isError = type === 'error';
        const icon = isError ? '❌' : '✅';
        const color = isError ? '#ef4444' : '#10b981';
        const content = `
            <button class="modal-close" id="closeModalBtn" style="position:absolute; top:10px; right:15px; font-size:1.5rem; background:transparent; border:none; color:#cbd5e1; cursor:pointer; z-index: 10;">&times;</button>
            <div class="modal-body text-center py-4" style="padding: 2.5rem 2rem;">
                <div style="font-size: 3.5rem; margin-bottom: 1rem; text-shadow: 0 0 20px ${color}66;">${icon}</div>
                <h2 style="color: white; margin-bottom: 0.8rem; font-size: 1.5rem;">${title}</h2>
                <p style="color: #cbd5e1; font-size: 1.05rem; line-height: 1.5; margin-bottom: 1.5rem;">${message}</p>
                <button class="btn" id="acceptBtn" style="background: ${color}; color: white; border: none; padding: 0.8rem 2rem; border-radius: 8px; font-size: 1.05rem; font-weight: 600; box-shadow: 0 4px 15px ${color}40; transition: transform 0.2s; cursor: pointer;">Aceptar</button>
            </div>
        `;
        this.createModal(content);
        this.modal.style.maxWidth = '600px';
        this.modal.style.background = 'rgba(15,23,42,0.95)';
        this.modal.style.border = `1px solid ${color}40`;
        this.modal.style.boxShadow = `0 15px 40px rgba(0,0,0,0.6), 0 0 20px ${color}22`;
        this.modal.style.position = 'relative';

        document.getElementById('closeModalBtn').addEventListener('click', () => this.close());
        document.getElementById('acceptBtn').addEventListener('click', () => this.close());
        
        document.getElementById('acceptBtn').addEventListener('mouseover', function() { this.style.transform = 'translateY(-2px)'; });
        document.getElementById('acceptBtn').addEventListener('mouseout', function() { this.style.transform = 'translateY(0)'; });
    }

    showConfirm(title, message, onConfirmText = 'Aceptar', onCancelText = 'Cancelar', isDanger = false, onConfirm) {
        const confirmColor = isDanger ? '#ef4444' : '#10b981';
        const icon = isDanger ? '⚠️' : '❓';
        const content = `
            <div class="modal-body text-center py-4" style="background: rgba(15,23,42,0.95); border-radius: 12px; padding: 2rem; position: relative;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">${icon}</div>
                <h2 style="color: white; margin-bottom: 0.5rem; font-size: 1.4rem;">${title}</h2>
                <p style="color: #cbd5e1; margin-bottom: 1.5rem; font-size: 1rem; line-height: 1.5;">${message}</p>
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button class="btn btn-outline" id="cancelConfirmBtn" style="border-color: #64748b; color: #cbd5e1; padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer;">${onCancelText}</button>
                    <button class="btn" id="acceptConfirmBtn" style="background: ${confirmColor}; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer;">${onConfirmText}</button>
                </div>
            </div>
        `;
        this.createModal(content);
        this.modal.style.maxWidth = '500px';
        this.modal.style.padding = '0';
        this.modal.style.border = `1px solid ${confirmColor}66`;
        this.modal.style.boxShadow = `0 10px 30px rgba(0,0,0,0.5), 0 0 20px ${confirmColor}33`;

        document.getElementById('cancelConfirmBtn').addEventListener('click', () => {
            this.close();
        });
        document.getElementById('acceptConfirmBtn').addEventListener('click', () => {
            if (onConfirm) onConfirm();
            this.close();
        });
    }

    openEditSightingModal(sighting) {
        const content = `
            <div class="modal-header">
                <h2>Editar Avistamiento</h2>
                <button class="modal-close" id="closeEditSightingBtn">&times;</button>
            </div>
            <div class="modal-body">
                <form id="editSightingForm">
                    <div class="form-group" style="margin-bottom: 1rem;">
                        <label style="color: #cbd5e1;">Especie de Ave</label>
                        <select id="editSightingBirdName" name="bird_name" required style="width: 100%; padding: 0.8rem; border-radius: 8px; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); color: #fff;">
                            ${(window.nativeBirdsData || []).map(b => `<option value="${b.name}" ${b.name === sighting.bird_name ? 'selected' : ''}>${b.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom: 1rem;">
                        <label style="color: #cbd5e1;">Descripción / Notas</label>
                        <textarea id="editSightingDescription" name="description" rows="3" style="width: 100%; padding: 0.8rem; border-radius: 8px; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); color: #fff; resize: none;">${escapeHtml(sighting.description || '')}</textarea>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%; padding: 1rem; margin-top: 1rem;">Guardar Cambios</button>
                </form>
            </div>
        `;
        this.createModal(content);
        document.getElementById('closeEditSightingBtn').addEventListener('click', () => this.close());
        
        document.getElementById('editSightingForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const birdName = document.getElementById('editSightingBirdName').value;
            const description = document.getElementById('editSightingDescription').value;
            
            if (this.callbacks && this.callbacks.onEditSighting) {
                await this.callbacks.onEditSighting(sighting.id, { bird_name: birdName, description });
            }
        });
    }

    openSightingDetails(sighting) {
        let statusClass = 'badge-status';
        let statusText = 'Pendiente';
        if (sighting.status === 'approved') {
            statusClass += ' success';
            statusText = 'Aprobado';
        } else if (sighting.status === 'rejected') {
            statusClass += ' endangered';
            statusText = 'Rechazado';
        }
        
        let images = [];
        let imagenesArr = [];
        try {
            if (Array.isArray(sighting.imagenes)) {
                imagenesArr = sighting.imagenes;
            } else if (typeof sighting.imagenes === 'string' && sighting.imagenes.trim().startsWith('[')) {
                imagenesArr = JSON.parse(sighting.imagenes);
            }
        } catch(e) {
            console.error("Error parsing sighting.imagenes", e);
        }

        if (imagenesArr.length > 0) {
            images = imagenesArr.map(img => img.startsWith('http') ? img : window.APP_CONFIG.BASE_URL + img);
        } else if (sighting.image_url) {
            images = [sighting.image_url.startsWith('http') ? sighting.image_url : window.APP_CONFIG.BASE_URL + sighting.image_url];
        } else {
            images = ['./img-frontend/placeholder.png'];
        }

        const bubblesHtml = images.map((img, idx) => {
            const isMain = idx === 0;
            const size = isMain ? '280px' : '80px';
            const opacity = isMain ? '1' : '0.8';
            const order = isMain ? '0' : '1';
            return `
            <div class="bird-bubble" data-index="${idx}" onclick="window.selectBirdBubble(this)" style="position: relative; z-index: 1; width: ${size}; height: ${size}; order: ${order}; border-radius: 50%; padding: 4px; background: linear-gradient(135deg, #10b981, #3b82f6); background-size: 200% 200%; animation: gradientShift 5s ease infinite; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1); cursor: pointer; opacity: ${opacity}; flex-shrink: 0;">
                <div style="width: 100%; height: 100%; border-radius: 50%; overflow: hidden; background: #1e293b;">
                    <img src="${img}" alt="Reporte" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
            </div>
            `;
        }).join('');

        const content = `
            <button class="modal-close" id="closeModalBtn" style="position:absolute; top:15px; right:15px; z-index:50; font-size:2rem; background:rgba(0,0,0,0.6); width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; border:1px solid rgba(255,255,255,0.2); transition: background 0.3s; cursor: pointer;">&times;</button>
            <div class="modal-body hide-scrollbar" style="padding: 0; display: flex; flex-wrap: wrap; width: 100%; height: 100%; overflow-y: auto;">
                <div style="flex: 1 1 350px; position: relative; background: url('${images[0]}') center/cover no-repeat; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; padding: 2.5rem 1rem; min-height: 400px; overflow-y: auto;">
                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(5, 5, 10, 0.6); backdrop-filter: blur(6px); pointer-events: none; z-index: 0;"></div>
                    ${bubblesHtml}
                </div>
                <div style="flex: 1 1 350px; padding: 2.5rem; display: flex; flex-direction: column; background: rgba(15,23,42,0.95);">
                    <h2 style="font-size: 2.2rem; margin-bottom: 0.2rem; color: white;">${escapeHtml(sighting.bird_name || 'Desconocido')}</h2>
                    <h4 style="font-style: italic; color: var(--primary-light); margin-bottom: 1.2rem; font-size: 1.1rem; font-weight: 400;">Reporte por: ${escapeHtml(sighting.user_name || 'Usuario Anónimo')}</h4>
                    <div>
                        <span class="${statusClass}" style="font-size: 0.85rem; padding: 0.4rem 1rem; background: ${sighting.status === 'approved' ? '#10b981' : (sighting.status === 'rejected' ? '#ef4444' : '#eab308')}; color: white; border-radius: 20px;">${statusText}</span>
                    </div>
                    <div style="margin-top: 1.5rem;">
                        <h5 style="color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; font-size: 0.8rem; margin-bottom: 0.5rem;">Ubicación</h5>
                        <p style="color: #f8fafc; line-height: 1.6; font-size: 1rem;">📍 ${escapeHtml(sighting.location_name || 'Sin ubicación específica')}</p>
                    </div>
                    <div style="margin-top: 1.2rem; margin-bottom: 2rem;">
                        <h5 style="color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; font-size: 0.8rem; margin-bottom: 0.5rem;">Descripción / Notas</h5>
                        <p style="color: #f8fafc; line-height: 1.6; font-size: 1rem;">${escapeHtml(sighting.description || 'Sin notas.')}</p>
                    </div>
                    ${window.authManager && window.authManager.isAdmin() ? `
                    <div style="margin-top: auto; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.1);">
                        <h5 style="color: #ef4444; text-transform: uppercase; letter-spacing: 1px; font-size: 0.8rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">🛡️ Acciones de Administrador</h5>
                        <div style="display: flex; gap: 10px;">
                            ${sighting.status !== 'rejected' ? `<button class="btn btn-outline" style="flex: 1; border-color: #ef4444; color: #ef4444; font-size: 0.9rem;" onclick="window.modalManager.showConfirm('Suspender Avistamiento', '¿Estás seguro de que deseas suspender este avistamiento?', 'Suspender', 'Cancelar', true, () => window.adminManager.rejectSighting(${sighting.id}))">🚫 Suspender</button>` : ''}
                            <button class="btn" style="flex: 1; background: #ef4444; color: white; border-color: #ef4444; font-size: 0.9rem;" onclick="window.modalManager.showConfirm('Eliminar Avistamiento', '¿Eliminar definitivamente este avistamiento? Esta acción no se puede deshacer.', 'Eliminar', 'Cancelar', true, () => window.adminManager.deleteSighting(${sighting.id}))">🗑️ Eliminar</button>
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
        this.createModal(content);
        this.modal.style.maxWidth = '900px';
        this.modal.style.padding = '0';
        this.modal.style.maxHeight = '90vh';
        this.modal.style.overflow = 'hidden';
        this.modal.style.display = 'flex';
        this.modal.style.flexDirection = 'column';
        
        document.getElementById('closeModalBtn').addEventListener('click', () => this.close());
    }

    openBirdDetails(bird) {
        let statusClass = 'badge-status';
        if (bird.status === 'Vulnerable') statusClass += ' vulnerable';
        if (bird.status === 'En Peligro') statusClass += ' endangered';

        // Lógica global para interactuar con las burbujas (se sobrescribe si ya existe para evitar fugas)
        window.selectBirdBubble = function(element) {
            const container = element.parentElement;
            const bubbles = container.querySelectorAll('.bird-bubble');
            bubbles.forEach(b => {
                b.style.width = '80px';
                b.style.height = '80px';
                b.style.opacity = '0.6';
                b.style.order = '1';
            });
            element.style.width = '280px';
            element.style.height = '280px';
            element.style.opacity = '1';
            element.style.order = '0';
        };

        const bubblesHtml = bird.images.map((img, idx) => {
            const isMain = idx === 0;
            const size = isMain ? '280px' : '80px';
            const opacity = isMain ? '1' : '0.8';
            const order = isMain ? '0' : '1';
            return `
            <div class="bird-bubble" data-index="${idx}" onclick="window.selectBirdBubble(this)" style="position: relative; z-index: 1; width: ${size}; height: ${size}; order: ${order}; border-radius: 50%; padding: 4px; background: linear-gradient(135deg, #ff0f7b, #f89b29, #ff0f7b); background-size: 200% 200%; animation: gradientShift 5s ease infinite; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1); cursor: pointer; opacity: ${opacity}; flex-shrink: 0;">
                <div style="width: 100%; height: 100%; border-radius: 50%; overflow: hidden; background: #1e293b;">
                    <img src="${img}" alt="${bird.name}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
            </div>
            `;
        }).join('');

        const content = `
            <style>
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            </style>
            <button class="modal-close" id="closeModalBtn" style="position:absolute; top:15px; right:15px; z-index:50; font-size:2rem; background:rgba(0,0,0,0.6); width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; border:1px solid rgba(255,255,255,0.2); transition: background 0.3s; cursor: pointer;">&times;</button>
            <div class="modal-body hide-scrollbar" style="padding: 0; display: flex; flex-wrap: wrap; width: 100%; height: 100%; overflow-y: auto;">
                <div class="hide-scrollbar" style="flex: 1 1 350px; position: relative; background: url('./img-frontend/lg4.jpg') center/cover no-repeat; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; padding: 2.5rem 1rem; min-height: 400px; overflow-y: auto;">
                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(5, 5, 10, 0.6); backdrop-filter: blur(6px); pointer-events: none; z-index: 0;"></div>
                    ${bubblesHtml}
                </div>
                <div style="flex: 1 1 350px; padding: 2.5rem; display: flex; flex-direction: column; background: rgba(15,23,42,0.95);">
                    <h2 style="font-size: 2.2rem; margin-bottom: 0.2rem; color: white;">${bird.name}</h2>
                    <h4 style="font-style: italic; color: var(--primary-light); margin-bottom: 1.2rem; font-size: 1.1rem; font-weight: 400;">${bird.scientificName}</h4>
                    <div>
                        <span class="${statusClass}" style="font-size: 0.85rem; padding: 0.4rem 1rem;">${bird.status}</span>
                    </div>
                    <div style="margin-top: 1.5rem;">
                        <h5 style="color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; font-size: 0.8rem; margin-bottom: 0.5rem;">Hábitat</h5>
                        <p style="color: #f8fafc; line-height: 1.6; font-size: 1rem;">${bird.habitat}</p>
                    </div>
                    <div style="margin-top: 1.2rem; margin-bottom: 2rem;">
                        <h5 style="color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; font-size: 0.8rem; margin-bottom: 0.5rem;">Características</h5>
                        <p style="color: #f8fafc; line-height: 1.6; font-size: 1rem;">${bird.description}</p>
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: auto;">
                        <button class="btn btn-outline" style="flex: 1; display: flex; justify-content: center; align-items: center; gap: 8px; padding: 1rem; font-size: 1.05rem; border-color: #ef4444; color: #ef4444;" onclick="window.modalManager.openDietRescueModal(window.nativeBirdsData.find(b=>b.name==='${bird.name}'))" onmouseover="this.style.background='rgba(239, 68, 68, 0.1)'" onmouseout="this.style.background='transparent'">
                            🚑 Guía de Rescate
                        </button>
                        <button class="btn btn-primary" style="flex: 1; display: flex; justify-content: center; align-items: center; gap: 8px; padding: 1rem; font-size: 1.05rem;" onclick="window.showBirdOnMap('${bird.name}')">
                            🗺️ Ver en Mapa
                        </button>
                    </div>
                </div>
            </div>
        `;
        this.createModal(content);
        this.modal.style.maxWidth = '900px';
        this.modal.style.padding = '0';
        this.modal.style.maxHeight = '90vh';
        this.modal.style.overflow = 'hidden';
        this.modal.style.display = 'flex';
        this.modal.style.flexDirection = 'column';
        
        document.getElementById('closeModalBtn').addEventListener('click', () => this.close());
    }

    openSanctuaryDetails(sanctuaryKey) {
        const SANCTUARIES = {
            'restinga': {
                id: 'restinga',
                name: 'Laguna de La Restinga',
                badge: 'Parque Nacional / Manglares',
                location: 'Istmo de Margarita, Tubores',
                image: './img-frontend/sanctuary-restinga.png',
                description: 'La Laguna de La Restinga es un humedal de importancia internacional (Sitio Ramsar) y Parque Nacional que abarca más de 18.000 hectáreas. Consiste en un laberinto navegable de canales entre manglares rojos, negros y blancos, bordeado por una barra de arena de 23 km.',
                biodiversity: 'Es el refugio acuático y área de alimentación más valiosa de la isla para aves acuáticas y migratorias como el Flamenco del Caribe, Garzas Reales, Garzas Chusmitas, Pelícanos Pardos, Tijeretas y Corocoros Rojos.',
                speciesList: [
                    { name: 'Flamenco del Caribe', scientific: 'Phoenicopterus ruber', img: './img-frontend/flamenco del caribe.jpg' },
                    { name: 'Garceta Blanca', scientific: 'Egretta thula', img: './img-frontend/garcita blanca.jpg' },
                    { name: 'Pelícano Pardo', scientific: 'Pelecanus occidentalis', img: './img-frontend/pelicano pardo.jpg' },
                    { name: 'Corocora Roja', scientific: 'Eudocimus ruber', img: './img-frontend/corocora.jpg' },
                    { name: 'Tijereta de Mar', scientific: 'Fregata magnificens', img: './img-frontend/tijereta.jpg' }
                ],
                mapFilterType: 'type',
                mapFilterValue: 'Manglares'
            },
            'copey': {
                id: 'copey',
                name: 'Cerro El Copey',
                badge: 'Sierra Central / Selva Nublada',
                location: 'Parque Nacional Cerro El Copey, La Asunción',
                image: './img-frontend/sanctuary-copey.png',
                description: 'El Parque Nacional Cerro El Copey protege la cumbre más elevada de Nueva Esparta (casi 1.000m s.n.m.). Sus vertientes montañosas albergan una densa selva nublada e higrófila que actúa como esponja natural de agua dulce para toda la isla.',
                biodiversity: 'Refugio exclusivo de la avifauna de montaña y selva húmeda. Aquí habitan aves rapaces de gran porte, colibríes endémicos, el Carpintero del Copey, el Gavilán Habado y especies cantoras de dosel.',
                speciesList: [
                    { name: 'Gavilán Habado', scientific: 'Geranoaetus albicaudatus', img: './img-frontend/gavilan habado.jpg' },
                    { name: 'Carpintero Habado', scientific: 'Melanerpes rubricapillus', img: './img-frontend/carpintero.jfif' },
                    { name: 'Colibrí Coliazul', scientific: 'Chlorostilbon mellisugus', img: './img-frontend/coliazul.jfif' },
                    { name: 'Colibrí Anteado', scientific: 'Leucippus fallax', img: './img-frontend/colibri anteado.jfif' }
                ],
                mapFilterType: 'type',
                mapFilterValue: 'De Interior'
            },
            'macanao': {
                id: 'macanao',
                name: 'Península de Macanao',
                badge: 'Península Occidental / Reserva Árida',
                location: 'Península de Macanao, Nueva Esparta',
                image: './img-frontend/sanctuary-macanao.png',
                description: 'Un ecosistema xerófilo semiárido fascinante formado por bosques espinosos, quebradas secas de arena, tunales y cerros rojizos. Es el santuario de conservación terrestre más crítico de la Isla de Margarita.',
                biodiversity: 'Es el hábitat vital y principal sitio de reproducción de la amenazada Cotorra Margariteña (Amazona barbadensis), protegida activamente junto al Cardenalito Guajiro, Gonzalitos, Paraulatas Llaneras y Cuclillos.',
                speciesList: [
                    { name: 'Cotorra Margariteña', scientific: 'Amazona barbadensis', img: './img-frontend/cotorra.jpg' },
                    { name: 'Cardenalito Guajiro', scientific: 'Cardinalis phoeniceus', img: './img-frontend/cardenilla.jfif' },
                    { name: 'Gonzalito', scientific: 'Icterus nigrogularis', img: './img-frontend/gonzalito.jpg' },
                    { name: 'Paraulata Llanera', scientific: 'Mimus gilvus', img: './img-frontend/chiquia.JPG' },
                    { name: 'Cuclillo Ceniciento', scientific: 'Coccyzus melacoryphus', img: './img-frontend/cuclillo.jfif' }
                ],
                mapFilterType: 'category',
                mapFilterValue: 'En Peligro'
            }
        };

        const sanctuary = typeof sanctuaryKey === 'string' ? (SANCTUARIES[sanctuaryKey] || SANCTUARIES['restinga']) : sanctuaryKey;

        const speciesChipsHtml = sanctuary.speciesList.map(sp => `
            <div onclick="if(window.nativeBirdsData) { const b = window.nativeBirdsData.find(bird=>bird.name.toLowerCase().includes('${sp.name.toLowerCase()}') || bird.scientificName.toLowerCase().includes('${sp.scientific.toLowerCase()}')); if(b) { window.modalManager.close(); window.modalManager.openBirdDetails(b); } }" style="display: flex; align-items: center; gap: 0.6rem; padding: 0.5rem 0.9rem; background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 50px; cursor: pointer; transition: all 0.25s ease;" onmouseover="this.style.background='rgba(16, 185, 129, 0.2)'; this.style.borderColor='#10b981'; this.style.transform='translateY(-2px)';" onmouseout="this.style.background='rgba(255, 255, 255, 0.06)'; this.style.borderColor='rgba(255, 255, 255, 0.12)'; this.style.transform='translateY(0)';" title="Ver ficha de ${sp.name}">
                <img src="${sp.img}" alt="${sp.name}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover; border: 1.5px solid var(--primary-light);">
                <div style="display: flex; flex-direction: column;">
                    <span style="font-size: 0.85rem; font-weight: 600; color: #f8fafc; line-height: 1.1;">${sp.name}</span>
                    <span style="font-size: 0.72rem; font-style: italic; color: #94a3b8; line-height: 1.1;">${sp.scientific}</span>
                </div>
            </div>
        `).join('');

        const content = `
            <button class="modal-close" id="closeModalBtn" style="position:absolute; top:15px; right:15px; z-index:50; font-size:2rem; background:rgba(0,0,0,0.6); width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; border:1px solid rgba(255,255,255,0.2); transition: background 0.3s; cursor: pointer;">&times;</button>
            
            <div class="modal-body hide-scrollbar" style="padding: 0; display: flex; flex-direction: column; width: 100%; height: 100%; overflow-y: auto;">
                
                <!-- Hero Cover con Imagen de Portada -->
                <div style="position: relative; width: 100%; min-height: 280px; height: 38vh; background: url('${sanctuary.image}') center/cover no-repeat; display: flex; flex-direction: column; justify-content: flex-end; padding: 2rem;">
                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.35) 40%, transparent 70%); pointer-events: none;"></div>
                    
                    <div style="position: relative; z-index: 10;">
                        <span style="display: inline-block; padding: 0.35rem 0.9rem; background: rgba(16, 185, 129, 0.25); border: 1px solid rgba(16, 185, 129, 0.5); border-radius: 30px; color: #10b981; font-weight: 700; font-size: 0.8rem; letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 0.6rem; backdrop-filter: blur(8px);">
                            📍 ${sanctuary.badge}
                        </span>
                        <h2 style="font-size: 2.3rem; font-weight: 800; color: #ffffff; margin: 0 0 0.3rem 0; text-shadow: 0 4px 12px rgba(0,0,0,0.6); line-height: 1.1;">
                            ${sanctuary.name}
                        </h2>
                        <p style="color: #cbd5e1; margin: 0; font-size: 0.95rem; display: flex; align-items: center; gap: 0.4rem; opacity: 0.9;">
                            🗺️ <span>${sanctuary.location}</span>
                        </p>
                    </div>
                </div>

                <!-- Detalle del Santuario -->
                <div style="padding: 2rem; background: rgba(15, 23, 42, 0.98); display: flex; flex-direction: column; gap: 1.5rem;">
                    
                    <div>
                        <h4 style="color: var(--primary-light); text-transform: uppercase; letter-spacing: 1px; font-size: 0.8rem; margin: 0 0 0.5rem 0; font-weight: 700;">
                            🌳 Acerca del Ecosistema
                        </h4>
                        <p style="color: #f8fafc; line-height: 1.6; font-size: 0.98rem; margin: 0;">
                            ${sanctuary.description}
                        </p>
                    </div>

                    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 1.2rem;">
                        <h4 style="color: #f59e0b; text-transform: uppercase; letter-spacing: 1px; font-size: 0.8rem; margin: 0 0 0.5rem 0; font-weight: 700;">
                            🦩 Valor Ecológico & Biodiversidad
                        </h4>
                        <p style="color: #cbd5e1; line-height: 1.55; font-size: 0.95rem; margin: 0;">
                            ${sanctuary.biodiversity}
                        </p>
                    </div>

                    <div>
                        <h4 style="color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; font-size: 0.8rem; margin: 0 0 0.8rem 0; font-weight: 700;">
                            🦜 Especies Emblemáticas que lo Habitan (Haz clic para ver ficha)
                        </h4>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.6rem;">
                            ${speciesChipsHtml}
                        </div>
                    </div>

                    <!-- Botones de Acción -->
                    <div style="display: flex; gap: 1rem; margin-top: 0.8rem; flex-wrap: wrap;">
                        <button class="btn btn-primary" style="flex: 1 1 200px; display: flex; justify-content: center; align-items: center; gap: 8px; padding: 0.9rem 1.2rem; font-size: 1rem; border-radius: 10px;" onclick="window.modalManager.close(); window.location.hash='#/dashboard'; setTimeout(() => { if(window.filterMapBirds) window.filterMapBirds('${sanctuary.mapFilterType}', '${sanctuary.mapFilterValue}'); const mapEl = document.getElementById('map'); if(mapEl) mapEl.scrollIntoView({behavior: 'smooth', block: 'center'}); }, 500);">
                            🗺️ Explorar Aves en Mapa
                        </button>
                        
                        <button class="btn btn-outline" style="flex: 1 1 200px; display: flex; justify-content: center; align-items: center; gap: 8px; padding: 0.9rem 1.2rem; font-size: 1rem; border-radius: 10px; border-color: var(--primary-light); color: var(--primary-light);" onclick="window.modalManager.close(); window.location.hash='#/reportar'; setTimeout(() => { const el = document.getElementById('fullSightingLocationName'); if(el) el.value = '${sanctuary.name}'; }, 300);">
                            📷 Reportar Avistamiento Aquí
                        </button>
                    </div>

                </div>

            </div>
        `;

        this.createModal(content);
        this.modal.style.maxWidth = '850px';
        this.modal.style.padding = '0';
        this.modal.style.maxHeight = '90vh';
        this.modal.style.overflow = 'hidden';
        this.modal.style.display = 'flex';
        this.modal.style.flexDirection = 'column';
        
        document.getElementById('closeModalBtn').addEventListener('click', () => this.close());
    }

    openDietRescueModal(bird) {
        if (!bird.diet) return;
        
        let icon = '🌾';
        if (bird.diet.type.includes('Piscívora')) icon = '🐟';
        else if (bird.diet.type.includes('Carnívora')) icon = '🥩';
        else if (bird.diet.type.includes('Insectívora')) icon = '🐛';
        else if (bird.diet.type.includes('Omnívora')) icon = '🍎';
        else if (bird.diet.type.includes('Frugívora') || bird.diet.type.includes('Granívora')) icon = '🍉';
        else if (bird.diet.type.includes('Especializada') || bird.diet.type.includes('Filtradora') || bird.diet.type.includes('Herbívora')) icon = '🌿';

        const overlay = document.createElement('div');
        overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px); opacity: 0; transition: opacity 0.3s;';
        
        const content = `
            <div style="background: var(--bg-dark); width: 90%; max-width: 500px; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.8); border: 1px solid rgba(255,255,255,0.1); transform: translateY(-20px); transition: transform 0.3s; overflow: hidden;">
                <div style="background: rgba(239, 68, 68, 0.1); border-bottom: 1px solid rgba(239, 68, 68, 0.3); padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center;">
                    <h2 style="color: #ef4444; margin: 0; display: flex; align-items: center; gap: 10px; font-size: 1.3rem;">
                        <span style="font-size: 1.5rem;">🚑</span> Alerta de Rescate
                    </h2>
                    <button id="closeRescueBtn" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">&times;</button>
                </div>
                <div style="padding: 1.5rem; text-align: center;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">${icon}</div>
                    <h3 style="color: white; font-size: 1.3rem; margin-bottom: 0.5rem;">Dieta: ${bird.diet.type}</h3>
                    
                    <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 1.2rem; margin: 1rem 0; text-align: left;">
                        <h4 style="color: var(--primary-color); margin-bottom: 0.5rem; font-size: 1rem; margin-top: 0;">¿Qué darle de comer?</h4>
                        <p style="color: #cbd5e1; line-height: 1.5; font-size: 0.95rem; margin: 0;">${bird.diet.rescueFood}</p>
                    </div>
                    
                    <div style="background: rgba(239, 68, 68, 0.15); border-left: 4px solid #ef4444; padding: 1rem; border-radius: 4px; text-align: left; margin-bottom: 1.5rem;">
                        <strong style="color: #ef4444; display: block; margin-bottom: 0.3rem;">¡IMPORTANTE!</strong>
                        <span style="color: #f8fafc; font-size: 0.85rem;">Esta alimentación es solo para primeros auxilios temporales. Por favor, contacta a INPARQUES o a un veterinario de fauna silvestre lo antes posible.</span>
                    </div>
                    
                    <button class="btn btn-primary" style="width: 100%;" id="understoodBtn">Entendido</button>
                </div>
            </div>
        `;
        
        overlay.innerHTML = content;
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            overlay.style.opacity = '1';
            overlay.children[0].style.transform = 'translateY(0)';
        }, 10);
        
        const close = () => {
            overlay.style.opacity = '0';
            overlay.children[0].style.transform = 'translateY(-20px)';
            setTimeout(() => document.body.removeChild(overlay), 300);
        };
        
        overlay.querySelector('#closeRescueBtn').addEventListener('click', close);
        overlay.querySelector('#understoodBtn').addEventListener('click', close);
    }

    showUserListModal(users) {
        const adminUsers = users.filter(u => u.role === 'admin');
        const normalUsers = users.filter(u => u.role !== 'admin');

        const createTag = (u) => `
            <span style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.8rem; background: ${u.role === 'admin' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)'}; color: ${u.role === 'admin' ? '#10b981' : '#3b82f6'}; border-radius: 20px; font-size: 0.9rem; border: 1px solid ${u.role === 'admin' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)'}; margin: 0.2rem;">
                <span style="font-size: 1.1rem;">${u.role === 'admin' ? '🛡️' : '👤'}</span> 
                ${u.name} <small style="opacity:0.7">(${u.email})</small>
            </span>
        `;

        const content = `
            <div class="modal-header">
                <h2>Directorio de Usuarios</h2>
                <button class="modal-close" id="closeModalBtn">&times;</button>
            </div>
            <div class="modal-body py-4" style="max-height: 60vh; overflow-y: auto;">
                <div style="margin-bottom: 1.5rem;">
                    <h3 style="color: var(--text-muted); font-size: 1rem; margin-bottom: 0.8rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;">Administradores (${adminUsers.length})</h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                        ${adminUsers.map(createTag).join('')}
                    </div>
                </div>
                <div>
                    <h3 style="color: var(--text-muted); font-size: 1rem; margin-bottom: 0.8rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;">Usuarios Normales (${normalUsers.length})</h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                        ${normalUsers.length > 0 ? normalUsers.map(createTag).join('') : '<span style="color:var(--text-muted); font-size:0.9rem;">No hay usuarios normales registrados.</span>'}
                    </div>
                </div>
            </div>
        `;
        this.createModal(content);
        document.getElementById('closeModalBtn').addEventListener('click', () => this.close());
    }

    openFloatingZonesOverlay(birds, layoutMode = 'constellation') {
        if (!birds || !birds.length) return;
        
        // Si el overlay no existe, crearlo. Si ya existe, lo reusamos para el toggle
        if (!this.overlay || !document.body.contains(this.overlay)) {
            this.overlay = document.createElement('div');
            this.overlay.className = 'modal-overlay active hide-scrollbar';
            this.overlay.style.backdropFilter = 'blur(12px)';
            this.overlay.style.backgroundColor = 'rgba(10, 15, 30, 0.88)';
            this.overlay.style.display = 'block';
            this.overlay.style.position = 'fixed';
            this.overlay.style.top = '0';
            this.overlay.style.left = '0';
            this.overlay.style.width = '100vw';
            this.overlay.style.height = '100vh';
            this.overlay.style.overflowY = 'auto'; // Permitir scroll nativo de forma invisible
            this.overlay.style.zIndex = '9999';
            
            // El fondo ya no cierra el modal al hacer clic porque interfiere con el paneo (arrastrar).
            // Se debe usar el botón X para cerrar.
            document.body.appendChild(this.overlay);
            document.addEventListener('keydown', this.handleKeyDown.bind(this));
        }

        let birdBubblesHtml = '';
        let containerStyle = '';

        if (layoutMode === 'cloud') {
            containerStyle = 'position: relative; width: 100%; min-height: 100%; z-index: 1; display: flex; flex-wrap: wrap; justify-content: center; align-content: center; gap: 2rem; padding: 300px 50px 100px 50px; max-width: 1200px; margin: 0 auto;';
            birdBubblesHtml = birds.map((bird, idx) => {
                const duration = 3.5 + (idx % 4) * 0.8;
                const delay = (idx % 5) * 0.4;
                const randomOffset = (Math.random() * 80 - 40); 
                return `
                <div class="bird-zone-wrapper" style="position: relative; margin-top: ${randomOffset}px; cursor: pointer; padding: 15px; transition: z-index 0.3s;" onclick="window.showBirdOnMap('${bird.name}')" onmouseover="this.style.zIndex='10'; this.querySelector('.bird-scale-target').style.transform='scale(1.6)'; this.querySelector('.bird-name').style.opacity='1'" onmouseout="this.style.zIndex='1'; this.querySelector('.bird-scale-target').style.transform='scale(1)'; this.querySelector('.bird-name').style.opacity='0'">
                    <div class="bird-zone-floating" style="animation: floatBubble ${duration}s ease-in-out infinite alternate both; animation-delay: ${delay}s;">
                        <div class="bird-scale-target" style="display: flex; flex-direction: column; align-items: center; transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                            <div style="width: 100px; height: 100px; border-radius: 50%; border: 3px solid #f59e0b; overflow: hidden; box-shadow: 0 8px 25px rgba(0,0,0,0.7); margin-bottom: 12px; background: #1e293b;">
                                <img src="${bird.images[0]}" alt="${bird.name}" style="width: 100%; height: 100%; object-fit: cover;">
                            </div>
                            <span class="bird-name" style="color: #f8fafc; font-size: 0.95rem; text-align: center; max-width: 110px; line-height: 1.2; font-weight: 600; text-shadow: 0 3px 6px rgba(0,0,0,0.9); opacity: 0; transition: opacity 0.3s;">${bird.name}</span>
                        </div>
                    </div>
                </div>
                `;
            }).join('');
        } else if (layoutMode === 'constellation') {
            containerStyle = 'position: relative; width: 100%; min-height: 100vh; z-index: 1; padding-top: 150px;';
            
            // Dado que ahora tenemos zoom, podemos hacer la constelación mucho más amplia y orgánica
            const baseRadius = 260; 
            const radiusInner = baseRadius; 
            const radiusMid = baseRadius * 2.1;
            const radiusOuter = baseRadius * 3.3;
            const radiusFar = baseRadius * 4.6;

            const points = []; // Para guardar las coordenadas y dibujar líneas

            birdBubblesHtml = birds.map((bird, idx) => {
                let finalRadius, ringCapacity, indexInRing;
                if (idx < 7) { finalRadius = radiusInner; ringCapacity = 7; indexInRing = idx; }
                else if (idx < 22) { finalRadius = radiusMid; ringCapacity = 15; indexInRing = idx - 7; }
                else if (idx < 45) { finalRadius = radiusOuter; ringCapacity = 23; indexInRing = idx - 22; }
                else { finalRadius = radiusFar; ringCapacity = birds.length - 45; indexInRing = idx - 45; }

                const angleOffset = (finalRadius === radiusMid || finalRadius === radiusFar) ? (Math.PI / ringCapacity) : 0;
                
                // Añadir aleatoriedad orgánica controlada para evitar colisiones excesivas
                const randomAngle = (Math.random() * 0.25 - 0.125); 
                const randomRadius = (Math.random() * 60 - 30);
                
                const angle = ((indexInRing / ringCapacity) * 2 * Math.PI) + angleOffset + randomAngle;
                finalRadius += randomRadius;
                
                const translateX = Math.cos(angle) * finalRadius;
                const translateY = Math.sin(angle) * finalRadius;
                
                points.push({ x: translateX, y: translateY });
                
                const duration = 3.5 + (idx % 4) * 0.8;
                const delay = (idx % 5) * 0.4;
                
                return `
                <div class="bird-zone-wrapper" style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%) translate(${translateX}px, ${translateY}px); cursor: pointer; padding: 15px; transition: z-index 0.3s; z-index: 2;" onclick="window.showBirdOnMap('${bird.name}')" onmouseover="this.style.zIndex='10'; this.querySelector('.bird-scale-target').style.transform='scale(1.7)'; this.querySelector('.bird-name').style.opacity='1'" onmouseout="this.style.zIndex='2'; this.querySelector('.bird-scale-target').style.transform='scale(1)'; this.querySelector('.bird-name').style.opacity='0'">
                    <div class="bird-zone-floating" style="animation: floatBubble ${duration}s ease-in-out infinite alternate both; animation-delay: ${delay}s;">
                        <div class="bird-scale-target" style="display: flex; flex-direction: column; align-items: center; transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                            <div style="width: 90px; height: 90px; border-radius: 50%; border: 2px solid rgba(245, 158, 11, 0.6); overflow: hidden; box-shadow: 0 0 15px rgba(245, 158, 11, 0.2); margin-bottom: 12px; background: #0f172a;">
                                <img src="${bird.images[0]}" alt="${bird.name}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.95;">
                            </div>
                            <span class="bird-name" style="color: #f8fafc; font-size: 0.95rem; text-align: center; max-width: 110px; line-height: 1.2; font-weight: 600; text-shadow: 0 3px 6px rgba(0,0,0,0.9); opacity: 0; transition: opacity 0.3s;">${bird.name}</span>
                        </div>
                    </div>
                </div>
                `;
            }).join('');

            // Generar líneas de constelación SVG
            let svgLines = '';
            for (let i = 1; i < points.length; i++) {
                const p1 = points[i];
                const p2 = points[i - 1];
                const dist = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
                
                // Conectar con el ave anterior si están cerca
                if (dist < 400) {
                    svgLines += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="rgba(245, 158, 11, 0.25)" stroke-width="1.5" stroke-dasharray="5 5" />`;
                }
                
                // Conectar al azar con un ave de un anillo interior para cruzar líneas
                if (i > 7 && i % 3 === 0) {
                    const randomPrevIdx = Math.floor(Math.random() * (i - 2));
                    const p3 = points[randomPrevIdx];
                    const dist3 = Math.sqrt(Math.pow(p1.x - p3.x, 2) + Math.pow(p1.y - p3.y, 2));
                    if (dist3 < 550) {
                        svgLines += `<line x1="${p1.x}" y1="${p1.y}" x2="${p3.x}" y2="${p3.y}" stroke="rgba(255, 255, 255, 0.1)" stroke-width="1" />`;
                    }
                }
            }
            
            const svgBackground = `<svg style="position: absolute; top: 50%; left: 50%; width: 1px; height: 1px; overflow: visible; z-index: 0; pointer-events: none;">${svgLines}</svg>`;
            birdBubblesHtml = svgBackground + birdBubblesHtml;
            
        } else if (layoutMode === 'grid') {
            containerStyle = 'position: relative; width: 100%; min-height: 100%; z-index: 1; display: grid; grid-template-columns: repeat(auto-fit, 160px); justify-content: center; gap: 2rem; padding: 250px 50px 100px 50px; max-width: 1000px; margin: 0 auto;';
            birdBubblesHtml = birds.map((bird, idx) => {
                return `
                <div class="bird-zone-wrapper" style="cursor: pointer; padding: 15px; background: rgba(15,23,42,0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; display: flex; flex-direction: column; align-items: center; transition: transform 0.3s, box-shadow 0.3s, background 0.3s;" onclick="window.showBirdOnMap('${bird.name}')" onmouseover="this.style.transform='translateY(-10px) scale(1.15)'; this.style.boxShadow='0 10px 30px rgba(0,0,0,0.7)'; this.style.background='rgba(30,41,59,0.9)';" onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='none'; this.style.background='rgba(15,23,42,0.8)';">
                    <div style="width: 80px; height: 80px; border-radius: 50%; border: 2px solid #f59e0b; overflow: hidden; margin-bottom: 12px; background: #1e293b;">
                        <img src="${bird.images[0]}" alt="${bird.name}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <span class="bird-name" style="color: #f8fafc; font-size: 0.9rem; text-align: center; line-height: 1.2; font-weight: 500;">${bird.name}</span>
                </div>
                `;
            }).join('');
        }

        let nextMode, iconBtn, titleBtn;
        if (layoutMode === 'constellation') {
            nextMode = 'cloud';
            iconBtn = '☁️';
            titleBtn = 'Ver Nube Orgánica';
        } else if (layoutMode === 'cloud') {
            nextMode = 'grid';
            iconBtn = '🔲';
            titleBtn = 'Ver Tarjetas (Clásico)';
        } else {
            nextMode = 'constellation';
            iconBtn = '🌌';
            titleBtn = 'Ver Constelación';
        }

        const content = `
            <div id="overlay-content-wrapper" style="opacity: 0; transition: opacity 0.4s ease-in-out; width: 100%; height: 100%;">
                <style>
                    .hide-scrollbar::-webkit-scrollbar { display: none; }
                    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                    @keyframes floatBubble {
                        0% { transform: translateY(8px); }
                        100% { transform: translateY(-15px); }
                    }
                </style>
                
                <div style="position: fixed; top: 25px; right: 35px; z-index: 100; display: flex; gap: 1rem; align-items: center;">
                    <button onclick="window.modalManager.openFloatingZonesOverlay(window.nativeBirdsData, '${nextMode}')" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 8px 16px; border-radius: 20px; font-size: 0.95rem; font-weight: 500; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 10px rgba(0,0,0,0.3);" onmouseover="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='translateY(-2px)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'; this.style.transform='translateY(0)'">
                        ${iconBtn} ${titleBtn}
                    </button>
                    <button class="modal-close" id="closeOverlayBtn" style="font-size: 3rem; background: transparent; border: none; color: rgba(255,255,255,0.7); cursor: pointer; transition: all 0.3s; line-height: 1; padding: 0;" onmouseover="this.style.color='#fff'; this.style.transform='scale(1.2) rotate(90deg)'" onmouseout="this.style.color='rgba(255,255,255,0.7)'; this.style.transform='scale(1) rotate(0deg)'">&times;</button>
                </div>
                
                <!-- Encabezado fijo en la parte superior -->
                <div style="position: absolute; top: 40px; left: 50%; transform: translateX(-50%); text-align: center; pointer-events: none; z-index: 0; display: flex; flex-direction: column; align-items: center; width: 100%;">
                    <img src="./img-frontend/Captura_de_pantalla_2026-06-08_170731-removebg-preview.png" alt="Logo" style="height: 140px; opacity: 0.15; margin-bottom: 25px; filter: grayscale(50%) brightness(150%);">
                    <h2 style="color: rgba(255,255,255,0.4); font-size: 2.2rem; margin: 0; letter-spacing: 3px; font-weight: 300;">EXPLORAR ZONAS</h2>
                    <p style="color: rgba(255,255,255,0.25); margin-top: 12px; font-size: 1.1rem; letter-spacing: 1px;">Selecciona el ave que deseas ubicar</p>
                </div>
                
                <!-- Contenedor dinámico -->
                <div id="birds-container" style="${containerStyle}">
                    ${birdBubblesHtml}
                </div>
            </div>
        `;

        const renderNewContent = () => {
            this.overlay.innerHTML = content;
            document.getElementById('closeOverlayBtn').addEventListener('click', () => this.close());
            
            const wrapper = document.getElementById('overlay-content-wrapper');
            
            // Configurar Pan y Zoom solo para Constelación
            if (layoutMode === 'constellation') {
                const container = document.getElementById('birds-container');
                
                let scale = 1;
                let panX = 0;
                let panY = 0;
                let isDragging = false;
                let startX, startY;

                const updateTransform = () => {
                    container.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
                };
                
                container.style.transformOrigin = 'center center';
                container.style.transition = 'transform 0.1s cubic-bezier(0.2, 0, 0, 1)';

                wrapper.addEventListener('wheel', (e) => {
                    e.preventDefault();
                    const zoomIntensity = 0.08;
                    if (e.deltaY < 0) {
                        scale *= (1 + zoomIntensity);
                    } else {
                        scale /= (1 + zoomIntensity);
                    }
                    scale = Math.min(Math.max(0.2, scale), 4);
                    updateTransform();
                }, { passive: false });

                wrapper.addEventListener('mousedown', (e) => {
                    if (e.target.closest('button') || e.target.closest('.bird-zone-wrapper')) return;
                    isDragging = true;
                    startX = e.clientX - panX;
                    startY = e.clientY - panY;
                    wrapper.style.cursor = 'grabbing';
                });

                window.addEventListener('mousemove', (e) => {
                    if (!isDragging) return;
                    e.preventDefault();
                    panX = e.clientX - startX;
                    panY = e.clientY - startY;
                    updateTransform();
                });

                window.addEventListener('mouseup', () => {
                    if (isDragging) {
                        isDragging = false;
                        wrapper.style.cursor = 'default';
                    }
                });

                wrapper.addEventListener('touchstart', (e) => {
                    if (e.touches.length === 1 && !e.target.closest('button') && !e.target.closest('.bird-zone-wrapper')) {
                        isDragging = true;
                        startX = e.touches[0].clientX - panX;
                        startY = e.touches[0].clientY - panY;
                    }
                }, { passive: false });

                window.addEventListener('touchmove', (e) => {
                    if (!isDragging || e.touches.length !== 1) return;
                    e.preventDefault();
                    panX = e.touches[0].clientX - startX;
                    panY = e.touches[0].clientY - startY;
                    updateTransform();
                }, { passive: false });

                window.addEventListener('touchend', () => {
                    isDragging = false;
                });
            }
            
            // Disparar el fade in de forma asíncrona para que se aplique la transición CSS
            requestAnimationFrame(() => {
                if (wrapper) wrapper.style.opacity = '1';
            });
        };

        const existingWrapper = document.getElementById('overlay-content-wrapper');
        if (existingWrapper) {
            // Si ya hay contenido, hacemos fade-out, luego cambiamos la vista, luego fade-in
            existingWrapper.style.opacity = '0';
            setTimeout(renderNewContent, 400); // 400ms es el tiempo de la transición
        } else {
            // Si es la primera vez que se abre
            renderNewContent();
        }
    }

    openAchievementsModal(achievementsList = []) {
        const unlockedCount = achievementsList.filter(a => a.is_unlocked).length;
        const totalCount = achievementsList.length || 30;

        const renderItems = (items) => {
            if (!items || items.length === 0) {
                return `<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">No se encontraron medallas en este filtro.</div>`;
            }
            return items.map(a => {
                const earned = a.is_unlocked;
                const dateStr = a.unlocked_at ? new Date(a.unlocked_at).toLocaleDateString('es-ES') : '';
                return `
                    <div class="ach-card ${earned ? 'ach-card-unlocked' : 'ach-card-locked'}">
                        <div class="ach-card-icon">${a.icon || '🏆'}</div>
                        <div class="ach-card-info">
                            <div class="ach-card-title">
                                <span>${a.name}</span>
                                ${earned ? '<span style="color: #10b981; font-size: 1rem;">✓</span>' : '<span style="color: #64748b; font-size: 0.9rem;">🔒</span>'}
                            </div>
                            <div class="ach-card-desc">${a.description}</div>
                            ${earned && dateStr ? `<div class="ach-card-date">✓ Obtenido el ${dateStr}</div>` : `<div style="font-size: 0.72rem; color: #64748b; margin-top: 4px;">Pendiente de desbloqueo</div>`}
                        </div>
                    </div>
                `;
            }).join('');
        };

        const content = `
            <div style="position: relative; width: 100%; max-width: 950px; max-height: 88vh; background: var(--bg-card); border-radius: 20px; border: 1px solid rgba(255,255,255,0.15); display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 60px rgba(0,0,0,0.5);">
                
                <!-- Close Button -->
                <button class="modal-close" id="closeModalBtn" style="position: absolute; top: 16px; right: 20px; z-index: 50; font-size: 1.8rem; background: rgba(0,0,0,0.3); width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--text-main); border: 1px solid rgba(255,255,255,0.2); cursor: pointer;">&times;</button>

                <!-- Header -->
                <div style="padding: 1.8rem 2rem 1.2rem 2rem; border-bottom: 1px solid rgba(255,255,255,0.1); background: linear-gradient(to right, rgba(16, 185, 129, 0.1), transparent);">
                    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
                        <div>
                            <span style="display: inline-block; padding: 0.25rem 0.75rem; background: rgba(16, 185, 129, 0.2); border-radius: 20px; color: #10b981; font-weight: 700; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.4rem;">
                                🏆 Medallero de Biodiversidad
                            </span>
                            <h2 style="font-size: 1.8rem; font-weight: 800; margin: 0; color: var(--text-main); line-height: 1.2;">
                                Logros y Medallas de Nueva Esparta
                            </h2>
                            <p style="margin: 0.3rem 0 0 0; color: var(--text-muted); font-size: 0.9rem;">
                                Completa retos observando especies locales y registrando avistamientos en la isla.
                            </p>
                        </div>

                        <!-- Progress Badge -->
                        <div style="background: rgba(16, 185, 129, 0.15); border: 1.5px solid #10b981; border-radius: 14px; padding: 0.6rem 1.2rem; text-align: center;">
                            <div style="font-size: 1.5rem; font-weight: 800; color: #10b981; line-height: 1;">
                                ${unlockedCount} / ${totalCount}
                            </div>
                            <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600; margin-top: 2px;">
                                Desbloqueados
                            </div>
                        </div>
                    </div>

                    <!-- Filter Bar & Search -->
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-top: 1.2rem; flex-wrap: wrap;">
                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                            <button id="achFilterAll" class="glass-button" style="padding: 0.4rem 0.9rem; font-size: 0.82rem; border-radius: 20px; background: var(--primary-color); color: white; border: none; cursor: pointer;">
                                Todos (${totalCount})
                            </button>
                            <button id="achFilterUnlocked" class="glass-button" style="padding: 0.4rem 0.9rem; font-size: 0.82rem; border-radius: 20px; background: rgba(255,255,255,0.06); color: var(--text-main); border: 1px solid rgba(255,255,255,0.15); cursor: pointer;">
                                Desbloqueados 🔓 (${unlockedCount})
                            </button>
                            <button id="achFilterLocked" class="glass-button" style="padding: 0.4rem 0.9rem; font-size: 0.82rem; border-radius: 20px; background: rgba(255,255,255,0.06); color: var(--text-main); border: 1px solid rgba(255,255,255,0.15); cursor: pointer;">
                                Bloqueados 🔒 (${totalCount - unlockedCount})
                            </button>
                        </div>

                        <input type="text" id="achSearchInput" placeholder="🔍 Buscar logro por nombre..." style="padding: 0.45rem 0.9rem; border-radius: 20px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.2); color: var(--text-main); font-size: 0.82rem; width: 220px; outline: none;">
                    </div>
                </div>

                <!-- Grid Scroll Body -->
                <div id="achievementsGridContainer" class="hide-scrollbar" style="padding: 1.5rem; overflow-y: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 1rem; align-content: start; flex: 1;">
                    ${renderItems(achievementsList)}
                </div>
            </div>
        `;

        this.open(content);

        // Bind filter event handlers
        setTimeout(() => {
            const grid = document.getElementById('achievementsGridContainer');
            const searchInput = document.getElementById('achSearchInput');
            const btnAll = document.getElementById('achFilterAll');
            const btnUnlocked = document.getElementById('achFilterUnlocked');
            const btnLocked = document.getElementById('achFilterLocked');

            let currentFilter = 'all';

            const updateGrid = () => {
                const query = (searchInput?.value || '').toLowerCase().trim();
                let filtered = achievementsList;

                if (currentFilter === 'unlocked') filtered = filtered.filter(a => a.is_unlocked);
                else if (currentFilter === 'locked') filtered = filtered.filter(a => !a.is_unlocked);

                if (query) {
                    filtered = filtered.filter(a => (a.name || '').toLowerCase().includes(query) || (a.description || '').toLowerCase().includes(query));
                }

                if (grid) grid.innerHTML = renderItems(filtered);
            };

            const setTabActive = (activeBtn) => {
                [btnAll, btnUnlocked, btnLocked].forEach(btn => {
                    if (btn) {
                        btn.style.background = 'rgba(255,255,255,0.06)';
                        btn.style.color = 'var(--text-main)';
                        btn.style.border = '1px solid rgba(255,255,255,0.15)';
                    }
                });
                if (activeBtn) {
                    activeBtn.style.background = 'var(--primary-color)';
                    activeBtn.style.color = 'white';
                    activeBtn.style.border = 'none';
                }
            };

            btnAll?.addEventListener('click', () => { currentFilter = 'all'; setTabActive(btnAll); updateGrid(); });
            btnUnlocked?.addEventListener('click', () => { currentFilter = 'unlocked'; setTabActive(btnUnlocked); updateGrid(); });
            btnLocked?.addEventListener('click', () => { currentFilter = 'locked'; setTabActive(btnLocked); updateGrid(); });
            searchInput?.addEventListener('input', updateGrid);
        }, 100);
    }
}
