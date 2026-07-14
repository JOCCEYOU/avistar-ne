import { ApiClient } from './classes/ApiClient.js';
import { AuthManager } from './classes/AuthManager.js';
import { SightingManager } from './classes/SightingManager.js';
import { MapManager } from './classes/MapManager.js';
import { ModalManager } from './classes/ModalManager.js';
import { StatsManager } from './classes/StatsManager.js';
import { ActivityFeed } from './classes/ActivityFeed.js';
import { Router } from './classes/Router.js';
import { OfflineQueue } from './utils/OfflineQueue.js';
import { TriviaManager } from './classes/TriviaManager.js';
import { escapeHtml } from './utils/helpers.js';

window.escapeHtml = escapeHtml;


// Service Worker Registration (PWA)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => {
                console.log('[PWA] Service Worker registrado con éxito:', reg.scope);
                // Forzar recarga automática cuando se instala un nuevo Service Worker
                reg.onupdatefound = () => {
                    const installingWorker = reg.installing;
                    if (installingWorker) {
                        installingWorker.onstatechange = () => {
                            if (installingWorker.state === 'installed') {
                                if (navigator.serviceWorker.controller) {
                                    console.log('[PWA] Nueva versión detectada, recargando página para aplicar cambios...');
                                    window.location.reload();
                                }
                            }
                        };
                    }
                };
            })
            .catch(err => console.warn('[PWA] Error registrando Service Worker:', err));
    });
}

// Inicialización del Tema
const savedTheme = localStorage.getItem('theme') || 'dark';
if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
}

function syncThemeIcons() {
    const isLight = document.body.classList.contains('light-theme');
    document.querySelectorAll('.theme-icon-el').forEach(el => {
        el.textContent = isLight ? '🌙' : '☀️';
    });
}

document.addEventListener('DOMContentLoaded', syncThemeIcons);

// ======================================================
// NAVBAR AUTO-HIDE ON SCROLL (Aplica en TODAS las vistas)
// Oculta la navbar al bajar, la muestra al subir.
// ======================================================
(function initNavbarScrollBehavior() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;

    let lastScrollY = 0;
    let ticking = false;
    const SCROLL_THRESHOLD = 20; // px mínimos para activar el cambio

    // Añadir la transición de transform al navbar via JS para no tocar CSS base
    nav.style.transition = 'transform 0.38s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.38s ease';
    nav.style.willChange = 'transform';

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const currentScrollY = window.scrollY;
                const delta = currentScrollY - lastScrollY;

                if (delta > SCROLL_THRESHOLD) {
                    // Scrolling DOWN → ocultar navbar
                    nav.style.transform = 'translateY(calc(-100% - 16px))';
                    nav.style.opacity = '0';
                    nav.style.pointerEvents = 'none';
                } else if (delta < -SCROLL_THRESHOLD) {
                    // Scrolling UP → mostrar navbar
                    nav.style.transform = 'translateY(0)';
                    nav.style.opacity = '1';
                    nav.style.pointerEvents = '';
                }

                // Siempre mostrar en el tope de la página
                if (currentScrollY <= 10) {
                    nav.style.transform = 'translateY(0)';
                    nav.style.opacity = '1';
                    nav.style.pointerEvents = '';
                }

                lastScrollY = currentScrollY;
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
})();

// Listener para navegación (popstate)
window.addEventListener('popstate', () => {
    if (window.authManager) {
        window.authManager.loadSession();
        updateUIForAuth();
    }
});

window.toggleTheme = () => {
    const isLight = document.body.classList.toggle('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    syncThemeIcons();
};

// Inicialización de la aplicación
// Instanciar clases base
const api = new ApiClient();
const auth = new AuthManager(api);
const sightingManager = new SightingManager(api);
const modalManager = new ModalManager();
const router = new Router();
const offlineQueue = new OfflineQueue();
const triviaManager = new TriviaManager();

offlineQueue.initAutoSync(sightingManager, modalManager);

// Variables globales para facilitar el acceso
window.api = api;
window.modalManager = modalManager;
window.authManager = auth;
window.sightingManager = sightingManager;
window.offlineQueue = offlineQueue;
window.triviaManager = triviaManager;

auth.addListener((authInst) => {
    updateUIForAuth(authInst.isAuthenticated);
});


// Cargar AdminManager
const adminScript = document.createElement('script');
adminScript.src = './assets/js/classes/AdminManager.js?v=' + Date.now();
adminScript.onload = () => {
    window.adminManager = new window.AdminManager();
};
document.head.appendChild(adminScript);

// Configurar Modals
modalManager.setCallbacks({
    onLogin: async (email, password) => {
        console.log('[App] onLogin callback triggered with:', email);
        modalManager.showLoading('Iniciando sesión...');
        const result = await auth.login(email, password);
        console.log('[App] auth.login result:', result);
        if (result.success) {
            modalManager.showMessage('¡Bienvenido!', 'Has iniciado sesión correctamente.');
            updateUIForAuth(true);
            router.navigate('/dashboard');
        } else {
            modalManager.showMessage('Error', result.error, 'error');
        }
    },
    onRegister: async (userData) => {
        console.log('[App] onRegister callback triggered with name/email:', { name: userData.name, email: userData.email });
        modalManager.showLoading('Registrando usuario...');
        const result = await auth.register(userData);
        console.log('[App] auth.register result:', result);
        if (result.success) {
            modalManager.showMessage('¡Registro exitoso!', 'Tu cuenta ha sido creada.');
            updateUIForAuth(true);
            router.navigate('/dashboard');
        } else {
            modalManager.showMessage('Error', result.error, 'error');
        }
    },
    onSightingSubmit: async (sightingData) => {
        modalManager.showLoading('Enviando avistamiento...');
        const result = await sightingManager.create(sightingData);
        if (result.success) {
            modalManager.showMessage('¡Reportado!', 'El avistamiento se ha registrado con éxito.');
            // Recargar datos en el mapa y feed
            loadDashboardData();
        } else {
            modalManager.showMessage('Error', result.error, 'error');
        }
    },
    loadSpecies: async () => {
        try {
            const speciesList = window.nativeBirdsData || [];
            const select = document.getElementById('sightingBirdName');
            if (select) {
                select.innerHTML = '<option value="">Selecciona una especie...</option>';
                // Opción especial: Especie Desconocida (primera del listado)
                const unknownOpt = document.createElement('option');
                unknownOpt.value = 'Especie Desconocida';
                unknownOpt.textContent = '❓ Especie Desconocida (para revisión posterior)';
                unknownOpt.style.color = '#f59e0b';
                unknownOpt.style.fontStyle = 'italic';
                select.appendChild(unknownOpt);
                // Separador visual
                const sep = document.createElement('option');
                sep.disabled = true;
                sep.textContent = '──────────────────────';
                select.appendChild(sep);
                // Ordenar alfabéticamente el resto
                const sorted = [...speciesList].sort((a, b) => a.name.localeCompare(b.name));
                sorted.forEach(sp => {
                    const option = document.createElement('option');
                    option.value = sp.name;
                    option.textContent = sp.name;
                    select.appendChild(option);
                });
            }
        } catch (err) {
            console.error('Error cargando especies', err);
        }
    }
});

// Escuchar cambios de autenticación
auth.addListener((manager) => {
    updateUIForAuth(manager.isAuthenticated);
});

// Función para actualizar UI según auth
function updateUIForAuth(isAuthenticated = auth.isAuthenticated) {
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    const adminLink = document.getElementById('adminLink');
    const trigger = document.getElementById('userDropdownTrigger');
    const roleDisplay = document.getElementById('userRoleDisplay');
    const heroJoinBtn = document.getElementById('heroJoinBtn');

    if (isAuthenticated) {
        if (authButtons) authButtons.style.display = 'none';
        if (heroJoinBtn) heroJoinBtn.style.display = 'none';
        if (userMenu) {
            userMenu.style.display = 'flex';
            const name = auth.currentUser?.name || 'Usuario';
            const email = auth.currentUser?.email || 'correo@ejemplo.com';
            const isAdmin = auth.isAdmin();

            document.getElementById('userNameDisplay').textContent = name;
            document.getElementById('dropdownUserName').textContent = name;
            document.getElementById('dropdownUserEmail').textContent = email;

            if (roleDisplay) {
                roleDisplay.textContent = isAdmin ? '🛡️ ADMIN' : 'Avistador 🌿';
                roleDisplay.style.color = isAdmin ? '#f59e0b' : '#10b981';
            }

            if (trigger) {
                if (isAdmin) {
                    trigger.classList.remove('user-role-normal');
                    trigger.classList.add('user-role-admin');
                } else {
                    trigger.classList.remove('user-role-admin');
                    trigger.classList.add('user-role-normal');
                }
            }
        }
        if (adminLink) {
            adminLink.classList.toggle('admin-approved-user', auth.isAdmin());
        }
        document.querySelectorAll('.admin-only-element').forEach(el => {
            el.classList.toggle('admin-approved-user', auth.isAdmin());
        });
        checkUserNotifications();
        window._syncMobileDrawerAuth && window._syncMobileDrawerAuth();
    } else {
        if (authButtons) authButtons.style.display = 'flex';
        if (heroJoinBtn) heroJoinBtn.style.display = 'inline-block';
        if (userMenu) userMenu.style.display = 'none';
        if (adminLink) {
            adminLink.classList.remove('admin-approved-user');
        }
        document.getElementById('userDropdownMenu').style.display = 'none'; // ocultar si estaba abierto
        document.querySelectorAll('.admin-only-element').forEach(el => {
            el.classList.remove('admin-approved-user');
        });
        window._syncMobileDrawerAuth && window._syncMobileDrawerAuth();
    }
}

// Dropdown Logic
const dropdownTrigger = document.getElementById('userDropdownTrigger');
const dropdownMenu = document.getElementById('userDropdownMenu');

if (dropdownTrigger && dropdownMenu) {
    dropdownTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isVisible = dropdownMenu.style.display === 'flex';
        dropdownMenu.style.display = isVisible ? 'none' : 'flex';
    });

    // Ocultar si hace clic fuera
    document.addEventListener('click', (e) => {
        if (!dropdownMenu.contains(e.target) && !dropdownTrigger.contains(e.target)) {
            dropdownMenu.style.display = 'none';
        }
    });

    // Esconder el menú al hacer click en algún link del dropdown
    dropdownMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            dropdownMenu.style.display = 'none';
        });
    });
}

// Lógica de la Campana de Notificaciones
const notifTrigger = document.getElementById('notificationsTrigger');
const notifDropdown = document.getElementById('notificationsDropdown');
const notifBadge = document.getElementById('notificationBadge');
const notifList = document.getElementById('notificationsList');
const clearNotifBtn = document.getElementById('clearNotificationsBtn');

// Elementos de Notificaciones en Móvil
const mobileNotifLink = document.getElementById('mobileNotificationsLink');
const mobileNotifDropdown = document.getElementById('mobileNotificationsDropdown');
const mobileNotifBadge = document.getElementById('mobileNotificationBadge');
const mobileNotifList = document.getElementById('mobileNotificationsList');
const mobileClearNotifBtn = document.getElementById('mobileClearNotificationsBtn');

async function checkUserNotifications() {
    if (!auth.isAuthenticated || !auth.currentUser) return;
    try {
        const notifications = [];

        if (auth.isAdmin()) {
            // Notificaciones para el Administrador
            const allSightings = await sightingManager.fetchAll().catch(() => []);
            const pendingSightings = (allSightings || []).filter(s => s.status === 'pending');

            pendingSightings.forEach(s => {
                const date = new Date(s.sighted_at || s.created_at).toLocaleDateString('es-ES');
                notifications.push({
                    id: `admin-pending-${s.id}`,
                    type: 'pending',
                    icon: '📥',
                    title: 'Nuevo Reporte Pendiente',
                    message: `El usuario <strong>"${s.user_name || 'Anónimo'}"</strong> reportó a <strong>"${s.bird_name}"</strong>.`,
                    date: date,
                    link: '#/admin'
                });
            });
        } else {
            // Notificaciones para el Usuario normal
            const [sightings, achievements] = await Promise.all([
                sightingManager.getByUser(auth.currentUser.id).catch(() => []),
                api.get('/users/me/achievements').catch(() => [])
            ]);

            // Avistamientos Aprobados y Rechazados
            (sightings || []).forEach(s => {
                const date = new Date(s.sighted_at || s.created_at).toLocaleDateString('es-ES');
                if (s.status === 'approved') {
                    notifications.push({
                        id: `sighting-app-${s.id}`,
                        type: 'approval',
                        icon: '✅',
                        title: 'Avistamiento Aprobado',
                        message: `Tu reporte de <strong>"${s.bird_name}"</strong> fue aprobado y publicado.`,
                        date: date
                    });
                } else if (s.status === 'rejected') {
                    notifications.push({
                        id: `sighting-rej-${s.id}`,
                        type: 'rejection',
                        icon: '❌',
                        title: 'Avistamiento Rechazado',
                        message: `Tu reporte de <strong>"${s.bird_name}"</strong> no fue aprobado.`,
                        date: date
                    });
                }
            });

            // Notificaciones por medallas/logros desbloqueados
            const unlockedBadges = (achievements || []).filter(b => b.is_unlocked);
            unlockedBadges.forEach(b => {
                const date = b.unlocked_at ? new Date(b.unlocked_at).toLocaleDateString('es-ES') : '';
                notifications.push({
                    id: `badge-${b.id}`,
                    type: 'badge',
                    icon: b.icon || '🏆',
                    title: '¡Nueva Medalla Desbloqueada!',
                    message: `Desbloqueaste <strong>"${b.name}"</strong>: ${b.description}`,
                    date: date
                });
            });
        }

        const readIds = JSON.parse(localStorage.getItem(`read_notifs_${auth.currentUser.id}`) || '[]');
        const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

        if (notifBadge) {
            if (unreadCount > 0) {
                notifBadge.textContent = unreadCount;
                notifBadge.style.display = 'flex';
            } else {
                notifBadge.style.display = 'none';
            }
        }

        if (mobileNotifBadge) {
            if (unreadCount > 0) {
                mobileNotifBadge.textContent = unreadCount;
                mobileNotifBadge.style.display = 'inline-block';
            } else {
                mobileNotifBadge.style.display = 'none';
            }
        }

        const notifHtmlContent = notifications.length === 0 
            ? '<div style="text-align: center; color: #94a3b8; padding: 1rem; font-size: 0.85rem;">No tienes notificaciones por el momento.</div>'
            : notifications.map(n => {
                const isRead = readIds.includes(n.id);
                return `
                    <div style="padding: 0.6rem 0.8rem; background: ${isRead ? 'rgba(255,255,255,0.02)' : 'rgba(16,185,129,0.08)'}; border-radius: 8px; border-left: 3px solid ${isRead ? '#475569' : '#10b981'}; font-size: 0.85rem; cursor: pointer;" onclick="${n.link ? `location.href='${n.link}'; if(window.closeMobileMenu) window.closeMobileMenu();` : ''}">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.2rem;">
                            <span style="font-weight: 600; color: #f8fafc;">${n.icon} ${n.title}</span>
                            ${n.date ? `<span style="font-size: 0.7rem; color: #94a3b8;">${n.date}</span>` : ''}
                        </div>
                        <div style="color: #cbd5e1; font-size: 0.8rem; line-height: 1.3;">${n.message}</div>
                    </div>
                `;
            }).join('');

        if (notifList) {
            notifList.innerHTML = notifHtmlContent;
        }

        if (mobileNotifList) {
            mobileNotifList.innerHTML = notifHtmlContent;
        }
    } catch (err) {
        console.error('Error al verificar notificaciones:', err);
    }
}

if (notifTrigger && notifDropdown) {
    notifTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        if (dropdownMenu) dropdownMenu.style.display = 'none';
        const isVisible = notifDropdown.style.display === 'flex';
        notifDropdown.style.display = isVisible ? 'none' : 'flex';
        if (!isVisible) checkUserNotifications();
    });

    document.addEventListener('click', (e) => {
        if (!notifDropdown.contains(e.target) && !notifTrigger.contains(e.target)) {
            notifDropdown.style.display = 'none';
        }
    });
}

// Lógica de Notificaciones en Móvil (Acordeón)
if (mobileNotifLink && mobileNotifDropdown) {
    mobileNotifLink.addEventListener('click', (e) => {
        e.preventDefault();
        const isVisible = mobileNotifDropdown.style.display === 'flex';
        mobileNotifDropdown.style.display = isVisible ? 'none' : 'flex';
        if (!isVisible) checkUserNotifications();
    });
}

const clearNotificationsHandler = async () => {
    if (!auth.currentUser) return;

    let allIds = [];
    if (auth.isAdmin()) {
        const allSightings = await sightingManager.fetchAll().catch(() => []);
        allIds = (allSightings || []).filter(s => s.status === 'pending').map(s => `admin-pending-${s.id}`);
    } else {
        const [sightings, achievements] = await Promise.all([
            sightingManager.getByUser(auth.currentUser.id).catch(() => []),
            api.get('/users/me/achievements').catch(() => [])
        ]);
        allIds = [
            ...(sightings || []).filter(s => s.status === 'approved').map(s => `sighting-app-${s.id}`),
            ...(sightings || []).filter(s => s.status === 'rejected').map(s => `sighting-rej-${s.id}`),
            ...(achievements || []).filter(b => b.is_unlocked).map(b => `badge-${b.id}`)
        ];
    }

    localStorage.setItem(`read_notifs_${auth.currentUser.id}`, JSON.stringify(allIds));
    checkUserNotifications();
};

if (clearNotifBtn) {
    clearNotifBtn.addEventListener('click', clearNotificationsHandler);
}

if (mobileClearNotifBtn) {
    mobileClearNotifBtn.addEventListener('click', (e) => {
        e.preventDefault();
        clearNotificationsHandler();
    });
}

// Revisar notificaciones periódicamente si está autenticado
setInterval(() => {
    if (auth.isAuthenticated) checkUserNotifications();
}, 30000);

// Logout Logic
const btnLogout = document.getElementById('btnLogout');
if (btnLogout) {
    btnLogout.addEventListener('click', (e) => {
        e.preventDefault();
        auth.logout();
    });
}

// Configurar Rutas
router.add('/', () => {
    showView('landing-view');
    document.getElementById('main-nav').style.display = 'flex';
    if (window.triviaManager) window.triviaManager.init();
});


router.add('/usuarios', () => {
    if (!window.authManager || !window.authManager.isAdmin()) {
        router.navigate('/');
        return;
    }
    showView('admin-users-view');
    document.getElementById('main-nav').style.display = 'flex';
    // Ensure AdminManager is available and fetch list
    if (window.adminManager) {
        window.adminManager.fetchAndRenderUserList();
    }
});

