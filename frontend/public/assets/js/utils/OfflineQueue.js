export class OfflineQueue {
    constructor() {
        this.dbName = 'AvistarOfflineDB';
        this.storeName = 'sightings_queue';
        this.db = null;
        this.initDB();
    }

    initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
                }
            };
            request.onsuccess = (e) => {
                this.db = e.target.result;
                resolve(this.db);
            };
            request.onerror = (e) => {
                console.error('[OfflineQueue] Error abriendo IndexedDB:', e);
                reject(e);
            };
        });
    }

    async ensureDB() {
        if (!this.db) {
            await this.initDB();
        }
    }

    async add(sightingData) {
        await this.ensureDB();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(this.storeName, 'readwrite');
            const store = tx.objectStore(this.storeName);
            const record = {
                ...sightingData,
                created_at: new Date().toISOString()
            };
            const req = store.add(record);
            req.onsuccess = () => resolve(req.result);
            req.onerror = (e) => reject(e);
        });
    }

    async getAll() {
        await this.ensureDB();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(this.storeName, 'readonly');
            const store = tx.objectStore(this.storeName);
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = (e) => reject(e);
        });
    }

    async remove(id) {
        await this.ensureDB();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(this.storeName, 'readwrite');
            const store = tx.objectStore(this.storeName);
            const req = store.delete(id);
            req.onsuccess = () => resolve();
            req.onerror = (e) => reject(e);
        });
    }

    async sync(sightingManager, modalManager) {
        if (!navigator.onLine) return;

        try {
            const items = await this.getAll();
            if (items.length === 0) return;

            console.log(`[OfflineQueue] Sincronizando ${items.length} reportes pendientes...`);
            if (modalManager) {
                modalManager.showLoading(`Sincronizando ${items.length} reporte(s) guardado(s) offline...`);
            }

            let successCount = 0;

            for (const item of items) {
                const formData = new FormData();
                formData.append('bird_name', item.bird_name || '');
                formData.append('location_name', item.location_name || '');
                formData.append('latitude', item.latitude || '');
                formData.append('longitude', item.longitude || '');
                formData.append('description', item.description || '');
                if (item.sighted_at) formData.append('sighted_at', item.sighted_at);
                if (item.ai_source) formData.append('ai_source', item.ai_source);
                if (item.ai_confidence) formData.append('ai_confidence', item.ai_confidence);
                if (item.ai_raw_label) formData.append('ai_raw_label', item.ai_raw_label);
                formData.append('ai_status', item.ai_status || 'skipped');

                // Si hay imágenes guardadas (array)
                if (item.imageBlobs && item.imageBlobs.length > 0) {
                    item.imageBlobs.forEach((blob, index) => {
                        const name = item.imageNames && item.imageNames[index] ? item.imageNames[index] : `offline_sighting_${index}.jpg`;
                        const type = item.imageType || 'image/jpeg';
                        const file = new File([blob], name, { type });
                        formData.append('imagenes', file);
                    });
                } else if (item.imageBlob) {
                    // Soporte legacy para reportes guardados antes del cambio
                    const file = new File([item.imageBlob], item.imageName || 'offline_sighting.jpg', { type: item.imageType || 'image/jpeg' });
                    formData.append('imagenes', file);
                }

                const res = await sightingManager.create(formData);
                if (res.success) {
                    await this.remove(item.id);
                    successCount++;
                }
            }

            if (modalManager && successCount > 0) {
                modalManager.showMessage('📡 Sincronización Exitosa', `Se enviaron ${successCount} reporte(s) guardados previamente sin conexión.`, 'success');
            }
        } catch (err) {
            console.error('[OfflineQueue] Error durante la sincronización:', err);
        }
    }

    initAutoSync(sightingManager, modalManager) {
        window.addEventListener('online', () => {
            console.log('[OfflineQueue] Conexión reestablecida. Sincronizando...');
            this.sync(sightingManager, modalManager);
        });

        // Intentar sincronizar al iniciar si ya estamos online
        if (navigator.onLine) {
            setTimeout(() => this.sync(sightingManager, modalManager), 3000);
        }
    }
}