router.add('/perfil', async () => {
    if (!auth.isAuthenticated) {
        router.navigate('/');
        modalManager.openLogin();
        return;
    }

    showView('profile-view');
    document.getElementById('main-nav').style.display = 'flex';

    // Llenar datos de la tarjeta izquierda
    document.getElementById('profileUserName').textContent = auth.currentUser?.name || 'Usuario';
    document.getElementById('profileUserEmail').textContent = auth.currentUser?.email || '';

    // Cargar logros y medallas dinámicas
    const badgesContainer = document.getElementById('profileBadgesContainer');
    if (badgesContainer) {
        badgesContainer.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 1rem;">Cargando logros...</div>';
        try {
            const achievements = await api.get('/users/me/achievements');
            window.userAchievements = achievements;
            let badgesHTML = '';
            if (Array.isArray(achievements) && achievements.length > 0) {
                const unlockedCount = achievements.filter(a => a.is_unlocked).length;
                badgesHTML += `
                    <button onclick="window.modalManager.openAchievementsModal(window.userAchievements || [])" class="glass-button" style="width: 100%; margin-bottom: 1.2rem; padding: 0.85rem 1rem; border-radius: 12px; background: linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(6, 182, 212, 0.25)); border: 1.5px solid #10b981; color: var(--text-main); font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.6rem; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(16,185,129,0.2);" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                        <span style="font-size: 1.2rem;">🏆</span>
                        <span>Ver Menú Completo de 30 Medallas (${unlockedCount}/${achievements.length})</span>
                    </button>
                    <div style="display: flex; flex-direction: column; gap: 0.8rem; max-height: 520px; overflow-y: auto; padding-right: 4px;" class="hide-scrollbar">
                `;
                achievements.forEach(b => {
                    const earned = b.is_unlocked;
                    const unlockedDate = b.unlocked_at ? new Date(b.unlocked_at).toLocaleDateString('es-ES') : '';
                    badgesHTML += `
                        <div class="ach-card ${earned ? 'ach-card-unlocked' : 'ach-card-locked'}">
                            <div class="ach-card-icon">${b.icon || '🏆'}</div>
                            <div class="ach-card-info">
                                <div class="ach-card-title">
                                    <span>${b.name}</span>
                                    ${earned ? '<span style="color: #10b981;">✓</span>' : '<span style="color: #64748b;">🔒</span>'}
                                </div>
                                <div class="ach-card-desc">${b.description}</div>
                                ${earned && unlockedDate ? `<div class="ach-card-date">✓ Obtenido el ${unlockedDate}</div>` : ''}
                            </div>
                        </div>
                    `;
                });
                badgesHTML += `</div>`;
            } else {
                badgesHTML = '<div style="text-align: center; padding: 1rem; color: #94a3b8; font-size: 0.85rem;">Aún no tienes medallas registradas.</div>';
            }
            badgesContainer.innerHTML = badgesHTML;
        } catch (err) {
            console.error('Error al obtener achievements:', err);
            badgesContainer.innerHTML = '<div style="text-align: center; padding: 1rem; color: #ef4444; font-size: 0.85rem;">Error al cargar logros.</div>';
        }
    }

    // Cargar avistamientos del usuario
    const container = document.getElementById('profile-sightings-container');
    container.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 3rem;">Cargando tus avistamientos...</div>';

    if (!window.allLoadedSightings) window.allLoadedSightings = {};

    try {
        const userSightings = await sightingManager.getByUser(auth.currentUser.id);

        if (userSightings.length === 0) {
            container.innerHTML = `
                    <div style="text-align: center; color: var(--text-muted); padding: 3rem; background: rgba(15, 23, 42, 0.4); border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                        Aún no has reportado ningún avistamiento.<br>
                        <a href="#/reportar" class="btn btn-primary" style="margin-top: 1rem; text-decoration: none; display: inline-block;">Reportar Ahora</a>
                    </div>
                `;
            return;
        }

        container.innerHTML = ''; // Limpiar

        userSightings.forEach(s => {
            window.allLoadedSightings[s.id] = s;
            // Obtener fecha formateada
            const date = new Date(s.sighted_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

            // Definir colores y textos para el estado
            let statusColor = '#eab308'; // amarillo
            let statusText = 'Pendiente';
            if (s.status === 'approved') {
                statusColor = '#10b981'; // verde
                statusText = 'Aprobado';
            } else if (s.status === 'rejected') {
                statusColor = '#ef4444'; // rojo
                statusText = 'Rechazado';
            }

            // Generar tarjeta horizontal
            const card = document.createElement('div');
            card.className = 'glass-effect';
            card.style.display = 'flex';
            card.style.gap = '1.5rem';
            card.style.padding = '1.5rem';
            card.style.borderRadius = '12px';
            card.style.alignItems = 'center';

            // Buscar foto fallback en el catálogo nativo si no hay foto subida por el usuario
            let imageUrl = s.image_url ? (s.image_url.startsWith('http') ? s.image_url : window.APP_CONFIG.BASE_URL + '${s.image_url}') : null;
            if (!imageUrl && window.nativeBirdsData) {
                const matchedBird = window.nativeBirdsData.find(b => b.name.toLowerCase().includes(s.bird_name.toLowerCase()) || s.bird_name.toLowerCase().includes(b.name.toLowerCase()));
                if (matchedBird && matchedBird.images && matchedBird.images.length > 0) {
                    imageUrl = matchedBird.images[0];
                }
            }
            if (!imageUrl) {
                imageUrl = './img-frontend/placeholder.png';
            }

            card.innerHTML = `
                    <img src="${imageUrl}" alt="${escapeHtml(s.bird_name)}" style="width: 120px; height: 120px; border-radius: 8px; object-fit: cover; border: 2px solid rgba(255,255,255,0.1);" onerror="this.src='./img-frontend/placeholder.png'">
                    <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                            <h3 class="sighting-user-title" style="margin: 0; font-size: 1.3rem;">${escapeHtml(s.bird_name)}</h3>
                            <div style="display: flex; gap: 0.5rem; align-items: center;">
                                <span style="background: ${statusColor}20; color: ${statusColor}; padding: 0.3rem 0.8rem; border-radius: 50px; font-size: 0.8rem; font-weight: 600; border: 1px solid ${statusColor}40;">
                                    ${statusText}
                                </span>
                                ${(window.authManager && window.authManager.isAdmin()) ? `
                                <button onclick="window.editUserSighting(${s.id})" class="btn btn-outline" style="border-color: var(--primary-color); color: var(--primary-color); padding: 0.2rem 0.6rem; font-size: 0.8rem; border-radius: 6px; cursor: pointer; transition: all 0.2s;" title="Editar este avistamiento" onmouseover="this.style.background='var(--primary-color)'; this.style.color='#fff';" onmouseout="this.style.background='transparent'; this.style.color='var(--primary-color)';">✏️ Editar</button>
                                <button onclick="window.deleteUserSighting(${s.id})" class="btn btn-outline" style="border-color: #ef4444; color: #ef4444; padding: 0.2rem 0.6rem; font-size: 0.8rem; border-radius: 6px; cursor: pointer; transition: all 0.2s;" title="Dar de baja / Eliminar este avistamiento" onmouseover="this.style.background='#ef4444'; this.style.color='#fff';" onmouseout="this.style.background='transparent'; this.style.color='#ef4444';">🗑️ Eliminar</button>
                                ` : ''}
                            </div>
                        </div>
                        <p class="sighting-user-location" style="font-size: 0.9rem; margin-bottom: 0.5rem;">📍 ${escapeHtml(s.location_name || 'Ubicación registrada')}</p>
                        <p class="sighting-user-date" style="font-size: 0.85rem; margin-bottom: 0.5rem;">📅 ${date}</p>
                        ${s.description ? `<p class="sighting-user-desc" style="font-size: 0.9rem; font-style: italic; margin: 0; border-left: 2px solid var(--primary-color); padding-left: 0.5rem;">"${escapeHtml(s.description)}"</p>` : ''}
                    </div>
                `;
            container.appendChild(card);
        });

    } catch (error) {
        container.innerHTML = '<div style="color: #ef4444; padding: 1rem;">Error al cargar tus avistamientos. Intenta nuevamente.</div>';
    }
});

router.add('/dashboard', () => {
    showView('dashboard-view');
    document.getElementById('main-nav').style.display = 'flex';
    loadDashboardData();
    if (window.triviaManager) window.triviaManager.init();
});

router.add('/admin', () => {
    if (!window.authManager || !window.authManager.isAdmin()) {
        router.navigate('/');
        return;
    }
    showView('admin-view');
    document.getElementById('main-nav').style.display = 'flex';
    if (window.adminManager) window.adminManager.loadPendingSightings();
});

router.add('/admin/avistamientos', () => {
    if (!window.authManager || !window.authManager.isAdmin()) {
        router.navigate('/');
        return;
    }
    showView('admin-all-sightings-view');
    document.getElementById('main-nav').style.display = 'flex';
    if (window.adminManager) window.adminManager.showAllSightingsFullscreen();
});

router.add('/admin/respaldo', () => {
    if (!window.authManager || !window.authManager.isAdmin()) {
        router.navigate('/');
        return;
    }
    showView('admin-backup-view');
    document.getElementById('main-nav').style.display = 'flex';
});

router.add('/estadisticas', () => {
    showView('stats-view');
    document.getElementById('main-nav').style.display = 'flex';

    // Cargar estadísticas
    const statsManager = new StatsManager('stats-container');
    statsManager.render();
});

router.add('/especies', () => {
    showView('species-view');
    document.getElementById('main-nav').style.display = 'flex';

    // Renderizar el álbum por defecto
    if (window.renderSpeciesAlbum) {
        window.renderSpeciesAlbum();
    }
});

router.add('/reportar', () => {
    if (!auth.isAuthenticated) {
        router.navigate('/');
        modalManager.openLogin();
        return;
    }

    if (auth.currentUser && auth.currentUser.status === 'suspended') {
        router.navigate('/');
        modalManager.showMessage('Cuenta Suspendida', 'Tu cuenta se encuentra temporalmente suspendida debido a infracciones de nuestras normativas comunitarias o de validación de datos. Por el momento, la funcionalidad de reportes está deshabilitada.', 'error');
        return;
    }

    showView('report-view');
    document.getElementById('main-nav').style.display = 'flex';

    if (!window.reportViewInitialized) {
        window.reportViewInitialized = true;

        // Cargar especies
        const speciesList = window.nativeBirdsData || [];
        const select = document.getElementById('fullSightingBirdName');
        if (select) {
            select.innerHTML = '<option value="">Selecciona una especie...</option>';
            // Opción especial: Especie Desconocida (primera del listado)
            const unknownOpt = document.createElement('option');
            unknownOpt.value = 'Especie Desconocida';
            unknownOpt.textContent = '❓ Especie Desconocida (para revisión posterior)';
            unknownOpt.style.color = '#f59e0b';
            unknownOpt.style.fontStyle = 'italic';
            select.appendChild(unknownOpt);
            // Separador visual
            const sep = document.createElement('option');
            sep.disabled = true;
            sep.textContent = '──────────────────────';
            select.appendChild(sep);
            // Ordenar alfabéticamente el resto
            const sorted = [...speciesList].sort((a, b) => a.name.localeCompare(b.name));
            sorted.forEach(sp => {
                const option = document.createElement('option');
                option.value = sp.name;
                option.textContent = sp.name;
                select.appendChild(option);
            });
        }

        // Inicializar mapa
        const mapContainer = document.getElementById('report-map-container');
        // Necesitamos guardar la instancia en window para poder invalidar tamaño
        const margaritaBounds = [
            [10.80, -64.45], // Suroeste
            [11.20, -63.75]  // Noreste
        ];
        window.reportLeafletMap = L.map(mapContainer, {
            center: [10.98, -64.15],
            zoom: 10,
            maxBounds: margaritaBounds,
            maxBoundsViscosity: 1.0,
            minZoom: 10
        });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(window.reportLeafletMap);

        let marker = null;
        const latInput = document.getElementById('fullSightingLat');
        const lngInput = document.getElementById('fullSightingLng');
        const locStatus = document.getElementById('fullLocationStatus');
        const locError = document.getElementById('fullLocationError');

        // Evento click en mapa
        window.reportLeafletMap.on('click', function (e) {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;

            latInput.value = lat.toFixed(6);
            lngInput.value = lng.toFixed(6);

            locStatus.style.display = 'none';
            locError.style.display = 'none';

            if (marker) {
                marker.setLatLng(e.latlng);
            } else {
                marker = L.marker(e.latlng).addTo(window.reportLeafletMap);
            }
        });

        // Evento GPS
        const btnLocation = document.getElementById('fullBtnGetLocation');
        btnLocation.addEventListener('click', () => {
            btnLocation.textContent = '📍 Obteniendo...';
            btnLocation.disabled = true;
            locStatus.style.display = 'none';
            locError.style.display = 'none';

            if (!navigator.geolocation) {
                locError.textContent = 'Tu navegador no soporta geolocalización.';
                locError.style.display = 'block';
                btnLocation.textContent = '📍 Obtener Mi Ubicación (GPS)';
                btnLocation.disabled = false;
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    latInput.value = lat.toFixed(6);
                    lngInput.value = lng.toFixed(6);

                    locStatus.textContent = '¡Ubicación obtenida con éxito!';
                    locStatus.style.display = 'block';
                    btnLocation.textContent = '📍 Obtener Mi Ubicación (GPS)';
                    btnLocation.disabled = false;

                    const latlng = [lat, lng];
                    window.reportLeafletMap.setView(latlng, 14);
                    if (marker) {
                        marker.setLatLng(latlng);
                    } else {
                        marker = L.marker(latlng).addTo(window.reportLeafletMap);
                    }
                },
                (error) => {
                    locError.textContent = 'Error al obtener GPS. Haz clic en el mapa.';
                    locError.style.display = 'block';
                    btnLocation.textContent = '📍 Obtener Mi Ubicación (GPS)';
                    btnLocation.disabled = false;
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        });

        // Evento cambio de archivo (Clasificación por IA — Flujo en Cascada)
        const imageInput = document.getElementById('fullSightingImage');
        const fileNameSpan = document.getElementById('fullSightingFileName');

        // Estado de IA compartido con el submit del formulario
        window._aiMeta = { source: null, confidence: null, rawLabel: null, status: 'skipped' };

        imageInput.addEventListener('change', async () => {
            if (imageInput.files.length === 0) {
                fileNameSpan.textContent = '📷 Seleccionar archivo...';
                fileNameSpan.style.color = '#94a3b8';
                document.getElementById('aiClassificationResult').style.display = 'none';
                window._aiMeta = { source: null, confidence: null, rawLabel: null, status: 'skipped' };
                return;
            }

            if (imageInput.files.length > 4) {
                modalManager.showMessage('Límite excedido', 'Solo puedes subir hasta 4 imágenes por reporte.', 'error');
                imageInput.value = ''; // reset
                fileNameSpan.textContent = '📷 Seleccionar archivo...';
                return;
            }

            const file = imageInput.files[0];

            if (imageInput.files.length === 1) {
                fileNameSpan.textContent = file.name;
            } else {
                fileNameSpan.textContent = imageInput.files.length + ' imágenes seleccionadas';
            }
            fileNameSpan.style.color = '#fff';

            // Mostrar asistente
            const aiBox = document.getElementById('aiClassificationResult');
            const aiLoader = document.getElementById('aiLoader');
            const aiStatusText = document.getElementById('aiStatusText');
            const aiSugerenciaDiv = document.getElementById('aiSugerenciaDiv');
            const aiSuggestLocalDiv = document.getElementById('aiSuggestLocalMatchDiv');

            aiBox.style.display = 'flex';
            aiBox.style.borderColor = 'rgba(16,185,129,0.2)';
            aiBox.style.background = 'rgba(16,185,129,0.08)';
            aiLoader.style.display = 'block';
            aiSugerenciaDiv.style.display = 'none';
            aiStatusText.textContent = '🔍 Analizando imagen con IA... (API 1/2)';

            const formData = new FormData();
            formData.append('imagenes', file);

            try {
                const resp = await window.sightingManager.classify(formData);

                aiLoader.style.display = 'none';

                // Guardamos metadatos para el submit
                window._aiMeta = {
                    source: resp.aiSource || null,
                    confidence: resp.aiConfidence != null ? resp.aiConfidence : null,
                    rawLabel: resp.rawLabel || null,
                    status: resp.aiStatus || 'failed'
                };

                // ─ Fallback: especie desconocida ─
                if (resp.isUnknown || resp.aiStatus === 'failed') {
                    aiBox.style.borderColor = 'rgba(239,68,68,0.3)';
                    aiBox.style.background = 'rgba(239,68,68,0.08)';
                    aiStatusText.innerHTML = '❌ No fue posible identificar el ave.<br><small style="color:#94a3b8;">Se registrará como <strong>"Especie Desconocida"</strong> para revisión posterior.</small>';
                    aiSugerenciaDiv.style.display = 'none';

                    // Auto-seleccionar "Especie Desconocida" en el select si existe
                    const sel = document.getElementById('fullSightingBirdName');
                    const unknownOpt = [...sel.options].find(o => o.value.toLowerCase().includes('desconocida'));
                    if (unknownOpt) sel.value = unknownOpt.value;
                    return;
                }

                // ─ Baja confianza ─
                if (resp.isLowConfidence) {
                    aiBox.style.borderColor = 'rgba(245,158,11,0.3)';
                    aiBox.style.background = 'rgba(245,158,11,0.08)';
                    aiStatusText.innerHTML = `⚠️ Identificación con confianza baja (${resp.aiConfidence}%). Revisa la sugerencia.`;
                } else {
                    // ─ Identificación exitosa ─
                    const sourceLabel = resp.aiSource === 'huggingface' ? '🤗 Hugging Face' : '🌿 iNaturalist';
                    aiStatusText.innerHTML = `✅ Identificado por <strong style="color:#10b981;">${sourceLabel}</strong> con <strong>${resp.aiConfidence}%</strong> de confianza`;
                }

                // Mostrar sugerencia
                document.getElementById('aiSuggestScore').textContent = resp.aiConfidence + '%';
                document.getElementById('aiSuggestLabel').textContent = resp.rawLabel || '—';
                aiSugerenciaDiv.style.display = 'flex';

                // Coincidencia local
                const localMatch = resp.localSpecies;
                if (localMatch && localMatch !== 'Especie Desconocida') {
                    document.getElementById('aiSuggestLocal').textContent = localMatch;
                    aiSuggestLocalDiv.style.display = 'block';

                    document.getElementById('btnAutoFillBird').onclick = () => {
                        const select = document.getElementById('fullSightingBirdName');
                        // Buscar opción que coincida (case-insensitive, parcial)
                        const opt = [...select.options].find(o =>
                            o.value.toLowerCase().includes(localMatch.toLowerCase().split(' ')[0])
                        );
                        if (opt) {
                            select.value = opt.value;
                            modalManager.showMessage('✨ Auto-completado', `Especie seleccionada: "${opt.value}"`, 'success');
                        } else {
                            modalManager.showMessage('ℹ️ Nota', `No encontramos "${localMatch}" en el catálogo exacto. Selecciónala manualmente.`, 'error');
                        }
                    };
                } else {
                    aiSuggestLocalDiv.style.display = 'none';
                }

            } catch (err) {
                aiLoader.style.display = 'none';
                aiBox.style.borderColor = 'rgba(239,68,68,0.2)';
                aiStatusText.textContent = '⚠️ Error de conexión con el clasificador. Continúa manualmente.';
                console.error('[AI Cascade Error]', err);
            }
        });

        // Evento Submit
        const form = document.getElementById('fullSightingForm');
        const submitBtn = document.getElementById('fullBtnSubmit');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!latInput.value || !lngInput.value) {
                modalManager.showMessage('Ubicación Requerida', 'Por favor, usa el botón GPS o haz clic en el mapa para marcar la ubicación de tu avistamiento.', 'error');
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';

            const ai = window._aiMeta || {};

            // Manejo de envío Offline
            if (!navigator.onLine) {
                const imgFiles = Array.from(imageInput.files);
                const record = {
                    bird_name: form.bird_name.value,
                    location_name: form.location_name.value,
                    latitude: form.latitude.value,
                    longitude: form.longitude.value,
                    description: form.description.value,
                    sighted_at: form.sighted_at.value,
                    ai_source: ai.source,
                    ai_confidence: ai.confidence,
                    ai_raw_label: ai.rawLabel,
                    ai_status: ai.status,
                    imageBlobs: imgFiles, // Guardar el array completo para offline
                    imageNames: imgFiles.map(f => f.name),
                    imageType: imgFiles.length > 0 ? imgFiles[0].type : null
                };

                await window.offlineQueue.add(record);

                submitBtn.disabled = false;
                submitBtn.textContent = 'Enviar Reporte para Revisión';
                modalManager.showMessage('📡 Guardado Offline', 'No hay conexión a internet. Tu reporte ha sido guardado de forma segura en tu dispositivo y se enviará automáticamente al reconectarte.', 'success');

                form.reset();
                latInput.value = '';
                lngInput.value = '';
                if (marker) {
                    window.reportLeafletMap.removeLayer(marker);
                    marker = null;
                }
                router.navigate('/');
                return;
            }

            const formData = new FormData(form);

            // Adjuntar metadatos de clasificación por IA al reporte
            if (ai.source) formData.append('ai_source', ai.source);
            if (ai.confidence != null) formData.append('ai_confidence', ai.confidence);
            if (ai.rawLabel) formData.append('ai_raw_label', ai.rawLabel);
            formData.append('ai_status', ai.status || 'skipped');

            const result = await sightingManager.create(formData);

            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar Reporte para Revisión';

            if (result.success) {
                modalManager.showMessage('¡Reportado!', 'El avistamiento se ha registrado con éxito y está pendiente de aprobación.');
                form.reset();
                latInput.value = '';
                lngInput.value = '';
                if (marker) {
                    window.reportLeafletMap.removeLayer(marker);
                    marker = null;
                }
                window.reportLeafletMap.setView([10.98, -64.15], 10);
                router.navigate('/');
            } else {
                modalManager.showMessage('Error', result.error, 'error');
            }
        });
    }

    // Forzar resize del mapa después de mostrar la vista para evitar glitches de Leaflet
    setTimeout(() => {
        if (window.reportLeafletMap) {
            window.reportLeafletMap.invalidateSize();
        }
    }, 100);
});

router.add('/actividad', async () => {
    showView('actividad-view');
    document.getElementById('main-nav').style.display = 'flex';

    // Cargar carrusel superior y mapa
    await loadActividadSightings();

    // Forzar resize del mapa después de mostrar la vista para evitar glitches de Leaflet
    setTimeout(() => {
        if (window.landingMapManager && window.landingMapManager.map) {
            window.landingMapManager.map.invalidateSize();
        }
    }, 100);

    // Cargar feed completo
    const activityFeed = new ActivityFeed('activity-feed');
    activityFeed.renderSkeletons(6);
    const recentSightings = await sightingManager.fetchAll({ limit: 50 });
    activityFeed.render(recentSightings);
});


// Vista de Perfil y Medallas
router.add('#/perfil', async () => {
    if (!auth.isAuthenticated) {
        window.location.href = 'login.html';
        return;
    }
    showView('profile-view');
    updateActiveNav('Mi Perfil');

    // Cargar datos del usuario
    const user = auth.currentUser;
    document.getElementById('profileNameDisplay').value = user.name;

    if (user.profile_image) {
        document.getElementById('profileImagePreview').innerHTML = `<img src=window.APP_CONFIG.BASE_URL + '${user.profile_image}' style="width:100%;height:100%;object-fit:cover;">`;
    } else {
        document.getElementById('profileImagePreview').innerHTML = '👤';
    }

    // Sincronizar el botón del tema
    const isLight = document.body.classList.contains('light-theme');
    const themeIcon = document.getElementById('themeToggleIcon');
    if (themeIcon) themeIcon.textContent = isLight ? '🌙' : '☀️';

    // Cargar logros y medallas dinámicas desde la base de datos
    try {
        const achievements = await api.get('/users/me/achievements');
        window.userAchievements = achievements;
        let badgesHTML = '';
        let earnedCount = 0;

        if (Array.isArray(achievements) && achievements.length > 0) {
            earnedCount = achievements.filter(a => a.is_unlocked).length;
            badgesHTML += `
                <button onclick="window.modalManager.openAchievementsModal(window.userAchievements || [])" class="glass-button" style="width: 100%; margin-bottom: 1.2rem; padding: 0.85rem 1rem; border-radius: 12px; background: linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(6, 182, 212, 0.25)); border: 1.5px solid #10b981; color: var(--text-main); font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.6rem; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(16,185,129,0.2);" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                    <span style="font-size: 1.2rem;">🏆</span>
                    <span>Ver Menú Completo de 30 Medallas (${earnedCount}/${achievements.length})</span>
                </button>
                <div style="display: flex; flex-direction: column; gap: 0.8rem; max-height: 520px; overflow-y: auto; padding-right: 4px;" class="hide-scrollbar">
            `;

            achievements.forEach(b => {
                const earned = b.is_unlocked;
                const unlockedDate = b.unlocked_at ? new Date(b.unlocked_at).toLocaleDateString('es-ES') : '';
                badgesHTML += `
                    <div class="ach-card ${earned ? 'ach-card-unlocked' : 'ach-card-locked'}">
                        <div class="ach-card-icon">${b.icon || '🏆'}</div>
                        <div class="ach-card-info">
                            <div class="ach-card-title">
                                <span>${b.name}</span>
                                ${earned ? '<span style="color: #10b981;">✓</span>' : '<span style="color: #64748b;">🔒</span>'}
                            </div>
                            <div class="ach-card-desc">${b.description}</div>
                            ${earned && unlockedDate ? `<div class="ach-card-date">✓ Obtenido el ${unlockedDate}</div>` : ''}
                        </div>
                    </div>
                `;
            });
            badgesHTML += `</div>`;
        } else {
            badgesHTML = '<div style="text-align: center; padding: 1rem; color: #94a3b8;">Aún no tienes medallas. ¡Envía tu primer reporte para desbloquear tus primeros logros!</div>';
        }

        const countEl = document.getElementById('profileSightingsCount');
        if (countEl) countEl.textContent = earnedCount;

        const badgesContainer = document.getElementById('profileBadgesContainer');
        if (badgesContainer) badgesContainer.innerHTML = badgesHTML;
    } catch (error) {
        console.error('Error cargando medallas:', error);
    }

    // Configurar formulario
    const profileForm = document.getElementById('profileUpdateForm');
    profileForm.onsubmit = async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btnUpdateProfile');
        btn.disabled = true;
        btn.textContent = 'Guardando...';

        const formData = new FormData(profileForm);
        const res = await auth.updateProfile(formData);

        btn.disabled = false;
        btn.textContent = 'Guardar Cambios';

        if (res.success) {
            modalManager.showMessage('Éxito', 'Perfil actualizado correctamente.');
            document.getElementById('profilePasswordInput').value = '';
            // Refrescar el dropdown
            if (window.updateUserDropdown) window.updateUserDropdown();
        } else {
            modalManager.showMessage('Error', res.error, 'error');
        }
    };
});

// Lógica para mostrar vistas
function showView(viewId) {
    document.querySelectorAll('.view-section, .auth-layout').forEach(el => el.style.display = 'none');
    const view = document.getElementById(viewId);
    if (view) view.style.display = view.classList.contains('auth-layout') ? 'flex' : 'block';

    // Ocultar el enlace de la página actual para no saturar la barra de navegación
    const viewToHref = {
        'landing-view': '#/',
        'actividad-view': '#/actividad',
        'dashboard-view': '#/dashboard',
        'species-view': '#/especies',
        'stats-view': '#/estadisticas',
        'report-view': '#/reportar'
    };
    const currentHref = viewToHref[viewId];

    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentHref) {
            link.style.display = 'none';
        } else {
            link.style.display = 'inline-block';
        }
    });
}

// Datos de aves nativas
const nativeBirds = [
    {
        name: "Cotorra Margariteña",
        type: "De Interior",
        scientificName: "Amazona barbadensis",
        status: "En Peligro",
        category: "En Peligro",
        habitat: "En la isla de Margarita, se concentra principalmente en la península de Macanao. Habita en zonas de vegetación xerófila, matorrales y bosques espinosos.",
        description: "Es el ave emblemática y símbolo natural del Estado Nueva Esparta. Presenta un plumaje verde brillante, cara y hombros amarillos. Su dieta depende de recursos de los cactus.",
        images: ["./img-frontend/cotorra4.webp", "./img-frontend/cotorra.jpg", "./img-frontend/cotorra2.jpg", "./img-frontend/cotorra3.jpg"],
        coords: [10.980, -64.220],
        diet: { type: "Granívora/Frugívora", rescueFood: "Trozos de manzana, lechosa, semillas de girasol sin sal, avena con agua." }
    },
    {
        name: "Gonzalito o Pespé margariteño",
        type: "Manglares",
        scientificName: "Icterus nigrogularis helioeides",
        status: "Preocupación Menor",
        category: "Comunes",
        habitat: "Endémica del estado Nueva Esparta. Se observa con frecuencia en zonas secas, matorrales, bosques de rastrojo y manglares.",
        description: "Plumaje amarillo brillante en todo el cuerpo, contrastando con una máscara, babero, alas y cola negros. Es un tejedor excepcional, construye nidos colgantes.",
        images: ["./img-frontend/gonzalito.jpg", "./img-frontend/gonzalito2.jpg", "./img-frontend/gonzalito3.jpg", "./img-frontend/gonzalito4.jpg"],
        coords: [10.960, -64.170],
        diet: { type: "Omnívora", rescueFood: "Trozos pequeños de fruta dulce (mango, cambur), insectos pequeños." }
    },
    {
        name: "Guayamate o Cardenal Coriano",
        type: "De Interior",
        scientificName: "Cardinalis phoeniceus",
        status: "Preocupación Menor",
        category: "Comunes",
        habitat: "Su entorno natural son los arbustales tropicales secos, matorrales desérticos y bosques espinosos costeros donde abundan los cactus.",
        description: "El macho tiene un plumaje predominantemente rojo brillante con bordes oscuros en las alas. Destacan por su cresta larga y casi siempre erguida y su canto melodioso.",
        images: ["./img-frontend/guayamate.jpg", "./img-frontend/guayamate2.jpg", "./img-frontend/guayamate3.jpg", "./img-frontend/guayamate4.jpg"],
        coords: [10.972, -64.250],
        diet: { type: "Granívora/Frugívora", rescueFood: "Semillas pequeñas (alpiste, mijo), trocitos de cambur." }
    },
    {
        "name": "Cuclillo Canela",
        "type": "De Interior",
        "scientificName": "Coccyzus melacoryphus",
        "status": "Preocupación Menor",
        "category": "Comunes",
        "habitat": "Bosques secos, espinares, matorrales densos y bordes de manglares.",
        "description": "Ave esbelta de comportamiento sigiloso. Se distingue por su vientre de color canela intenso, su corona gris con antifaz oscuro y su pico negro ligeramente curvo.",
        "images": ["./img-frontend/cuclillo.jfif", "./img-frontend/cuclillo 2.jfif", "./img-frontend/cuclillo 3.jfif", "./img-frontend/cuclillo 4.jfif"],
        "coords": [11.020, -64.310],
        "diet": { "type": "Insectívora", "rescueFood": "Especialista en orugas (incluso las de pelos irritantes), saltamontes, libélulas y ocasionalmente pequeñas lagartijas." }
    },
    {
        name: "Guacharaca culirroja",
        type: "De Interior",
        scientificName: "Ortalis ruficauda",
        status: "Preocupación Menor",
        category: "Comunes",
        habitat: "Se encuentra ampliamente distribuida en el norte del país, zonas boscosas, llanos, zonas xerófitas e incluso periferias de ciudades.",
        description: "Mide entre 53 y 61 cm, tiene plumaje marrón oliva y gris pizarra, piel roja en la garganta y una cola larga. Famosa por su canto estruendoso en las mañanas.",
        images: ["./img-frontend/guaracha.jpg", "./img-frontend/guaracha2.jpg", "./img-frontend/guaracha3.jpg", "./img-frontend/guaracha4.jpg"],
        coords: [11.032, -63.895],
        diet: { type: "Omnívora", rescueFood: "Frutas picadas (mango, lechosa), vegetales tiernos." }
    },
    {
        name: "Turpial",
        type: "De Interior",
        scientificName: "Icterus icterus",
        status: "Preocupación Menor",
        category: "Simbólicas",
        habitat: "Zonas cálidas, llanos, bosques deciduos y márgenes de ríos.",
        description: "Es el ave nacional de Venezuela. Famosa por su brillante plumaje negro y naranja, su canto melodioso y su costumbre de usurpar los nidos de otras aves.",
        images: ["./img-frontend/turpial.jpg", "./img-frontend/turpial2.jpg", "./img-frontend/turpial3.jpg", "./img-frontend/turpial4.jpg"],
        coords: [10.965, -63.925],
        diet: { type: "Omnívora", rescueFood: "Fruta fresca (cambur, naranja dulce, lechosa) e insectos." }
    },
    {
        name: "Paraulata Llanera o Chulinga",
        type: "De Interior",
        scientificName: "Mimus gilvus",
        status: "Preocupación Menor",
        category: "Comunes",
        habitat: "Zonas boscosas secas y áreas urbanas.",
        description: "Destaca por su plumaje gris en la espalda y partes inferiores blanquecinas. Conocidas por sus melodías complejas y variadas, siendo capaces de copiar sonidos de su entorno.",
        images: ["./img-frontend/chulinga.jpg", "./img-frontend/chulinga2.jpg", "./img-frontend/chulinga3.jpg", "./img-frontend/chulinga4.jpg"],
        coords: [10.975, -63.855],
        diet: { type: "Omnívora", rescueFood: "Insectos pequeños, larvas, o fruta fresca blanda." }
    },
    {
        name: "Conoto Negro",
        type: "De Interior",
        scientificName: "Psarocolius decumanus",
        status: "Preocupación Menor",
        category: "Comunes",
        habitat: "Regiones bajas de Sudamérica, áreas abiertas, plantaciones e incluso parques urbanos.",
        description: "Se reconoce por su plumaje negro lustroso, llamativa cola amarilla, pico grueso color crema e iris azul. Son famosos por construir grandes nidos en forma de bolsa.",
        images: ["./img-frontend/conoto negro.jpg", "./img-frontend/conoto negro2.jpg", "./img-frontend/conoto negro3.jpg", "./img-frontend/conoto negro4.jpg"],
        coords: [11.062, -63.985],
        diet: { type: "Omnívora", rescueFood: "Trozos de frutas dulces, bayas, y ocasionalmente huevo hervido." }
    },
    {
        name: "Pitirre chicharrero",
        type: "De Interior",
        scientificName: "Tyrannus melancholicus",
        status: "Preocupación Menor",
        category: "Comunes",
        habitat: "Áreas abiertas, sabanas, bosques ralos, plantaciones y zonas urbanas.",
        description: "Destaca por un pecho y vientre de color amarillo brillante y cabeza gris clara. Es famoso por defender su territorio de forma muy agresiva.",
        images: ["./img-frontend/pitirre.jpg", "./img-frontend/pitirre2.jpg", "./img-frontend/pitirre3.jpg", "./img-frontend/pitirre4.jpg"],
        coords: [10.988, -63.870],
        diet: { type: "Insectívora", rescueFood: "Insectos pequeños (grillos, gusanos de harina). Evitar frutas." }
    },
    {
        name: "Potoca",
        type: "De Interior",
        scientificName: "Columbina passerina",
        status: "Preocupación Menor",
        category: "Comunes",
        habitat: "Zonas cálidas, áreas urbanas y sabanas.",
        description: "Aves pequeñas y gorditas, de colores grisáceos y marrones para camuflarse en el suelo. Son monógamas, forman parejas de por vida.",
        images: ["./img-frontend/potoco.jpg", "./img-frontend/potoco2.jpg", "./img-frontend/potoco3.jpg", "./img-frontend/potoco4.jpg"],
        coords: [10.958, -63.875],
        diet: { type: "Granívora", rescueFood: "Alpiste, mijo, arroz partido o semillas trituradas." }
    },
    {
        name: "Chirito",
        type: "De Interior",
        scientificName: "Polioptila plumbea",
        status: "Preocupación Menor",
        category: "Comunes",
        habitat: "Matorrales y bosques secos.",
        description: "Pájaros insectívoros pequeños de color gris azulado con vientre blanco y una cola larga con bordes blancos. Los machos tienen un característico gorro negro.",
        images: ["./img-frontend/chirito.jpg", "./img-frontend/chirito2.jpg", "./img-frontend/chirito3.jpg", "./img-frontend/chirito4.jpg"],
        coords: [10.948, -64.070],
        diet: { type: "Insectívora", rescueFood: "Solo insectos muy pequeños. Es un ave muy delicada." }
    },
    {
        name: "Corocora",
        type: "Manglares",
        scientificName: "Eudocimus ruber",
        status: "Preocupación Menor",
        category: "Protegidas",
        habitat: "Manglares, lagunas costeras y en los extensos esteros y sabanas de los Llanos.",
        description: "Su intenso color rojo escarlata se debe a su dieta rica en crustáceos. Es una de las aves más icónicas de Venezuela, de cuello largo y pico curvado hacia abajo.",
        images: ["./img-frontend/corocora.jpg", "./img-frontend/corocora2.jpg", "./img-frontend/corocora3.jpg", "./img-frontend/corocora4.jpg"],
        coords: [10.970, -64.175],
        diet: { type: "Especializada", rescueFood: "Difícil de rescatar. Camarones pequeños o pescado molido. Llamar a emergencias." }
    },
    {
        name: "Pavita",
        type: "De Interior",
        scientificName: "Glaucidium",
        status: "Preocupación Menor",
        category: "Comunes",
        habitat: "Zonas boscosas, matorrales y áreas urbanas.",
        description: "Ave de pequeño tamaño de la familia de los búhos pigmeos. Tradicionalmente asociada a mitos y leyendas populares de mal augurio.",
        images: ["./img-frontend/pavita.jpg", "./img-frontend/pavita2.jpg", "./img-frontend/pavita3.jpg", "./img-frontend/pavita4.jpg"],
        coords: [11.015, -63.920],
        diet: { type: "Carnívora", rescueFood: "Trocitos pequeños de carne cruda fresca (sin grasa) o insectos." }
    },
    {
        name: "Tijereta",
        type: "Manglares",
        scientificName: "Fregata magnificens",
        status: "Preocupación Menor",
        category: "Protegidas",
        habitat: "Cielos de zonas costeras, manglares y cayos.",
        description: "Impresionante ave marina tropical. Inconfundible por su cola profunda y bifurcada en forma de tijera, y su gran envergadura.",
        images: ["./img-frontend/tijereta.jpg", "./img-frontend/tijereta2.jpg", "./img-frontend/tijereta3.jpg", "./img-frontend/tijereta4.jpg"],
        coords: [11.070, -64.010],
        diet: { type: "Piscívora", rescueFood: "Trozos de pescado fresco sin espinas ni escamas." }
    },
    {
        name: "Angoleta",
        type: "De Interior",
        scientificName: "Quiscalus lugubris",
        status: "Preocupación Menor",
        category: "Comunes",
        habitat: "Muy adaptables, se pueden encontrar en parques, jardines, zonas urbanas y áreas abiertas.",
        description: "Los machos son completamente negros con un pico puntiagudo y ojos amarillos. Son aves muy sociables, ruidosas e inteligentes.",
        images: ["./img-frontend/chiquia.JPG", "./img-frontend/chiquia2.JPG", "./img-frontend/chiquia3.JPG", "./img-frontend/chiquia4.JPG"],
        coords: [10.957, -63.850],
        diet: { type: "Omnívora", rescueFood: "Frutas, trozos de huevo, insectos, masa de maíz." }
    },
    {
        name: "Guacamaya",
        type: "De Interior",
        scientificName: "Ara ararauna / Ara macao",
        status: "Preocupación Menor",
        category: "Simbólicas",
        habitat: "Zonas urbanas, parques y zonas boscosas bajas.",
        description: "Aves de gran tamaño, muy coloridas e inteligentes. Famosas por sus colores vibrantes (azul y amarillo, o rojo escarlata) y por volar siempre en parejas o bandadas muy ruidosas.",
        images: ["./img-frontend/guacamaya.jpg", "./img-frontend/guacamaya2.jpg", "./img-frontend/guacamaya3.jpg", "./img-frontend/guacamaya4.jpg"],
        coords: [11.040, -63.870],
        diet: { type: "Granívora/Frugívora", rescueFood: "Semillas grandes (girasol), nueces, y frutas (mango, manzana)." }
    },
    {
        name: "Becasa",
        type: "Migratoria",
        scientificName: "Scolopacidae",
        status: "Preocupación Menor",
        category: "Comunes",
        habitat: "Zonas costeras y humedales.",
        habitats: ["Migratoria", "Costeras"],
        description: "Aves playeras de pico largo y delgado, expertas en buscar pequeños invertebrados en la arena y el lodo de la costa.",
        images: ["./img-frontend/becasa.jpg", "./img-frontend/becasa 2.jpg", "./img-frontend/becasa 3.jpg", "./img-frontend/becasa 4.jpg"],
        coords: [10.920, -64.150],
        diet: { type: "Insectívora", rescueFood: "Gusanos de tierra, larvas o pequeños crustáceos." }
    },
    {
        name: "Buzo",
        type: "Manglares",
        scientificName: "Phalacrocorax brasilianus",
        status: "Preocupación Menor",
        category: "Comunes",
        habitat: "Mares costeros, lagunas y manglares.",
        description: "Excelentes buceadores que se sumergen para pescar. A menudo se les ve secando sus alas al sol sobre postes o ramas cerca del agua.",
        images: ["./img-frontend/buzo.jpg", "./img-frontend/buzo 2.jpg", "./img-frontend/buzo 3.jpg", "./img-frontend/buzo 4.jpg"],
        coords: [10.965, -64.180],
        diet: { type: "Piscívora", rescueFood: "Pescado entero pequeño o trozos grandes de pescado fresco." }
    },
    {
        name: "Flamenco del Caribe",
        type: "Migratoria",
        scientificName: "Phoenicopterus ruber",
        status: "Preocupación Menor",
        category: "Simbólicas",
        habitat: "En la Isla de Margarita se observan principalmente en dos lugares: el Monumento Natural Laguna de Las Marites (laguna costera salobre al sur de Porlamar) y el jardín costero del hotel Wyndham Concorde. Prefieren aguas poco profundas, salobres y ricas en crustáceos.",
        description: "Inconfundibles por su gran tamaño, cuello largo y plumaje rosa brillante. Se alimentan filtrando pequeños crustáceos en aguas salobres. En Margarita se avistan en la Laguna de Las Marites y en el Wyndham Concorde.",
        images: ["./img-frontend/flamenco del caribe.jpg", "./img-frontend/flamenco del caribe 2.jpg", "./img-frontend/flamenco del caribe 3.jpg", "./img-frontend/flamenco del caribe 4.jpg"],
        coords: [10.9113, -63.9182],
        diet: { type: "Especializada", rescueFood: "Alimentación por filtración. Muy difícil de cuidar. Llamar a INPARQUES." }
    },
    {
        name: "Gallineta",
        type: "Costeras",
        scientificName: "Porphyrio martinica",
        status: "Preocupación Menor",
        category: "Comunes",
        habitat: "Humedales, lagunas con vegetación flotante.",
        description: "Aves acuáticas de colores vibrantes púrpuras y verdes, con patas largas amarillas que les permiten caminar sobre lirios acuáticos.",
        images: ["./img-frontend/gallineta.jpg", "./img-frontend/gallineta 2.jpg", "./img-frontend/gallineta 3.jpg", "./img-frontend/gallineta 4.jpg"],
        coords: [10.950, -63.950],
        diet: { type: "Omnívora", rescueFood: "Vegetales blandos, trocitos de fruta o arroz cocido sin sal." }
    },
    {
        name: "Gallineta Plata",
        type: "Costeras",
        scientificName: "Fulica americana",
        status: "Preocupación Menor",
        category: "Comunes",
        habitat: "Lagunas y cuerpos de agua dulce o salobre.",
        description: "Cuerpo redondeado y oscuro con un escudete frontal blanco. Excelentes nadadoras que se sumergen en busca de plantas acuáticas.",
        images: ["./img-frontend/gallineta plata.jpg", "./img-frontend/gallineta plata 2.jpg", "./img-frontend/gallineta plata 3.jpg"],
        coords: [10.925, -63.990],
        diet: { type: "Herbívora", rescueFood: "Vegetación acuática blanda, lechuga picada, arroz hervido." }
    },
    {
        name: "Garcita Azul",
        type: "Manglares",
        scientificName: "Egretta caerulea",
        status: "Preocupación Menor",
        category: "Comunes",
        habitat: "Manglares y lagunas costeras.",
        description: "Garzas de tamaño mediano con plumaje azul grisáceo oscuro en los adultos. Son cazadoras silenciosas y pacientes en aguas poco profundas.",
        images: ["./img-frontend/garcita azul.jpg", "./img-frontend/garcita azul 2.jpg", "./img-frontend/garcita azul 3.jpg", "./img-frontend/garcita azul 4.jpg"],
        coords: [10.968, -64.155],
        diet: { type: "Piscívora", rescueFood: "Trocitos de pescado fresco, camarones pequeños o insectos." }
    },
    {
        name: "Garcita Blanca",
        type: "Manglares",
        scientificName: "Egretta thula",
        status: "Preocupación Menor",
        category: "Comunes",
        habitat: "Zonas costeras, pantanos y manglares.",
        description: "Garza completamente blanca de tamaño mediano, con patas negras y distintivos 'pies' amarillos, muy activa al pescar.",
        images: ["./img-frontend/garcita blanca.jpg", "./img-frontend/garcita blanca 2.jpg", "./img-frontend/garcita blanca 3.jpg", "./img-frontend/garcita blanca 4.jpg"],
        coords: [10.945, -64.100],
        diet: { type: "Piscívora", rescueFood: "Trozos de pescado fresco sin espinas, o pequeños crustáceos." }
    },
    {
        name: "Garza Morena",
        type: "Manglares",
        scientificName: "Ardea herodias",
        status: "Preocupación Menor",
        category: "Comunes",
        habitat: "Costas, manglares y grandes lagunas.",
        description: "La garza más grande de la región, de color gris azulado. Permanece inmóvil como una estatua hasta que atrapa peces con su fuerte pico.",
        images: ["./img-frontend/garza morena.jpg", "./img-frontend/garza morena 2.jpg", "./img-frontend/garza morena 3.jpg", "./img-frontend/garza morena 4.jpg"],
        coords: [10.930, -64.130],
        diet: { type: "Piscívora", rescueFood: "Pescado fresco crudo en trozos." }
    },
    {
        name: "Garza Real",
        type: "Costeras",
        scientificName: "Ardea alba",
        status: "Preocupación Menor",
        category: "Simbólicas",
        habitat: "Humedales, lagunas y costas en toda la isla.",
        description: "Gran garza blanca, elegante y majestuosa, con pico amarillo y patas negras. Sus plumas fueron muy codiciadas en el pasado.",
        images: ["./img-frontend/garza real.jpg", "./img-frontend/garza real 2.jpg", "./img-frontend/garza real 3.jpg", "./img-frontend/garza real 4.jpg"],
        coords: [10.935, -64.105],
        diet: { type: "Piscívora", rescueFood: "Pescado fresco crudo. No usar alimentos procesados." }
    },
    {
        name: "Soldadito",
        type: "Costeras",
        scientificName: "Himantopus mexicanus",
        status: "Preocupación Menor",
        category: "Comunes",
        habitat: "Humedales, lagunas y costas en toda la isla.",
        description: "Cuerpo esbelto blanco y negro. Patas rosadas extremadamente largas y pico fino, recto y negro diseñado para sondear el fango.",
        images: ["./img-frontend/soldadito.jfif", "./img-frontend/soldadito 2.jfif", "./img-frontend/soldadito 3.jfif", "./img-frontend/soldadito 4.jfif"],
        coords: [10.9944, -63.8014],
        diet: { type: "Piscívora", rescueFood: "Se alimenta de pequeños crustáceos (como la Artemia), larvas de insectos acuáticos y moluscos que extrae del lodo." }
    },
    {
        "name": "Águila Pescadora",
        "type": "Costeras",
        "scientificName": "Pandion haliaetus",
        "status": "Preocupación Menor",
        "category": "Comunes",
        "habitat": "Costas, lagunas salobres, estuarios y puertos pesqueros.",
        "description": "Gran rapaz de plumaje blanco y marrón con un antifaz oscuro. Posee garras especializadas con escamas espinosas para sujetar peces resbaladizos.",
        "images": ["./img-frontend/aguila.jfif", "./img-frontend/aguila 2.jfif", "./img-frontend/aguila 3.jfif", "./img-frontend/aguila 4.jfif"],
        "coords": [11.0000, -64.1667],
        "diet": { "type": "Piscívora", "rescueFood": "Casi exclusivamente peces vivos que captura zambulléndose con las patas por delante." }
    },
    {
        "name": "Garceta Nívea",
        "type": "Costeras",
        "scientificName": "Egretta thula",
        "status": "Preocupación Menor",
        "category": "Comunes",
        "habitat": "Lagunas costeras, manglares, salinas, playas tranquilas y ríos.",
        "description": "Garza mediana de plumaje completamente blanco. Se caracteriza por tener el pico negro, patas negras y unos llamativos dedos de color amarillo brillante.",
        "images": ["./img-frontend/garceta.jfif", "./img-frontend/garceta 2.jfif", "./img-frontend/garceta 3.jfif", "./img-frontend/garceta 4.jfif"],
        "coords": [10.912, -64.012],
        "diet": { "type": "Limícola / Piscívora", "rescueFood": "Se alimenta de pequeños peces, cangrejos, camarones e insectos acuáticos, usando técnicas de caza muy activas." }
    },
    {
        "name": "Pelícano Pardo",
        "type": "Costeras",
        "scientificName": "Pelecanus occidentalis",
        "status": "Preocupación Menor",
        "category": "Comunes",
        "habitat": "Zonas costeras, puertos pesqueros, bahías y manglares.",
        "description": "Ave marina grande y robusta, reconocible por su enorme pico provisto de una bolsa gular expandible que utiliza como red para capturar peces.",
        "images": ["./img-frontend/pelicano.jfif", "./img-frontend/pelicano 2.jfif", "./img-frontend/pelicano 3.jfif", "./img-frontend/pelicano 4.jfif"],
        "coords": [11.080, -63.960],
        "diet": { "type": "Piscívora", "rescueFood": "Se alimenta casi exclusivamente de peces que captura lanzándose espectacularmente en picada desde el aire hacia el mar." }
    },
    {
        "name": "Colibrí Anteado",
        "type": "Terrestres",
        "scientificName": "Leucippus fallax",
        "status": "Preocupación Menor",
        "category": "Comunes",
        "habitat": "Matorrales xerófilos, espinares, cardonales y áreas secas costeras.",
        "description": "Colibrí de tamaño mediano con un plumaje característico de tonos arenosos y gamuza en el vientre, ideal para camuflarse en el entorno árido.",
        "images": ["./img-frontend/colibri anteado.jfif", "./img-frontend/colibri anteado 2.jfif", "./img-frontend/colibri anteado 3.jfif", "./img-frontend/colibri anteado 4.jfif"],
        "coords": [11.015, -64.295],
        "diet": { "type": "Nectarívora", "rescueFood": "Néctar de flores de cactus (cardón, dato) y pequeños insectos capturados en el aire." }
    },
    {
        "name": "Espatula Rosada",
        "type": "Manglares",
        "scientificName": "Platalea ajaja",
        "status": "Preocupación Menor",
        "category": "Comunes",
        "habitat": "Manglares, lagunas costeras someras, marismas y salinas.",
        "description": "Ave acuática grande de espectacular plumaje rosado brillante. Su rasgo más característico es un pico largo, plano y ensanchado en la punta en forma de espátula.",
        "images": ["./img-frontend/platalea rosada.jfif", "./img-frontend/platalea rosada 2.jfif", "./img-frontend/platalea rosada 3.jfif", "./img-frontend/platalea rosada 4.jfif"],
        "coords": [10.958, -64.185],
        "diet": { "type": "Limícola", "rescueFood": "Pequeños peces, crustáceos, moluscos e insectos acuáticos que captura balanceando su pico de lado a lado en el agua." }
    },
    {
        "name": "Zarapito Trinador",
        "type": "Manglares",
        "scientificName": "Numenius hudsonicus",
        "status": "Preocupación Menor",
        "category": "Comunes",
        "habitat": "Planicies fangosas, salinas, manglares y orillas de lagunas costeras.",
        "description": "Ave playera de gran tamaño con un pico muy largo y distintivamente curvado hacia abajo. Posee un plumaje veteado en tonos pardo y gris, con listas marcadas en la corona.",
        "images": ["./img-frontend/zarapito.jfif", "./img-frontend/zarapito 2.jfif", "./img-frontend/zarapito 3.jfif", "./img-frontend/zarapito 4.jfif"],
        "coords": [10.7831, -63.9317],
        "diet": { "type": "Limícola", "rescueFood": "Cangrejos pequeños, poliquetos, moluscos e insectos que extrae del fango con su pico especializado." }
    },
    {
        "name": "Agujeta Gris",
        "type": "Costeras",
        "scientificName": "Limnodromus griseus",
        "status": "Preocupación Menor",
        "category": "Comunes",
        "habitat": "Planicies fangosas intermareales, salinas y orillas de lagunas salobres.",
        "description": "Ave playera de tamaño mediano con un pico largo y recto. Su plumaje es grisáceo en invierno y destaca por un movimiento rápido y rítmico de su pico al alimentarse en el fango.",
        "images": ["./img-frontend/agujeta.jfif", "./img-frontend/agujeta 2.jfif", "./img-frontend/agujeta 3.jfif", "./img-frontend/agujeta 4.jfif"],
        "coords": [10.7845, -63.9350],
        "diet": { "type": "Limícola", "rescueFood": "Pequeños invertebrados, poliquetos y moluscos que localiza mediante el tacto con la punta de su pico en el lodo." }
    },
    {
        "name": "Charrán Común - Gaviotin",
        "type": "Costeras",
        "scientificName": "Sterna hirundo",
        "status": "Preocupación Menor",
        "category": "Comunes",
        "habitat": "Costas, bahías, playas y salinas (Pampatar y Coche).",
        "description": "Ave marina ágil de plumaje blanco y gris, con un capuchón negro distintivo y una cola profundamente ahorquillada.",
        "images": ["./img-frontend/gaviotin.jfif", "./img-frontend/gaviotin 2.jfif", "./img-frontend/gaviotin 3.jfif", "./img-frontend/gaviotin 4.jfif"],
        "coords": [10.9936, -63.8014],
        "diet": { "type": "Piscívora", "rescueFood": "Pequeños peces que captura mediante zambullidas rápidas desde el aire." }
    },
    {
        "name": "Gaviota Guanaguanare",
        "type": "Costeras",
        "scientificName": "Leucophaeus atricilla",
        "status": "Preocupación Menor",
        "category": "Comunes",
        "habitat": "Playas, puertos pesqueros, muelles y lagunas costeras en toda la isla.",
        "description": "Gaviota de tamaño medio con un plumaje gris pizarra en el dorso. En época reproductiva luce una caperuza negra azabache inconfundible y emite un grito similar a una risa humana.",
        "images": ["./img-frontend/gaviota.jfif", "./img-frontend/gaviota 2.jfif", "./img-frontend/gaviota 3.jfif", "./img-frontend/gaviota 4.jfif"],
        "coords": [10.9556, -63.8475],
        "diet": { "type": "Omnívora / Piscívora", "rescueFood": "Dieta variada que incluye peces, crustáceos, insectos y restos de comida. Es una experta cleptoparásita (roba comida de otras aves)." }
    },
    {
        "name": "Busardo Coliblanco-Gavilán Coliblanco",
        "type": "De Interior",
        "scientificName": "Geranoaetus albicaudatus",
        "status": "Preocupación Menor",
        "category": "Comunes",
        "habitat": "Zonas abiertas, sabanas, pastizales y matorrales áridos o semiáridos.",
        "description": "Gran ave de presa robusta. Los adultos son gris oscuro por encima con los hombros de un llamativo color canela o castaño, pecho blanco y una cola blanca corta con una banda negra terminal.",
        "images": ["./img-frontend/coliblanco.jfif", "./img-frontend/coliblanco 2.jfif", "./img-frontend/coliblanco 3.jfif", "./img-frontend/coliblanco 4.jfif"],
        "coords": [11.0100, -64.3800],
        "diet": { "type": "Carnívora", "rescueFood": "Se alimenta de una amplia variedad de presas que incluyen pequeños mamíferos, lagartijas, serpientes, insectos grandes y ocasionalmente otras aves." }
    },
    {
        "name": "Cotara - Rascón de Manglar",
        "type": "Manglares",
        "scientificName": "Rallus longirostris",
        "status": "Preocupación Menor",
        "category": "Comunes",
        "habitat": "Manglares densos, marismas salobres y orillas fangosas intermareales.",
        "description": "Ave de hábitos sumamente discretos y cuerpo comprimido lateralmente, ideal para desplazarse entre las raíces del manglar. Posee un pico largo y patas robustas para caminar en el lodo.",
        "images": ["./img-frontend/cotara.jfif", "./img-frontend/cotara2.jfif", "./img-frontend/cotara3.jfif", "./img-frontend/cotara4.jfif"],
        "coords": [10.975, -64.195],
        "diet": { "type": "Omnívora / Limícola", "rescueFood": "Se alimenta de pequeños cangrejos de manglar, caracoles, insectos acuáticos y ocasionalmente semillas." }
    },
    {
        name: "Guitío",
        type: "De Interior",
        scientificName: "Synallaxis",
        status: "Preocupación Menor",
        category: "Comunes",
        habitat: "Matorrales xerófilos y bosques secos.",
        description: "Pequeñas aves insectívoras, escurridizas y de colores marrones, conocidas por sus cantos repetitivos entre los arbustos densos.",
        images: ["./img-frontend/guitio.jpg", "./img-frontend/guitio 2.jpg", "./img-frontend/guitio 3.jpg", "./img-frontend/guitio 4.jpg"],
        coords: [10.935, -64.055],
        diet: { type: "Insectívora", rescueFood: "Insectos pequeños, gusanos de harina. Evitar frutas." }
    },
    {
        "name": "Caracara Carancho-Caricare",
        "type": "De Interior",
        "scientificName": "Caracara plancus",
        "status": "Preocupación Menor",
        "category": "Comunes",
        "habitat": "Zonas abiertas, sabanas, áreas agrícolas y bordes de carreteras.",
        "description": "Gran falcónido terrestre. Destaca por su cara desnuda de color naranja o rojo brillante, un gran pico ganchudo grisáceo, un gorro negro y un plumaje barrado blanco y negro en el pecho.",
        "images": ["./img-frontend/caracare.jfif", "./img-frontend/caracare 2.jfif", "./img-frontend/caracare 3.jfif", "./img-frontend/caracare 4.jfif"],
        "coords": [11.008, -63.938],
        "diet": { "type": "Omnívora / Carroñera", "rescueFood": "Altamente oportunista. Consume carroña, pequeños mamíferos, reptiles, insectos, cangrejos y huevos de otras aves." }
    },
    {
        "name": "Tijereta Sabanera",
        "type": "De Interior",
        "scientificName": "Tyrannus savana",
        "status": "Preocupación Menor",
        "category": "Migratorias",
        "habitat": "Sabanas, pastizales, bordes de bosque y áreas abiertas de toda la isla.",
        "description": "Ave extremadamente elegante con una cola bifurcada que puede triplicar el largo de su cuerpo. Posee corona negra, dorso gris y vientre blanco puro.",
        "images": ["./img-frontend/tijereta.jfif", "./img-frontend/tijereta 2.jfif", "./img-frontend/tijereta 3.jfif", "./img-frontend/tijereta 4.jfif"],
        "coords": [10.942, -63.978],
        "diet": { "type": "Insectívora", "rescueFood": "Captura insectos en vuelo con gran agilidad y consume frutos pequeños durante sus largos viajes migratorios." }
    },
    {
        "name": "Paloma Bravía",
        "type": "De Interior",
        "scientificName": "Columba livia",
        "status": "Preocupación Menor",
        "category": "Comunes",
        "habitat": "Áreas urbanas, plazas, muelles, edificios y granjas.",
        "description": "Ave muy familiar de plumaje grisáceo con reflejos iridiscentes verdes y púrpuras en el cuello. Posee dos barras negras en las alas y un comportamiento gregario.",
        "images": ["./img-frontend/paloma.jfif", "./img-frontend/paloma 2.jfif", "./img-frontend/paloma 3.jfif", "./img-frontend/paloma 4.jfif"],
        "coords": [10.962, -63.848],
        "diet": { "type": "Granívora", "rescueFood": "Principalmente semillas y granos, aunque en entornos urbanos aprovecha restos de alimentos proporcionados por humanos." }
    },
    {
        "name": "Esmeralda Coliazul",
        "type": "De Interior",
        "scientificName": "Chlorostilbon mellisugus",
        "status": "Preocupación Menor",
        "category": "Comunes",
        "habitat": "Bosques deciduos, jardines, bordes de manglares y matorrales húmedos.",
        "description": "Colibrí pequeño de cuerpo verde esmeralda iridiscente. Su cola es ahorquillada y de un color azul oscuro metálico. El pico es corto, recto y negro.",
        "images": ["./img-frontend/coliazul.jfif", "./img-frontend/coliazul 2.jfif", "./img-frontend/coliazul 3.jfif", "./img-frontend/coliazul 4.jfif"],
        "coords": [11.005, -63.910],
        "diet": { "type": "Nectarívora", "rescueFood": "Néctar de una gran variedad de flores y pequeños insectos que captura en pleno vuelo." }
    },
    {
        "name": "Garceta Tricolor-Garza Pechiblanca",
        "type": "Costeras",
        "scientificName": "Egretta tricolor",
        "status": "Preocupación Menor",
        "category": "Comunes",
        "habitat": "Manglares, lagunas costeras someras, marismas y salinas.",
        "description": "Garza esbelta de plumaje azul-pizarra. Se distingue por su vientre blanco puro, una línea blanca con tonos rojizos que baja por su cuello y su pico muy fino y largo.",
        "images": ["./img-frontend/tricolor.jfif", "./img-frontend/tricolor 2.jfif", "./img-frontend/tricolor 3.jfif", "./img-frontend/tricolor 4.jfif"],
        "coords": [10.922, -64.158],
        "diet": { "type": "Piscívora / Limícola", "rescueFood": "Se alimenta principalmente de peces pequeños, capturándolos mientras camina rápidamente por aguas someras." }
    },
    {
        name: "Lechuza de Campanario",
        type: "De Interior",
        scientificName: "Tyto alba",
        status: "Preocupación Menor",
        category: "Comunes",
        habitat: "Áreas urbanas, iglesias antiguas, campos y bosques.",
        description: "Nocturna y sigilosa. Posee un disco facial en forma de corazón. Excelente cazadora de roedores.",
        images: ["./img-frontend/lechuza.jpg", "./img-frontend/lechuza 2.jpg", "./img-frontend/lechuza 3.jpg"],
        coords: [11.025, -63.905],
        diet: { type: "Carnívora", rescueFood: "Carne cruda de pollo o res en trocitos sin grasa. Contactar a un veterinario." }
    },
    {
        name: "Pecho Colorado",
        type: "De Interior",
        scientificName: "Sturnella magna",
        status: "Preocupación Menor",
        category: "Comunes",
        habitat: "Sabanas abiertas y pastizales.",
        description: "Reconocible por su brillante pecho amarillo o rojo con una marca en forma de 'V' negra y su canto melodioso y aflautado.",
        images: ["./img-frontend/pecho.jpg", "./img-frontend/pecho 2.jpg", "./img-frontend/pecho 3.jpg", "./img-frontend/pecho 4.jpg"],
        coords: [10.952, -63.968],
        diet: { type: "Omnívora", rescueFood: "Principalmente insectos y gusanos, algunas semillas suaves." }
    },
    {
        name: "Perico Cara Sucia",
        type: "De Interior",
        scientificName: "Eupsittula pertinax",
        status: "Preocupación Menor",
        category: "Comunes",
        habitat: "Zonas urbanas, matorrales y bosques.",
        description: "Llamado así por su coloración facial marrón. Muy ruidosos y sociales, se mueven en bandadas rápidas y alegres.",
        images: ["./img-frontend/perico cara sucia.jpg", "./img-frontend/perico cara sucia 2.jpg", "./img-frontend/perico cara sucia 3.jpg", "./img-frontend/perico cara sucia 4.jpg"],
        coords: [10.992, -63.860],
        diet: { type: "Granívora/Frugívora", rescueFood: "Semillas pequeñas, frutas dulces, avena, maíz tierno." }
    },
    {
        name: "Pico de Tijera",
        type: "De Interior",
        scientificName: "Rynchops niger",
        status: "Preocupación Menor",
        category: "Comunes",
        habitat: "Costas y lagunas poco profundas.",
        description: "Su mandíbula inferior es más larga que la superior, lo que le permite volar rasando el agua para atrapar peces en la superficie.",
        images: ["./img-frontend/pico.jpg", "./img-frontend/pico 2.jpg", "./img-frontend/pico 3.jpg", "./img-frontend/pico 4.jpg"],
        coords: [10.908, -64.125],
        diet: { type: "Piscívora", rescueFood: "Pescado fresco pequeño. Alimentación especializada." }
    },
    {
        name: "Playero",
        type: "De Interior",
        scientificName: "Calidris",
        status: "Preocupación Menor",
        category: "Comunes",
        habitat: "Playas arenosas y orillas de lagunas.",
        description: "Aves pequeñas que corren velozmente por la orilla del mar siguiendo las olas para buscar pequeños crustáceos y moluscos.",
        images: ["./img-frontend/playero.jpg", "./img-frontend/playero 2.jpg", "./img-frontend/playero 3.jpg", "./img-frontend/playero 4.jpg"],
        coords: [11.078, -63.895],
        diet: { type: "Insectívora", rescueFood: "Pequeños gusanos, insectos o crustáceos picados." }
    },
    {
        "name": "Zamuro",
        "type": "De Interior",
        "scientificName": "Coragyps atratus",
        "status": "Preocupación Menor",
        "category": "Comunes",
        "habitat": "Áreas urbanas, vertederos, zonas costeras, campos abiertos y sabanas de la isla.",
        "description": "Ave de gran tamaño con plumaje negro opaco. Su cabeza y cuello no tienen plumas y muestran una piel gris oscura y rugosa. En vuelo revela manchas blancas en las puntas de las alas.",
        "images": ["./img-frontend/zamuro.jfif", "./img-frontend/zamuro 2.jfif", "./img-frontend/zamuro 3.jfif", "./img-frontend/zamuro 4.jfif"],
        "coords": [10.945, -63.922],
        "diet": { "type": "Carroñera", "rescueFood": "Alimentación casi exclusiva a base de carroña. Actúa como un limpiador biológico clave en los ecosistemas de Nueva Esparta." }
    },
    {
        "name": "Cormorán Biguá-Cotua",
        "type": "Costeras",
        "scientificName": "Nannopterum brasilianum",
        "status": "Preocupación Menor",
        "category": "Comunes",
        "habitat": "Costas marìtimas, lagunas salobres, manglares y muelles pesqueros.",
        "description": "Ave acuática de color negro con un tinte oliváceo. Posee un cuello largo, cola delgada y un pico ganchudo. Es famoso por su técnica de buceo y por secar sus alas al sol tras pescar.",
        "images": ["./img-frontend/cotua.jfif", "./img-frontend/cotua 2.jfif", "./img-frontend/cotua 3.jfif", "./img-frontend/cotua 4.jfif"],
        "coords": [11.083, -63.970],
        "diet": { "type": "Piscívora", "rescueFood": "Se alimenta exclusivamente de peces que captura buceando a grandes profundidades, impulsándose con sus potentes patas palmeadas." }
    },
    {
        "name": "Tangara Azuleja-Azulejo de jardin",
        "type": "De Interior",
        "scientificName": "Thraupis episcopus",
        "status": "Preocupación Menor",
        "category": "Comunes",
        "habitat": "Jardines, parques urbanos, bordes de bosque, plantaciones frutales y bosques secundarios.",
        "description": "Ave de color azul grisáceo pálido con hombros de un azul más intenso. Es muy social, ruidosa y una presencia constante en los comederos de frutas de la isla.",
        "images": ["./img-frontend/azuleja.jfif", "./img-frontend/azuleja 2.jfif", "./img-frontend/azuleja 3.jfif", "./img-frontend/azuleja 4.jfif"],
        "coords": [10.978, -63.888],
        "diet": { "type": "Frugívora / Omnívora", "rescueFood": "Se alimenta principalmente de frutas (papaya, cambur, bayas) y complementa con insectos que busca entre el follaje." }
    },
    {
        "name": "Carpintero Coronirrojo",
        "type": "De Interior",
        "scientificName": "Melanerpes rubricapillus",
        "status": "Preocupación Menor",
        "category": "Comunes",
        "habitat": "Bosques secos, jardines urbanos, manglares y arboledas abiertas.",
        "description": "Ave carpintera muy común en la isla. Se distingue por su lomo barreteado de blanco y negro ('habado') y su corona roja intensa en los machos. Es un visitante frecuente de comederos con frutas.",
        "images": ["./img-frontend/carpintero.jfif", "./img-frontend/carpintero 2.jfif", "./img-frontend/carpintero 3.jfif", "./img-frontend/carpintero 4.jfif"],
        "coords": [11.028, -63.875],
        "diet": { "type": "Omnívora", "rescueFood": "Consume una gran variedad de insectos, arañas, néctar y muchas frutas como papaya y banano." }
    },
    {
        "name": "Diamante Cebra",
        "type": "De Interior",
        "scientificName": "Taeniopygia guttata",
        "status": "Introducida / Exótica",
        "category": "Ornamentales",
        "habitat": "Zonas urbanas, jardines y áreas antrópicas.",
        "description": "Ave pequeña y robusta. El macho destaca por sus mejillas color naranja, pico rojo brillante y un patrón de finas rayas negras y blancas en el pecho que recuerda a una cebra.",
        "images": ["./img-frontend/diamante.jfif", "./img-frontend/diamante 2.jfif", "./img-frontend/diamante 3.jfif", "./img-frontend/diamante 4.jfif"],
        "coords": [10.995, -63.808],
        "diet": { "type": "Granívora", "rescueFood": "Principalmente semillas de mijo y alpiste, complementando con pequeños brotes de hierba." }
    },
    {
        "name": "Pato Negro",
        "type": "De Interior",
        "scientificName": "Cairina moschata",
        "status": "Preocupación Menor",
        "category": "Comunes",
        "habitat": "Lagunas costeras, pantanos, humedales arbolados y estanques de agua dulce o salobre.",
        "description": "El pato más grande de la isla. Plumaje negro con intensos reflejos verdes y púrpuras. Presenta grandes parches blancos en las alas y una cara desnuda con carúnculas rojas prominentes.",
        "images": ["./img-frontend/negro.jfif", "./img-frontend/negro 2.jfif", "./img-frontend/negro 3.jfif", "./img-frontend/negro 4.jfif"],
        "coords": [11.000, -63.942],
        "diet": { "type": "Omnívora", "rescueFood": "Consume una gran variedad de plantas acuáticas, semillas, pequeños peces, crustáceos e insectos que busca en el fondo de los humedales." }
    },
    {
        "name": "Semillero Pechirrufo",
        "type": "De Interior",
        "scientificName": "Sporophila minuta",
        "status": "Preocupación Menor",
        "category": "Comunes",
        "habitat": "Sabanas, pastizales, áreas agrícolas, bordes de caminos y jardines con gramíneas.",
        "description": "Ave diminuta (~9 cm). El macho es inconfundible por su pecho y rabadilla de color canela (rufo) y su dorso gris plomizo. La hembra es de un marrón anteado discreto. Posee un pico cónico muy fuerte.",
        "images": ["./img-frontend/semillero.jfif", "./img-frontend/semillero 2.jfif", "./img-frontend/semillero 3.jfif", "./img-frontend/semillero 4.jfif"],
        "coords": [10.932, -63.998],
        "diet": { "type": "Granívora", "rescueFood": "Principalmente semillas de pastos y malezas. En cautiverio acepta mijo, alpiste y pequeños trozos de fruta." }
    },
    {
        "name": "Bienteveo Rayado-Atrapa Moscas",
        "type": "De Interior",
        "scientificName": "Myiodynastes maculatus",
        "status": "Preocupación Menor",
        "category": "Comunes",
        "habitat": "Bordes de bosque húmedo, dosel de matorrales altos, manglares y arboledas densas.",
        "description": "Gran atrapamoscas de unos 21 cm. Destaca por su plumaje densamente rayado de negro y pardo, una fuerte ceja blanca, un antifaz oscuro y una corona amarilla brillante que suele mantener oculta.",
        "images": ["./img-frontend/mosca.jfif", "./img-frontend/mosca 2.jfif", "./img-frontend/mosca 3.jfif", "./img-frontend/mosca 4.jfif"],
        "coords": [11.018, -63.940],
        "diet": { "type": "Insectívora / Frugívora", "rescueFood": "Grandes insectos capturados al vuelo (escarabajos, cigarras) y lagartijas pequeñas; también consume bayas silvestres." }
    },
    {
        name: "Porrón Acollarado-Pato Collar",
        type: "Migratoria",
        scientificName: "Aythya collaris",
        status: "Migratorio Boreal / Raro",
        category: "Comunes",
        habitat: "Lagunas de agua dulce, estanques de estabilización, salinas someras y humedales costeros.",
        habitats: ["Migratoria", "Costeras"],
        "description": "Pato buceador de tamaño mediano. El macho tiene la cabeza, pecho y dorso negros, costados grises limpios y un distintivo anillo blanco en el pico. El collar castaño en el cuello es sutil y difícil de ver en el campo.",
        "images": ["./img-frontend/porron.jfif", "./img-frontend/porron 2.jfif", "./img-frontend/porron 3.jfif", "./img-frontend/porron 4.jfif"],
        "coords": [10.9910, -63.7950],
        "diet": { "type": "Omnívora", "rescueFood": "Se alimenta buceando para conseguir plantas acuáticas, semillas, moluscos, caracoles e insectos acuáticos." }
    },
    {
        "name": "Varillero Capuchino-Turpial de Agua",
        "type": "De Interior",
        "scientificName": "Chrysomus icterocephalus",
        "status": "Residente Estable / Reciente",
        "category": "Especiales",
        "habitat": "Humedales de agua dulce o salobre, juncales de Typha, manglares y bordes de lagunas.",
        "description": "Ictérido inconfundible. El macho luce una capucha amarilla vibrante sobre un cuerpo negro azabache. La hembra es de un tono marrón oliva con garganta amarilla pálida. Muy ligado a ambientes acuáticos.",
        "images": ["./img-frontend/agua.jfif", "./img-frontend/agua 2.jfif", "./img-frontend/agua 3.jfif", "./img-frontend/agua 4.jfif"],
        "coords": [10.938, -64.020],
        "diet": { "type": "Insectívora / Granívora", "rescueFood": "Se alimenta de insectos acuáticos, larvas y semillas de gramíneas. En la isla aprovecha la vegetación emergente de los humedales." }
    },
    {
        "name": "Paloma Isleña",
        "type": "De Interior",
        "scientificName": "Patagioenas squamosa",
        "status": "Preocupación Menor",
        "category": "Especiales",
        "habitat": "Bosques húmedos montanos, selvas nubladas y dosel de árboles altos.",
        "description": "Una paloma grande de color gris pizarra. Su rasgo más espectacular es el cuello, con plumas iridiscentes que parecen escamas metálicas de color púrpura y bronce. Tiene un anillo ocular rojo muy llamativo.",
        "images": ["./img-frontend/islena.jfif", "./img-frontend/islena 2.jfif", "./img-frontend/islena 3.jfif", "./img-frontend/islena 4.jfif"],
        "coords": [11.008, -63.928],
        "diet": { "type": "Frugívora", "rescueFood": "Se alimenta principalmente de frutas y bayas silvestres en la copa de los árboles; ocasionalmente consume semillas." }
    },
    {
        "name": "Añapero Ñacundá",
        "type": "De Interior",
        "scientificName": "Chordeiles nacunda",
        "status": "Preocupación Menor",
        "category": "Especiales",
        "habitat": "Sabanas secas, pastizales, campos abiertos y terrenos arenosos con vegetación dispersa.",
        "description": "Un aguaitacaminos excepcionalmente grande (~28 cm). Plumaje críptico jaspeado de marrón, gris y negro que imita la hojarasca o el suelo. Destaca una gran mancha blanca en la garganta y parches blancos muy visibles en las alas durante el vuelo.",
        "images": ["./img-frontend/anapero.jfif", "./img-frontend/anapero 2.jfif", "./img-frontend/anapero 3.jfif", "./img-frontend/anapero 4.jfif"],
        "coords": [10.990, -64.215],
        "diet": { "type": "Insectívora", "rescueFood": "Caza en pleno vuelo durante el crepúsculo y la noche, capturando grandes insectos voladores como escarabajos, polillas y cigarras." }
    },
    {
        "name": "Garza Chiflona",
        "type": "Costeras",
        "scientificName": "Syrigma sibilatrix",
        "status": "Preocupación Menor",
        "category": "Comunes",
        "habitat": "Sabanas estacionalmente inundadas, pastizales, campos agrícolas y bordes de carreteras.",
        "description": "Una garza única de hábitos menos acuáticos que sus parientes. Presenta un cuello ocre amarillento, piel facial azul brillante y un pico rosado con punta negra. Su nombre proviene de su distintivo canto silbado.",
        "images": ["./img-frontend/chiflona.jfif", "./img-frontend/chiflona 2.jfif", "./img-frontend/chiflona 3.jfif", "./img-frontend/chiflona 4.jfif"],
        "coords": [11.012, -63.958],
        "diet": { "type": "Carnívora / Insectívora", "rescueFood": "Se alimenta de una gran variedad de insectos (libélulas, saltamontes), arañas, lombrices y pequeños vertebrados como lagartijas." }
    },
    {
        "name": "Cardenilla Enmascarada",
        "type": "De Interior",
        "scientificName": "Paroaria nigrogenis",
        "status": "Preocupación Menor",
        "category": "Comunes",
        "habitat": "Bordes de manglares, humedales costeros, bosques de galería y áreas pantanosas.",
        "description": "Tangara inconfundible por su capucha roja brillante y su 'máscara' negra que cubre ojos y mejillas. Posee un dorso gris pizarra y partes inferiores blancas limpias. Muy ligada a cuerpos de agua.",
        "images": ["./img-frontend/cardenilla.jfif", "./img-frontend/cardenilla 2.jfif", "./img-frontend/cardenilla 3.jfif", "./img-frontend/cardenilla 4.jfif"],
        "coords": [10.915, -64.000],
        "diet": { "type": "Omnívora", "rescueFood": "Consume una variedad de semillas, frutos de arbustos costeros e insectos pequeños forrajeados cerca del agua." }
    },
    {
        "name": "Paloma Colorada",
        "type": "De Interior",
        "scientificName": "Patagioenas cayennensis",
        "status": "Preocupación Menor",
        "category": "Comunes",
        "habitat": "Bordes de bosque húmedo, bosques secundarios, manglares altos y zonas arboladas semiabiertas.",
        "description": "Paloma grande y esbelta. El macho destaca por su plumaje de un tono marrón rojizo (rufo-vináceo) opaco en el dorso y pecho, corona con destellos cobrizos iridiscentes y una cola grisácea. Ojos de un color rojo o naranja brillante.",
        "images": ["./img-frontend/colo.jfif", "./img-frontend/colo 2.jfif", "./img-frontend/colo 3.jfif", "./img-frontend/colo 4.jfif"],
        "coords": [10.985, -63.892],
        "diet": { "type": "Frugívora", "rescueFood": "Principalmente frutas pequeñas, bayas de árboles del dosel e insectos pequeños de forma muy ocasional." }
    },
    {
        "name": "Martinete Coronado",
        "type": "Costeras",
        "scientificName": "Nyctanassa violacea",
        "status": "Preocupación Menor",
        "category": "Comunes",
        "habitat": "Manglares, lagunas costeras, estuarios, playas fangosas y orillas de cuerpos de agua salobre.",
        "description": "Garza mediana y robusta de hábitos mayormente nocturnos. Destaca por su cuerpo gris azulado, cabeza negra con una corona de color crema o amarillento pálido, y una característica línea blanca-crema debajo del ojo. Sus patas son largas y amarillas, y posee un pico negro, grueso y fuerte.",
        "images": ["./img-frontend/martinete.jfif", "./img-frontend/martinete 2.jfif", "./img-frontend/martinete 3.jfif", "./img-frontend/martinete 4.jfif"],
        "coords": [10.9792, -63.8441],
        "diet": {
            "type": "Carnívora (Especializada)",
            "rescueFood": "Principalmente crustáceos como cangrejos y jaibas, aunque también consume peces pequeños, lagartijas e insectos acuáticos."
        }
    },
    {
        "name": "Reinita Amarilla",
        "type": "De Interior",
        "scientificName": "Setophaga aestiva",
        "status": "Preocupación Menor",
        "category": "Comunes",
        "habitat": "Manglares costeros, jardines arbolados, matorrales húmedos y bordes de bosque.",
        "description": "Ave pequeña de plumaje amarillo brillante. El macho presenta finas estrías rojizas en el pecho. Es sumamente inquieta, saltando de rama en rama mientras emite un canto musical agudo.",
        "images": ["./img-frontend/reinita.jfif", "./img-frontend/reinita 2.jfif", "./img-frontend/reinita 3.jfif", "./img-frontend/reinita 4.jfif"],
        "coords": [10.918, -64.032],
        "diet": { "type": "Insectívora", "rescueFood": "Se alimenta principalmente de pequeños insectos y arañas que busca activamente entre el follaje de los mangles y árboles." }
    },
    {
        "name": "Aguja Canela",
        "type": "Migratoria",
        "scientificName": "Limosa fedoa",
        "status": "Migratorio Boreal / Raro",
        "category": "Especiales",
        "habitat": "Playas arenosas, lagunas costeras someras, salinas y planicies fangosas e intermareales.",
        "habitats": ["Migratoria", "Costeras"],
        "description": "Ave playera de gran tamaño. Destaca por su plumaje moteado de un cálido color canela ocráceo y un pico extraordinariamente largo, delgado y ligeramente curvado hacia arriba, con base rosada y punta negra.",
        "images": ["./img-frontend/aguja.jfif", "./img-frontend/aguja 2.jfif", "./img-frontend/aguja 3.jfif", "./img-frontend/aguja 4.jfif"],
        "coords": [10.9912, -63.7944],
        "diet": { "type": "Carnívora / Invertebrados", "rescueFood": "Introduce su largo pico en el lodo blando para capturar gusanos marinos, pequeños cangrejos, moluscos e insectos acuáticos." }
    },
    {
        "name": "Garrapatero Asurcado-Tijereto",
        "type": "De Interior",
        "scientificName": "Crotophaga sulcirostris",
        "status": "Preocupación Menor",
        "category": "Comunes",
        "habitat": "Pastizales, campos agrícolas, matorrales secos y áreas abiertas con presencia de ganado.",
        "description": "Ave de plumaje completamente negro con reflejos sutiles azulados y púrpuras. Destaca su cola larga y un pico alto, comprimido y curvado que presenta distintivos surcos o estrías longitudinales.",
        "images": ["./img-frontend/garrapatero.jfif", "./img-frontend/garrapatero 2.jfif", "./img-frontend/garrapatero 3.jfif", "./img-frontend/garrapatero 4.jfif"],
        "coords": [11.0167, -63.9500],
        "diet": { "type": "Omnívora / Insectívora", "rescueFood": "Principalmente insectos grandes (saltamontes, escarabajos), garrapatas, lagartijas y ocasionalmente frutas o semillas silvestres." }
    },
    {
        name: "Playero Blanco",
        type: "Migratoria",
        scientificName: "Calidris alba",
        status: "Preocupación Menor",
        category: "Comunes",
        habitat: "Playas costeras.",
        habitats: ["Migratoria", "Costeras"],
        description: "A menudo vistos en grupos, tienen un plumaje invernal muy blanco y corren rápidamente escapando de las olas rompientes.",
        images: ["./img-frontend/playero blanco.jpg", "./img-frontend/playero blanco 2.jpg", "./img-frontend/playero blanco 3.jpg", "./img-frontend/playero blanco 4.jpg"],
        coords: [10.985, -63.805],
        diet: { type: "Insectívora", rescueFood: "Pequeños moluscos o gusanos." }
    },
    {
        name: "Ñángaro",
        type: "Manglares",
        scientificName: "Aratinga acuticaudata neoxena",
        status: "En Peligro",
        category: "En Peligro",
        habitat: "Endémico de la Isla de Margarita, habita manglares como los del Parque Nacional Laguna de La Restinga.",
        description: "Especie de loro verde de cola afilada y corona azul. Está gravemente amenazado por la pérdida de su hábitat y la caza ilegal.",
        images: ["./img-frontend/ñangaro.jpg", "./img-frontend/ñangaro 2.jpg", "./img-frontend/ñangaro 3.jpg", "./img-frontend/ñangaro 4.jpg"],
        coords: [10.98, -64.16],
        diet: { type: "Granívora/Frugívora", rescueFood: "Frutas de mangle, frutos carnosos, semillas suaves." }
    },
    {
        name: "Gavilán Habado",
        type: "De Interior",
        scientificName: "Rupornis magnirostris",
        status: "Preocupación Menor",
        category: "Comunes",
        habitat: "Ampliamente distribuido en la Isla de Margarita. Se encuentra en zonas de vegetación abierta, matorrales, bordes de bosque, zonas agrícolas y periferias urbanas. Es uno de los halcones más comunes y fáciles de observar en la isla.",
        description: "Rapaz de tamaño mediano, inconfundible por su pecho barrado horizontalmente en tonos rufos y blancos (de ahí su nombre 'habado'). Presenta partes superiores pardas y la cola con bandas oscuras. Muy vocal, emite un grito agudo y característico que se escucha con frecuencia en el campo. Se alimenta principalmente de pequeños reptiles, ranas, insectos grandes y ratones.",
        images: ["./img-frontend/gavilan habado.jpg", "./img-frontend/gavilan habado 2.jpg", "./img-frontend/gavilan habado 3.jpg", "./img-frontend/gavilan habado 4.jpg"],
        coords: [11.00, -64.00],
        diet: { type: "Carnívora", rescueFood: "Trocitos pequeños de carne cruda de pollo o res sin grasa, ni condimentos. Contactar a un veterinario o a INPARQUES lo antes posible." }
    }
];

window.nativeBirdsData = nativeBirds; // Asegurar que sea global para ModalManager

window.getConditionColor = function (category) {
    switch (category) {
        case 'En Peligro': return { bg: 'rgba(239, 68, 68, 0.2)', text: '#ef4444' };
        case 'Comunes': return { bg: 'rgba(16, 185, 129, 0.2)', text: '#10b981' };
        case 'Simbólicas': return { bg: 'rgba(139, 92, 246, 0.2)', text: '#8b5cf6' };
        case 'Protegidas': return { bg: 'rgba(59, 130, 246, 0.2)', text: '#3b82f6' };
        default: return { bg: 'rgba(148, 163, 184, 0.2)', text: '#94a3b8' };
    }
};

window.currentAlbumFilters = {
    category: 'Todas',
    type: 'Todas',
    search: '',
    layout: 'grid'
};

window.toggleBitacoraLayout = function () {
    const layouts = ['grid', 'cloud', 'constellation'];
    const currentIndex = layouts.indexOf(window.currentAlbumFilters.layout);
    const nextIndex = (currentIndex + 1) % layouts.length;
    window.currentAlbumFilters.layout = layouts[nextIndex];

    const btn = document.getElementById('bitacora-layout-toggle');
    if (btn) {
        if (window.currentAlbumFilters.layout === 'grid') btn.innerHTML = '🔲 Vista: Tarjetas';
        if (window.currentAlbumFilters.layout === 'cloud') btn.innerHTML = '☁️ Vista: Nube Orgánica';
        if (window.currentAlbumFilters.layout === 'constellation') btn.innerHTML = '🌌 Vista: Constelación';
    }

    window.renderSpeciesAlbum();
};

window.updateSpeciesFilter = function (filterType, value) {
    if (filterType === 'category') {
        window.currentAlbumFilters.category = value;
    } else if (filterType === 'type') {
        window.currentAlbumFilters.type = value;
    } else if (filterType === 'search') {
        window.currentAlbumFilters.search = value.toLowerCase();
    }
    window.renderSpeciesAlbum();
};

window.renderSpeciesAlbum = function () {
    const container = document.getElementById('species-album-container');
    if (!container) return;

    // 1. Filtrar aves por categoría, tipo y texto de búsqueda
    let filteredBirds = nativeBirds;
    if (window.currentAlbumFilters.category !== 'Todas') {
        filteredBirds = filteredBirds.filter(bird => bird.category === window.currentAlbumFilters.category);
    }
    if (window.currentAlbumFilters.type !== 'Todas') {
        const filterType = window.currentAlbumFilters.type;
        filteredBirds = filteredBirds.filter(bird => {
            // Verificar el tipo principal
            if (bird.type === filterType) return true;
            // Verificar el array de hábitats múltiples (para aves migratorias-costeras)
            if (Array.isArray(bird.habitats) && bird.habitats.includes(filterType)) return true;
            return false;
        });
    }
    if (window.currentAlbumFilters.search) {
        filteredBirds = filteredBirds.filter(bird => bird.name.toLowerCase().includes(window.currentAlbumFilters.search));
    }

    if (filteredBirds.length === 0) {
        container.style = "display: block;";
        container.innerHTML = '<div style="text-align: center; color: var(--text-muted); font-size: 1.2rem; margin-top: 4rem; padding: 2rem; background: rgba(0,0,0,0.2); border-radius: 12px;">No se encontraron aves con esos filtros. Intenta otra búsqueda.</div>';
        return;
    }

    // 2. Renderizar según el layout actual
    const layoutMode = window.currentAlbumFilters.layout;

    // Si la vista actual no es la Vista en Tarjeta (grid), detener cualquier audio activo
    if (layoutMode !== 'grid') {
        window.stopActiveBirdAudio();
    }

    // Efecto de fade in (animación de transición)
    container.style.opacity = '0';
    setTimeout(() => { container.style.opacity = '1'; }, 50);

    if (layoutMode === 'grid') {
        container.className = '';
        container.style.cssText = "display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap: 1.8rem; transition: opacity 0.4s ease-in-out;";
        container.innerHTML = filteredBirds.map((bird, idx) => {
            const colors = window.getConditionColor(bird.category);
            return `
                <div class="glass-effect species-card-grid" style="border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.35s cubic-bezier(0.175,0.885,0.32,1.275), box-shadow 0.35s ease; box-shadow: 0 6px 20px rgba(0,0,0,0.35); height: 420px; position: relative; animation: cardFadeIn 0.45s cubic-bezier(0.215, 0.610, 0.355, 1.000) both; animation-delay: ${idx * 25}ms;" onmouseover="this.style.transform='translateY(-8px)'; this.style.boxShadow='0 20px 40px rgba(0,0,0,0.55)'" onmouseout="this.style.transform='none'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.35)'">
                    <!-- Photo Area -->
                    <div style="height: 220px; width: 100%; flex-shrink: 0; position: relative; overflow: hidden; background: #0a0f1e;">
                        <img src="${bird.images[0]}" alt="${bird.name}" style="width: 100%; height: 100%; object-fit: cover; object-position: center; cursor:pointer; transition: transform 0.5s ease;" onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform='scale(1)'" onclick="window.modalManager.openBirdDetails(window.nativeBirdsData.find(b=>b.name==='${bird.name}'))">
                        <!-- gradient overlay -->
                        <div style="position:absolute; bottom:0; left:0; right:0; height:60%; background: linear-gradient(to top, rgba(15,23,42,0.95), transparent); pointer-events:none;"></div>
                        <!-- Badges on image -->
                        <div style="position:absolute; top:10px; left:10px; display:flex; gap:0.4rem; flex-wrap:wrap;">
                            <span style="background: ${colors.bg}; color: ${colors.text}; padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.72rem; font-weight: 700; backdrop-filter: blur(6px);">${bird.category}</span>
                            <span class="type-badge" style="padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.72rem; font-weight: 600; backdrop-filter: blur(6px);">${bird.type}</span>
                        </div>
                    </div>
                    <!-- Info Area -->
                    <div style="flex: 1; padding: 1rem 1rem 0.8rem; display: flex; flex-direction: column; justify-content: space-between;">
                        <div>
                            <h3 class="species-title" style="font-size: 1.05rem; margin: 0 0 0.2rem 0; line-height: 1.25; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${bird.name}</h3>
                            <p class="species-scientific" style="font-size: 0.8rem; font-style: italic; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${bird.scientificName}</p>
                        </div>
                        <div style="display: flex; gap: 0.5rem; width: 100%; margin-top: 0.7rem;">
                            <button class="btn btn-outline" style="flex: 1; padding: 0.45rem 0.2rem; font-size: 0.78rem; border-radius: 8px;" onclick="window.modalManager.openBirdDetails(window.nativeBirdsData.find(b=>b.name==='${bird.name}'))">🔍 Detalles</button>
                            <button class="btn btn-primary" style="flex: 1; padding: 0.45rem 0.2rem; font-size: 0.78rem; border-radius: 8px;" onclick="window.showBirdOnMap('${bird.name}')">🗺️ Mapa</button>
                        </div>
                    </div>
                </div>
                `;
        }).join('');
    }
    else if (layoutMode === 'cloud') {
        container.className = '';
        container.style.cssText = "position: relative; width: 100%; min-height: 820px; display: flex; flex-wrap: wrap; justify-content: center; align-content: flex-start; gap: 2.5rem 2rem; padding: 2rem 1rem 4rem 1rem; overflow: visible; transition: opacity 0.4s ease-in-out; background: radial-gradient(ellipse at center, rgba(16,185,129,0.06) 0%, transparent 70%);";
        container.innerHTML = filteredBirds.map((bird, idx) => {
            const colors = window.getConditionColor(bird.category);
            const duration = 3.5 + (idx % 4) * 1.2;
            const delay = (idx % 6) * 0.3;
            // Alternate gradient colors for visual variety
            const gradients = [
                'linear-gradient(135deg, #10b981, #06b6d4)',
                'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                'linear-gradient(135deg, #f59e0b, #10b981)',
                'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                'linear-gradient(135deg, #10b981, #3b82f6)',
            ];
            const grad = gradients[idx % gradients.length];
            const glowColor = ['rgba(16,185,129,0.5)', 'rgba(139,92,246,0.5)', 'rgba(245,158,11,0.4)', 'rgba(59,130,246,0.5)', 'rgba(16,185,129,0.4)'][idx % 5];
            return `
                <div style="display:flex; flex-direction:column; align-items:center; gap:0.5rem; cursor:pointer; position:relative; z-index:1; transition: z-index 0.1s; animation: cardFadeIn 0.45s cubic-bezier(0.215, 0.610, 0.355, 1.000) both; animation-delay: ${idx * 25}ms;"
                    onmouseover="this.querySelector('.cloud-bubble').style.transform='scale(1.2)'; this.querySelector('.cloud-bubble').style.boxShadow='0 10px 35px ${glowColor}'; this.querySelector('.cloud-label').style.opacity='1'; this.querySelector('.cloud-label').style.transform='translateY(0)'; this.style.zIndex='20';"
                    onmouseout="this.querySelector('.cloud-bubble').style.transform='scale(1)'; this.querySelector('.cloud-bubble').style.boxShadow='0 6px 22px ${glowColor}'; this.querySelector('.cloud-label').style.opacity='0'; this.querySelector('.cloud-label').style.transform='translateY(4px)'; this.style.zIndex='1';"
                    onclick="window.modalManager.openBirdDetails(window.nativeBirdsData.find(b=>b.name==='${bird.name}'))">
                    <div class="cloud-bubble" style="width:150px; height:150px; border-radius:50%; padding:4px; background: ${grad}; box-shadow: 0 6px 22px ${glowColor}; animation: floatBubble ${duration}s ease-in-out infinite alternate; animation-delay:${delay}s; transition: transform 0.3s ease, box-shadow 0.3s ease; flex-shrink:0;">
                        <div style="width:100%; height:100%; border-radius:50%; overflow:hidden; background:#0f172a;">
                            <img src="${bird.images[0]}" alt="${bird.name}" style="width:100%; height:100%; object-fit:cover;">
                        </div>
                    </div>
                    <!-- Badge de condición visible siempre -->
                    <div style="display:flex; gap:0.3rem; flex-wrap:wrap; justify-content:center; max-width:160px;">
                        <span style="background: ${colors.bg}; color: ${colors.text}; padding: 0.15rem 0.5rem; border-radius: 20px; font-size: 0.65rem; font-weight: 700;">${bird.category}</span>
                    </div>
                    <!-- Nombre siempre visible -->
                    <span style="color: #f8fafc; font-size: 0.78rem; text-align: center; max-width: 160px; line-height: 1.3; font-weight: 600; text-shadow: 0 2px 6px rgba(0,0,0,0.9);">${bird.name}</span>
                    <!-- Nombre ampliado en hover -->
                    <div class="cloud-label" style="position:absolute; bottom:-2.5rem; left:50%; transform:translateX(-50%) translateY(4px); background:rgba(15,23,42,0.95); color:#f8fafc; font-size:0.78rem; padding:5px 10px; border-radius:10px; white-space:nowrap; border:1px solid rgba(16,185,129,0.3); pointer-events:none; opacity:0; transition: opacity 0.25s ease, transform 0.25s ease; z-index:10;">
                        ${bird.scientificName}
                    </div>
                </div>
                `;
        }).join('');
    }
    else if (layoutMode === 'constellation') {
        container.className = 'constellation-container';
        container.style.cssText = "position: relative; width: 100%; min-height: 900px; z-index: 1; overflow: hidden; transition: opacity 0.4s ease-in-out; margin-top: 20px; display: flex; justify-content: center; align-items: center; background: radial-gradient(ellipse at center, rgba(139,92,246,0.08) 0%, rgba(15,23,42,0.3) 60%, transparent 100%);";

        const totalBirds = filteredBirds.length;
        let c = 65;
        if (totalBirds > 20) c = 56;
        if (totalBirds > 40) c = 48;

        // Draw SVG connector lines for the star map effect
        const svgLines = filteredBirds.map((bird, idx) => {
            if (idx === 0) return '';
            const phi0 = (idx - 1) * 137.508 * (Math.PI / 180);
            const phi1 = idx * 137.508 * (Math.PI / 180);
            const r0 = c * Math.sqrt(idx - 0.5);
            const r1 = c * Math.sqrt(idx + 0.5);
            const x0 = r0 * Math.cos(phi0);
            const y0 = r0 * Math.sin(phi0);
            const x1 = r1 * Math.cos(phi1);
            const y1 = r1 * Math.sin(phi1);
            return `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="rgba(139,92,246,0.2)" stroke-width="1" stroke-dasharray="4 6"/>`;
        }).join('');

        // SVG overlay for connector lines
        const svgOverlay = `<svg style="position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); width:100%; height:100%; pointer-events:none; overflow:visible;" viewBox="-500 -500 1000 1000" preserveAspectRatio="xMidYMid meet">${svgLines}</svg>`;

        container.innerHTML = svgOverlay + filteredBirds.map((bird, idx) => {
            const phi = idx * 137.508 * (Math.PI / 180);
            const r = c * Math.sqrt(idx + 0.5);
            const translateX = r * Math.cos(phi);
            const translateY = r * Math.sin(phi);
            const duration = 2 + (idx % 3) * 0.7;
            const delay = -(idx % 5) * 0.8;
            const bumpAnimation = idx % 2 === 0 ? 'bumpCollide' : 'bumpCollideAlt';
            const colors = window.getConditionColor(bird.category);
            // Orbital glow color by category
            const ringColors = { 'En Peligro': '#ef4444', 'Simbólicas': '#8b5cf6', 'Protegidas': '#3b82f6', 'Comunes': '#10b981' };
            const ringColor = ringColors[bird.category] || '#8b5cf6';

            return `
                <div class="constellation-bubble" style="position:absolute; left:50%; top:50%; transform:translate(-50%,-50%) translate(${translateX}px,${translateY}px); cursor:pointer; z-index:1; transition: z-index 0.1s; animation: constellationFadeIn 0.5s ease both; animation-delay: ${idx * 25}ms;"
                    onmouseover="this.style.zIndex='50'; this.querySelector('.const-inner').style.transform='scale(2)'; this.querySelector('.const-inner').style.boxShadow='0 0 30px ${ringColor}, 0 0 60px ${ringColor}60'; this.querySelector('.const-label').style.opacity='1'; this.querySelector('.const-label').style.transform='translateX(-50%) translateY(-4px)';"
                    onmouseout="this.style.zIndex='1'; this.querySelector('.const-inner').style.transform='scale(1)'; this.querySelector('.const-inner').style.boxShadow='0 0 12px ${ringColor}80'; this.querySelector('.const-label').style.opacity='0'; this.querySelector('.const-label').style.transform='translateX(-50%) translateY(0)';"
                    onclick="window.modalManager.openBirdDetails(window.nativeBirdsData.find(b=>b.name==='${bird.name}'))">
                    <div style="display:flex; flex-direction:column; align-items:center; animation: ${bumpAnimation} ${duration}s ease-in-out infinite alternate; animation-delay:${delay}s;">
                        <div class="const-inner" style="width:80px; height:80px; border-radius:50%; border:3px solid ${ringColor}; overflow:hidden; box-shadow: 0 0 12px ${ringColor}80; background:#0f172a; transition: transform 0.35s cubic-bezier(0.175,0.885,0.32,1.275), box-shadow 0.35s ease;">
                            <img src="${bird.images[0]}" alt="${bird.name}" style="width:100%; height:100%; object-fit:cover;">
                        </div>
                    </div>
                    <!-- Full label on hover (Tooltip) -->
                    <div class="const-label" style="position:absolute; top:-2.8rem; left:50%; transform:translateX(-50%) translateY(0); background:rgba(15,23,42,0.95); color:#f8fafc; font-size:0.75rem; padding:4px 10px; border-radius:10px; white-space:nowrap; border:1px solid ${ringColor}50; pointer-events:none; opacity:0; transition: opacity 0.25s ease, transform 0.25s ease; z-index:10; font-weight:600; text-shadow:none; text-align:center;">
                        ${bird.name}<br><span style="color:${ringColor}; font-size:0.65rem; font-style:italic;">${bird.category}</span>
                    </div>
                </div>
                `;
        }).join('');
    }
};

window.stopActiveBirdAudio = function () {
    if (window._activeBirdAudio) {
        try {
            window._activeBirdAudio.pause();
        } catch (e) { }
        window._activeBirdAudio = null;
    }
    if (window._activeAudioBtn) {
        window._activeAudioBtn.innerHTML = '🔊 Canto';
        window._activeAudioBtn.disabled = false;
        window._activeAudioBtn = null;
    }
};

window.playBirdAudio = async function (scientificName, buttonEl) {
    if (!scientificName) return;

    // Solo permitir reproducción si la vista activa es Vista en Tarjeta (grid)
    if (window.currentAlbumFilters && window.currentAlbumFilters.layout !== 'grid') {
        window.stopActiveBirdAudio();
        return;
    }

    const originalText = buttonEl.innerHTML;

    // Si ya está reproduciendo este mismo audio
    if (window._activeAudioBtn === buttonEl && window._activeBirdAudio) {
        if (window._activeBirdAudio.paused) {
            window._activeBirdAudio.play().then(() => {
                buttonEl.innerHTML = '⏸️ Pausar';
            }).catch(e => {
                console.warn('Error al reanudar audio:', e);
            });
        } else {
            window._activeBirdAudio.pause();
            buttonEl.innerHTML = '🔊 Canto';
        }
        return;
    }

    // Detener cualquier otro audio previo
    window.stopActiveBirdAudio();

    buttonEl.disabled = true;
    buttonEl.innerHTML = '⏳ Cargando...';

    // Instanciar elemento Audio inmediatamente para sincronizar con la interacción del usuario
    const audio = new Audio();
    window._activeBirdAudio = audio;
    window._activeAudioBtn = buttonEl;

    try {
        let data;
        if (window.api && typeof window.api.get === 'function') {
            data = await window.api.get(`/species/audio?scientificName=${encodeURIComponent(scientificName)}`);
        } else {
            const res = await fetch(window.APP_CONFIG.API_URL + '/species/audio?scientificName=${encodeURIComponent(scientificName)}');
            data = await res.json();
        }

        buttonEl.disabled = false;

        if (data && data.audioUrl) {
            audio.src = data.audioUrl;

            audio.play().then(() => {
                buttonEl.innerHTML = '⏸️ Pausar';
            }).catch(e => {
                console.warn('Auto-play blocked or audio error:', e);
                buttonEl.innerHTML = '▶️ Reproducir';
            });

            audio.onended = () => {
                buttonEl.innerHTML = '🔊 Canto';
                window._activeBirdAudio = null;
                window._activeAudioBtn = null;
            };

            audio.onerror = (e) => {
                console.error('Audio load error:', e);
                buttonEl.innerHTML = '⚠️ Error';
                setTimeout(() => { buttonEl.innerHTML = originalText; }, 2000);
            };
        } else {
            buttonEl.innerHTML = '❌ Sin audio';
            setTimeout(() => { buttonEl.innerHTML = originalText; }, 2000);
        }
    } catch (err) {
        console.error('Error al solicitar audio:', err);
        buttonEl.disabled = false;
        buttonEl.innerHTML = '⚠️ Error';
        setTimeout(() => { buttonEl.innerHTML = originalText; }, 2000);
    }
};

function generateHabitatZones(bird) {
    // ── ZONAS BASE (coordenadas verificadas en Isla de Margarita) ─────────────

    // Playas y aguas costeras abiertas
    const zonasCosteras = [
        [11.100, -63.865], // Playa El Agua
        [10.920, -64.160], // Punta de Piedras / Boca del Río
        [11.080, -63.985], // Bahía de Juan Griego
        [10.985, -63.805]  // Bahía de Pampatar
    ];

    // Lagunas, manglares y humedales interiores/costeros
    const zonasManglares = [
        [10.965, -64.180], // Laguna de la Restinga
        [10.952, -63.952], // Laguna de Las Marites
        [10.970, -64.150], // Canales de la Restinga
        [10.958, -63.945]  // Borde sur Laguna Las Marites
    ];

    // Bosque húmedo y montaña (Copey, La Asunción)
    const zonasBosqueMontana = [
        [11.000, -63.900], // Cerro El Copey
        [11.020, -63.920], // Faldas de la montaña
        [11.030, -63.880], // La Asunción
        [10.980, -63.900]  // Valle del Espíritu Santo
    ];

    // Zona árida Macanao (para endémicas xerófilas)
    const zonasMacanao = [
        [10.980, -64.250], // Península profunda
        [10.955, -64.200], // Sur de Macanao
        [11.000, -64.220], // Norte de Macanao
        [11.020, -64.300]  // Robledal
    ];

    // Sabana y matorral interior (alejado de costa y zonas urbanas)
    const zonasArbustivas = [
        [11.010, -63.960], // Sabana interior norte
        [10.940, -64.020], // Matorral centro-sur
        [11.050, -63.870], // Zona rural noreste
        [10.970, -63.980]  // Interior centro
    ];

    // Zonas urbanas y periurbanas (parques, jardines, azoteas)
    const zonasUrbanas = [
        [10.960, -63.850], // Porlamar
        [10.995, -63.840], // Pampatar
        [10.990, -63.920], // San Juan
        [11.070, -63.980]  // Juan Griego
    ];

    // ── LÓGICA DE CLASIFICACIÓN ────────────────────────────────────────────────
    const nombre = (bird.name || '').toLowerCase();
    const tipo = (bird.type || '').toLowerCase().replace('de interior', 'terrestre');
    const hab = (bird.habitat || '').toLowerCase();

    let selectedZones;

    // 1 ─ Flamenco del Caribe → zonas únicas en Margarita
    if (nombre.includes('flamenco')) {
        selectedZones = [
            [10.9113, -63.9182], // Laguna de Las Marites (verificado Google Maps)
            [10.9105, -63.9160], // Laguna de Las Marites (zona norte)
            [10.9526, -63.8246], // Wyndham Concorde (verificado Google Maps)
            [10.9520, -63.8250]  // Wyndham Concorde (jardín)
        ];

        // 2 ─ Aves marinas de playa/costa abierta
    } else if (
        nombre.includes('pelicano') || nombre.includes('pelícano') ||
        nombre.includes('pico de tijera') ||
        nombre.includes('playero') ||
        nombre.includes('becasa') ||
        nombre.includes('alcatraz') ||
        nombre.includes('gaviota') ||
        hab.includes('playa') || hab.includes('orilla del mar') ||
        hab.includes('aguas costeras') || hab.includes('muelle')
    ) {
        selectedZones = zonasCosteras;

        // 3 ─ Aves de manglares / lagunas / humedales
    } else if (
        tipo === 'manglares' ||
        nombre.includes('garza') || nombre.includes('garcita') ||
        nombre.includes('gallineta') ||
        nombre.includes('buzo') ||
        nombre.includes('corocora') ||
        nombre.includes('ñangaro') ||
        nombre.includes('tijereta') ||
        nombre.includes('gonzalito') ||
        hab.includes('manglar') || hab.includes('restinga') ||
        hab.includes('laguna') || hab.includes('humedal') ||
        hab.includes('pantano')
    ) {
        selectedZones = zonasManglares;

        // 4 ─ Tipo "Costeras"
    } else if (tipo === 'costeras') {
        selectedZones = zonasManglares;

        // 5 ─ Endémicas de zonas áridas (Cotorra Margariteña, Ñángaro)
    } else if (
        hab.includes('macanao') || hab.includes('xerófil') ||
        nombre.includes('cotorra')
    ) {
        selectedZones = zonasMacanao;

        // 6 ─ Aves de bosque, matorral seco y montaña
    } else if (
        hab.includes('bosque') || hab.includes('montaña') ||
        hab.includes('copey') || hab.includes('matorral') ||
        nombre.includes('guacharaca') || nombre.includes('pavita') ||
        nombre.includes('chirito') || nombre.includes('guitío') ||
        nombre.includes('lechuza')
    ) {
        selectedZones = zonasBosqueMontana;

        // 7 ─ Aves de sabana y pastizal interior
    } else if (
        hab.includes('sabana') || hab.includes('pastizal') ||
        hab.includes('llano') || hab.includes('área abierta') ||
        nombre.includes('pecho colorado') || nombre.includes('pitirre') ||
        nombre.includes('potoca')
    ) {
        selectedZones = zonasArbustivas;

        // 8 ─ Generalistas / urbanas
    } else {
        selectedZones = zonasUrbanas;
    }

    // Jitter mínimo (±150 m) para no cruzar ecosistemas adyacentes
    return selectedZones.map(coord => {
        const latJitter = (Math.random() - 0.5) * 0.0025;
        const lngJitter = (Math.random() - 0.5) * 0.0025;
        return [coord[0] + latJitter, coord[1] + lngJitter];
    });
}

window.showBirdOnMap = function (birdName) {
    const bird = nativeBirds.find(b => b.name === birdName);
    if (bird) {
        if (window.modalManager) window.modalManager.close();
        if (window.mapManager) window.mapManager.isCustomView = true;
        const habitatPoints = generateHabitatZones(bird);

        window.location.hash = '/dashboard';
        setTimeout(() => {
            if (window.mapManager && window.mapManager.map) {
                window.mapManager.isCustomView = true;
                // Limpiar marcadores anteriores
                window.mapManager.clearMarkers();

                if (typeof L !== 'undefined') {
                    // Crear un grupo de marcadores para poder ajustar el zoom (fitBounds)
                    const habitatGroup = L.featureGroup().addTo(window.mapManager.map);

                    habitatPoints.forEach(point => {
                        // Crear un icono especial para "Zonas de Hábitat"
                        const habitatIcon = L.divIcon({
                            className: 'custom-bird-bubble',
                            html: `<div style="width: 40px; height: 40px; border-radius: 50%; border: 3px solid #f59e0b; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.6); background: #1e293b; position: relative;">
                                          <img src="${bird.images[0]}" style="width: 100%; height: 100%; object-fit: cover;">
                                       </div>`,
                            iconSize: [40, 40],
                            iconAnchor: [20, 20],
                            popupAnchor: [0, -20]
                        });

                        const marker = L.marker(point, { icon: habitatIcon }).addTo(habitatGroup);
                        marker.bindPopup(`
                                <div style="text-align:center; min-width: 150px; cursor: pointer;" onclick="window.mapManager.map.closePopup()">
                                    <div style="width: 100%; height: 110px; background: rgba(0,0,0,0.3); border-radius: 6px; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                                        <img src="${bird.images[0]}" style="width:100%; height:100%; object-fit:cover; object-position:center;">
                                    </div>
                                    <strong style="color: var(--primary-color); font-size: 1.1rem; display:block; margin-bottom:2px;">${bird.name}</strong>
                                    <small style="color: #f59e0b; display:block; font-weight:bold; margin-bottom:8px;">📍 Posible Hábitat</small>
                                </div>
                            `);

                        // Guardamos el marcador en el MapManager para que pueda limpiarlo luego
                        window.mapManager.markers.push(marker);

                        // Triangulación / Enmarcado al hacer clic en el hábitat
                        marker.on('click', function (e) {
                            if (window.currentTriangulation && window.mapManager.map) {
                                window.mapManager.map.removeLayer(window.currentTriangulation);
                            }

                            const lat = e.latlng.lat;
                            const lng = e.latlng.lng;

                            // Generar un hexágono irregular (estilo triangulación / zona radar)
                            const points = [];
                            const numPoints = 6;
                            const baseRadius = 0.012; // Radio en grados (~1.2 km)

                            for (let i = 0; i < numPoints; i++) {
                                const angle = (i / numPoints) * Math.PI * 2;
                                // Variación aleatoria para que el polígono sea orgánico y parezca "enmarcado" natural
                                const r = baseRadius * (0.8 + Math.random() * 0.4);
                                points.push([
                                    lat + Math.cos(angle) * r,
                                    lng + Math.sin(angle) * r
                                ]);
                            }

                            window.currentTriangulation = L.polygon(points, {
                                color: '#0ea5e9',       // Azul tecnológico
                                fillColor: '#0ea5e9',
                                fillOpacity: 0.2,
                                weight: 2,
                                dashArray: '5, 8'
                            }).addTo(window.mapManager.map);

                            // Opcional: hacer zoom suave a la zona
                            window.mapManager.map.setView(e.latlng, 13, { animate: true, duration: 0.8 });
                        });
                    });

                    // Ajustar la vista del mapa para que encuadre todas las zonas de hábitat generadas
                    window.mapManager.map.fitBounds(habitatGroup.getBounds().pad(0.2));
                }
            }
        }, 300);

        // Cerrar el modal si estaba abierto
        if (window.modalManager) {
            window.modalManager.close();
        }
    }
};

window.currentMapFilters = {
    category: 'Todas',
    type: 'Todas'
};

window.applyMapFilters = function () {
    if (!window.mapManager || !window.mapManager.map || !window.nativeBirdsData) return;
    if (window.mapManager.isCustomView) return; // FIX: Prevent overwriting custom views

    // Limpiar marcadores anteriores
    window.mapManager.clearMarkers();

    const catFilter = window.currentMapFilters.category;
    const typeFilter = window.currentMapFilters.type;

    // 1. Filtrar aves nativas
    const filteredBirds = window.nativeBirdsData.filter(bird => {
        const matchesCategory = catFilter === 'Todas' || bird.category === catFilter;
        const matchesType = typeFilter === 'Todas' ||
            bird.type === typeFilter ||
            (Array.isArray(bird.habitats) && bird.habitats.includes(typeFilter));
        return matchesCategory && matchesType;
    });

    // 2. Renderizar aves nativas filtradas
    filteredBirds.forEach(bird => {
        if (bird.coords) {
            const iconHtml = `<div style="width: 46px; height: 46px; border-radius: 50%; border: 3px solid #8b5cf6; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.6); background: #1e293b; position: relative;"><img src="${bird.images[0]}" style="width: 100%; height: 100%; object-fit: cover; object-position: center;"></div>`;
            const customIcon = L.divIcon({ className: 'custom-bird-bubble', html: iconHtml, iconSize: [46, 46], iconAnchor: [23, 23], popupAnchor: [0, -23] });

            const marker = L.marker(bird.coords, { icon: customIcon }).addTo(window.mapManager.map);
            marker.bindPopup(`
                    <div style="text-align:center; min-width: 140px; cursor: pointer;" onclick="window.mapManager.map.closePopup()">
                        <div style="width: 100%; height: 110px; background: rgba(0,0,0,0.3); border-radius: 6px; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                            <img src="${bird.images[0]}" style="width:100%; height:100%; object-fit:contain; object-position:center;">
                        </div>
                        <strong style="color: var(--primary-color); font-size: 1.1rem; display:block; margin-bottom:2px;">${bird.name}</strong>
                        <small style="color: #64748b; display:block; margin-bottom:8px;">Hábitat sugerido</small>
                        <button class="btn btn-primary" style="width: 100%; padding: 4px; font-size: 0.85rem;" onclick="event.stopPropagation(); window.modalManager.openBirdDetails(window.nativeBirdsData.find(b=>b.name==='${bird.name}'))">Ver Especie</button>
                    </div>
                `);
            window.mapManager.markers.push(marker);
            window.mapManager.applyHeatmapEffect(marker, bird.coords[0], bird.coords[1], '#8b5cf6', bird);
        }
    });

    // 3. Filtrar y renderizar avistamientos de la comunidad
    window.sightingManager.fetchAll().then(sightings => {
        if (window.mapManager.isCustomView) return; // FIX: Prevent overwriting after async fetch
        
        const filteredSightings = (sightings || []).filter(sighting => {
            const bird = window.nativeBirdsData.find(b => b.name === sighting.bird_name);
            if (!bird) {
                return catFilter === 'Todas' && typeFilter === 'Todas';
            }
            const matchesCategory = catFilter === 'Todas' || bird.category === catFilter;
            const matchesType = typeFilter === 'Todas' ||
                bird.type === typeFilter ||
                (Array.isArray(bird.habitats) && bird.habitats.includes(typeFilter));
            return matchesCategory && matchesType;
        });

        window.mapManager.addSightings(filteredSightings);

        if (filteredBirds.length > 0 || filteredSightings.length > 0) {
            window.mapManager.fitBounds();
        }

        const counterEl = document.getElementById('mapFilterCount');
        if (counterEl) {
            counterEl.textContent = `Aves: ${filteredBirds.length}`;
        }
    }).catch(err => {
        console.warn('Error al cargar avistamientos para el mapa:', err);
        const counterEl = document.getElementById('mapFilterCount');
        if (counterEl) {
            counterEl.textContent = `Aves: ${filteredBirds.length}`;
        }
    });
};

window.filterMapBirds = function (filterType, value, buttonEl) {
    if (window.mapManager) window.mapManager.isCustomView = false;
    
    if (filterType === 'category') {
        window.currentMapFilters.category = value;
    } else if (filterType === 'type') {
        window.currentMapFilters.type = value;
    }

    // Cambiar estilos active para botones de la misma fila
    const container = buttonEl.parentElement;
    container.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    buttonEl.classList.add('active');

    window.applyMapFilters();
};

window.resetMapToAllBirds = function () {
    if (window.mapManager) window.mapManager.isCustomView = false;
    
    window.currentMapFilters = {
        category: 'Todas',
        type: 'Todas'
    };

    const filterContainer = document.getElementById('mapFilterBar');
    if (filterContainer) {
        filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
            const isAllButton = btn.getAttribute('data-value') === 'Todas';
            if (isAllButton) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    window.applyMapFilters();
};

function renderBirdGallery() {
    const track1 = document.getElementById('bird-gallery-track-1');
    const track2 = document.getElementById('bird-gallery-track-2');
    const track3 = document.getElementById('bird-gallery-track-3');
    if (!track1 || !track2 || !track3) return;

    // Dividir nativeBirds en 3 grupos aprox
    const chunkSize = Math.ceil(nativeBirds.length / 3);
    const group1 = nativeBirds.slice(0, chunkSize);
    const group2 = nativeBirds.slice(chunkSize, chunkSize * 2);
    const group3 = nativeBirds.slice(chunkSize * 2);

    const createCardHTML = (bird) => {
        const colors = window.getConditionColor(bird.category);
        return `
            <div class="bird-card glass-effect" style="flex: 0 0 auto; width: 250px; height: 330px; padding: 0; cursor: pointer; transition: transform 0.3s; margin-bottom: 0.5rem; display: flex; flex-direction: column; overflow: hidden;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" onclick="window.modalManager.openBirdDetails(window.nativeBirdsData.find(b=>b.name==='${bird.name}'))">
                <div style="height: 180px; width: 100%; background: #000; flex-shrink: 0; position: relative;">
                    <img src="${bird.images[0]}" alt="${bird.name}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover; object-position: center; filter: brightness(0.9);">
                    <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 40%; background: linear-gradient(to top, rgba(15,23,42,1), transparent);"></div>
                </div>
                <div style="flex: 1; padding: 1rem; display: flex; flex-direction: column; text-align: center; justify-content: center;">
                    <div style="display: flex; gap: 0.4rem; justify-content: center; margin-bottom: 0.5rem;">
                        <span style="background: ${colors.bg}; color: ${colors.text}; padding: 0.15rem 0.5rem; border-radius: 8px; font-size: 0.7rem; font-weight: 500;">${bird.category}</span>
                    </div>
                    <h4 class="card-bird-name" style="margin: 0 0 0.3rem 0; font-size: 1.1rem; line-height: 1.2; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${bird.name}</h4>
                    <p class="card-bird-sub" style="font-size: 0.8rem; font-style: italic; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">${bird.scientificName}</p>
                </div>
            </div>
            `;
    };

    // Para evitar espacios en blanco si la pantalla es muy grande, repetimos cada grupo 6 veces
    const renderTrack = (group) => {
        const html = group.map(createCardHTML).join('');
        return html + html + html + html + html + html;
    };

    track1.innerHTML = renderTrack(group1);
    track2.innerHTML = renderTrack(group2);
    track3.innerHTML = renderTrack(group3);

    // Alineación al centro para que todas las tarjetas se vean idénticas en la fila
    track1.style.alignItems = 'center';
    track2.style.alignItems = 'center';
    track3.style.alignItems = 'center';

    // Ancho total de 1 copia del grupo
    // width = 250px, gap = 1rem (16px aprox)
    const group1WidthStr = `calc(250px * ${group1.length} + 1rem * ${group1.length})`;
    const group2WidthStr = `calc(250px * ${group2.length} + 1rem * ${group2.length})`;
    const group3WidthStr = `calc(250px * ${group3.length} + 1rem * ${group3.length})`;

    // Aplicamos animación CSS (Marquee infinito)
    const style = document.createElement('style');
    style.textContent = `
            @keyframes scrollMarqueeLeft1 {
                0% { transform: translateX(0); }
                100% { transform: translateX(calc(-1 * ${group1WidthStr})); }
            }
            @keyframes scrollMarqueeRight2 {
                0% { transform: translateX(calc(-1 * ${group2WidthStr})); }
                100% { transform: translateX(0); }
            }
            @keyframes scrollMarqueeLeft3 {
                0% { transform: translateX(0); }
                100% { transform: translateX(calc(-1 * ${group3WidthStr})); }
            }
            #bird-gallery-track-1 { animation: scrollMarqueeLeft1 60s linear infinite; }
            #bird-gallery-track-2 { animation: scrollMarqueeRight2 70s linear infinite; }
            #bird-gallery-track-3 { animation: scrollMarqueeLeft3 50s linear infinite; }
            
            #bird-gallery-track-1:hover, #bird-gallery-track-2:hover, #bird-gallery-track-3:hover {
                animation-play-state: paused;
            }
            
            .carousel-manual-mode .bird-carousel-track {
                animation: none !important;
                transform: translateX(0) !important;
            }
            .carousel-manual-mode .bird-carousel-viewport {
                overflow-x: auto !important;
                scroll-behavior: smooth;
                scroll-snap-type: x mandatory !important;
            }
            .carousel-manual-mode .bird-card {
                scroll-snap-align: start !important;
            }
            .carousel-manual-mode .bird-carousel-viewport::-webkit-scrollbar {
                height: 8px;
            }
            .carousel-manual-mode .bird-carousel-viewport::-webkit-scrollbar-track {
                background: rgba(0,0,0,0.1);
                border-radius: 4px;
            }
            .carousel-manual-mode .bird-carousel-viewport::-webkit-scrollbar-thumb {
                background: rgba(16, 185, 129, 0.5);
                border-radius: 4px;
            }
            .carousel-manual-mode .carousel-nav-btn {
                display: flex !important;
                align-items: center;
                justify-content: center;
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                z-index: 10;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: rgba(255, 255, 255, 0.9);
                border-radius: 50%;
                width: 48px;
                height: 48px;
                cursor: pointer;
                font-size: 1.5rem;
                box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                transition: all 0.3s ease;
            }
            .carousel-manual-mode .carousel-nav-btn:hover {
                background: rgba(255, 255, 255, 0.2);
                border-color: rgba(255, 255, 255, 0.4);
                color: #fff;
                box-shadow: 0 8px 32px rgba(0,0,0,0.5);
                transform: translateY(-50%) scale(1.1);
            }
            .carousel-manual-mode .carousel-nav-btn:active {
                transform: translateY(-50%) scale(0.95);
            }
            .carousel-manual-mode .prev-btn {
                left: 1rem;
            }
            .carousel-manual-mode .next-btn {
                right: 1rem;
            }

        `;
    document.head.appendChild(style);

    const toggleBtn = document.getElementById('toggleCarouselBtn');
    const carouselsContainer = document.querySelector('.bird-carousels-container');
    if (toggleBtn && carouselsContainer) {
        toggleBtn.addEventListener('click', () => {
            const isManual = carouselsContainer.classList.toggle('carousel-manual-mode');
            if (isManual) {
                toggleBtn.textContent = 'Activar Movimiento Automático';
            } else {
                toggleBtn.textContent = 'Pausar y Mover Manualmente';
            }
        });
    }
}

// Cargar datos del dashboard
async function loadDashboardData() {
    const mapContainer = document.getElementById('map');
    if (mapContainer && !mapContainer._leaflet_id) {
        window.mapManager = new MapManager('map');
        window.mapManager.init();

        // Exponer nativeBirds globalmente para popups
        window.nativeBirdsData = nativeBirds;
    }

    // Aplicar los filtros actuales (por defecto "Todas") para poblar el mapa
    if (window.mapManager && window.mapManager.map) {
        window.applyMapFilters();
    }

    // StatsManager fue movido a la ruta /estadisticas

    const activityFeed = new ActivityFeed('activity-feed');
    activityFeed.renderSkeletons(3);
    const recentSightings = await sightingManager.fetchAll({ limit: 5 });
    activityFeed.render(recentSightings);
}

// Bind eventos botones globales
document.getElementById('btnLogout')?.addEventListener('click', () => auth.logout());
document.getElementById('btnReport')?.addEventListener('click', () => {
    if (auth.isAuthenticated) {
        if (auth.currentUser && auth.currentUser.status === 'suspended') {
            if (window.modalManager) window.modalManager.showMessage('Cuenta Suspendida', 'Tu cuenta se encuentra temporalmente suspendida debido a infracciones de nuestras normativas comunitarias o de validación de datos. Por el momento, la funcionalidad de reportes está deshabilitada.', 'error');
            return;
        }
        modalManager.openSighting();
    } else {
        window.location.href = 'login.html';
    }
});


async function loadActividadSightings() {
    const container = document.getElementById('actividad-sightings-carousel');
    if (!container) return;

    try {
        const response = await fetch(window.APP_CONFIG.API_URL + '/sightings');
        if (response.ok) {
            const data = await response.json();

            // Initialize map
            if (!window.landingMapManager && typeof L !== 'undefined') {
                // Assuming MapManager is globally available or imported in app.js. 
                // Wait, MapManager is imported at the top of app.js.
                window.landingMapManager = new MapManager('landing-map');
                window.landingMapManager.init();
                window.landingMapManager.addSightings(data);
                window.landingMapManager.fitBounds();
            }

            // Render carousel dynamically (infinite loop)
            if (data.length === 0) {
                container.innerHTML = '<div style="padding:2rem; color:var(--text-muted); text-align:center; width:100%;">No hay avistamientos registrados aún.</div>';
                return;
            }

            const items = data.slice(0, 15);
            // Duplicar los items para el efecto de bucle infinito
            const renderItems = [...items, ...items];

            container.innerHTML = renderItems.map(s => `
                    <div class="bird-card glass-effect" style="flex: 0 0 auto; width: 250px; height: 320px; padding: 0; cursor: pointer; transition: transform 0.3s; margin-bottom: 0.5rem; display: flex; flex-direction: column; overflow: hidden;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" onclick="window.location.hash='#/dashboard'">
                        <div style="height: 180px; width: 100%; background: #000; flex-shrink: 0; position: relative;">
                            ${s.image_url ? `<img src="${s.image_url.startsWith('http') ? s.image_url : window.APP_CONFIG.BASE_URL + s.image_url}" onerror="this.src='${s.image_url}'" style="width: 100%; height: 100%; object-fit: cover; object-position: center;">` : `<div style="width:100%; height:100%; background:#1e293b; display:flex; align-items:center; justify-content:center;">Sin foto</div>`}
                            <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 40%; background: linear-gradient(to top, rgba(15,23,42,1), transparent);"></div>
                        </div>
                        <div style="flex: 1; padding: 1rem; display: flex; flex-direction: column; text-align: center; justify-content: center;">
                            <h4 class="card-bird-name" style="margin: 0 0 0.3rem 0; font-size: 1.1rem; line-height: 1.2; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${escapeHtml(s.bird_name || s.species?.commonName || 'Aves de Margarita')}</h4>
                            <p class="card-bird-sub" style="font-size: 0.8rem; font-style: italic; margin: 0 0 0.5rem 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">📍 ${escapeHtml(s.location_name)}</p>
                            <small style="color: var(--primary-color); font-size: 0.75rem; font-weight: 500;">Por: ${escapeHtml(s.user_name || 'Anónimo')}</small>
                        </div>
                    </div>
                `).join('');

            container.classList.add('animated');
            container.style.alignItems = 'center';
            container.style.paddingBottom = '1rem';

            // Si el contenedor padre tenía overflow manual, lo limpiamos para la animación
            container.style.overflowX = 'visible';
        }
    } catch (e) {
        console.error('Error loading landing sightings:', e);
        container.innerHTML = '<div style="padding:2rem; color:#ef4444; text-align:center; width:100%;">Error al cargar avistamientos.</div>';
    }
}

// Iniciar UI
renderBirdGallery();
updateUIForAuth(auth.isAuthenticated);

window.deleteUserSighting = async (sightingId) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este avistamiento?')) return;
    try {
        const res = await sightingManager.delete(sightingId);
        if (res.success) {
            // Recargar la vista de perfil
            window.location.reload();
        } else {
            alert(res.error || 'Error al eliminar');
        }
    } catch (e) {
        alert('Ocurrió un error al intentar eliminar el avistamiento.');
    }
};

window.editUserSighting = (sightingId) => {
    if (!window.allLoadedSightings || !window.allLoadedSightings[sightingId]) return;
    const sighting = window.allLoadedSightings[sightingId];
    window.modalManager.openEditSightingModal(sighting);
};

window.openSightingDetailsGlobal = (sightingId) => {
    if (!window.allLoadedSightings || !window.allLoadedSightings[sightingId]) return;
    const sighting = window.allLoadedSightings[sightingId];
    window.modalManager.openSightingDetails(sighting);
};

window.modalManager.setCallbacks({
    onEditSighting: async (id, data) => {
        window.modalManager.showLoading('Guardando cambios...');
        const res = await sightingManager.update(id, data);
        if (res.success) {
            window.modalManager.showMessage('Éxito', 'Avistamiento actualizado correctamente.');
            setTimeout(() => window.location.reload(), 1500);
        } else {
            window.modalManager.showMessage('Error', res.error || 'No se pudo actualizar', 'error');
        }
    }
});
if (window.triviaManager) window.triviaManager.init();

// --- DECORACIONES FLOTANTES DINÁMICAS PARA INDEX.HTML ---
function renderFloatingDecorations() {
    const container = document.getElementById('floating-decorations-container');
    if (!container || !nativeBirds || nativeBirds.length === 0) return;

    container.innerHTML = '';

    // Aleatorizar aves
    const shuffledBirds = [...nativeBirds].sort(() => 0.5 - Math.random());
    const selectedBirds = shuffledBirds.slice(0, 16);

    const leftTops = [120, 580, 1050, 1520, 1980, 2420, 2880, 3340];
    const rightTops = [160, 620, 1090, 1560, 2020, 2470, 2930, 3380];

    selectedBirds.forEach((bird, index) => {
        const isLeft = index < 8;
        const top = isLeft ? leftTops[index] : rightTops[index - 8];
        const side = isLeft ? `left: ${(1.2 + Math.random() * 1.5).toFixed(1)}%` : `right: ${(1.2 + Math.random() * 1.5).toFixed(1)}%`;
        const size = (135 + Math.random() * 35).toFixed(0); // 135 to 170
        const rot = (Math.random() * 36 - 18).toFixed(1); // -18 to +18
        const dur = (5.5 + Math.random() * 3).toFixed(1); // 5.5s to 8.5s
        const delay = (Math.random() * 2).toFixed(1);

        const img = document.createElement('img');
        img.src = bird.images && bird.images.length > 0 ? bird.images[0] : '';
        img.title = bird.name;
        img.className = 'floating-dec';
        img.style.cssText = `${side}; top: ${top}px; width: ${size}px; height: ${size}px; --rot: ${rot}deg; animation-duration: ${dur}s; animation-delay: ${delay}s; border-radius: 50%; opacity: 0.9; cursor: pointer; transition: transform 0.3s ease, z-index 0s; pointer-events: auto; z-index: 0; position: absolute;`;

        img.onclick = () => {
            if (window.modalManager) window.modalManager.openBirdDetails(bird);
        };

        // Agregar un efecto de hover sutil para que parezcan interactivas (opcional)
        img.onmouseover = () => { img.style.transform = `scale(1.08) rotate(${rot}deg)`; img.style.opacity = '1'; img.style.zIndex = '100'; };
        img.onmouseout = () => { img.style.transform = ''; img.style.opacity = '0.9'; img.style.zIndex = '0'; };

        container.appendChild(img);
    });
}

// Llamarlo si estamos en index.html
renderFloatingDecorations();
