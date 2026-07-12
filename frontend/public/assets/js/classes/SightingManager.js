export class SightingManager {
    constructor(apiClient) {
        this.api = apiClient;
        this.sightings = [];
    }

    async fetchAll(filters = {}) {
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const endpoint = queryParams ? `/sightings?${queryParams}` : '/sightings';
            const response = await this.api.get(endpoint);
            this.sightings = response.data || response || [];
            return this.sightings;
        } catch (error) {
            console.error('Error fetching sightings:', error);
            return [];
        }
    }

    async create(sightingData) {
        try {
            let formData;
            if (sightingData instanceof FormData) {
                formData = sightingData;
            } else {
                formData = new FormData();
                Object.keys(sightingData).forEach(key => {
                    if (sightingData[key] !== null && sightingData[key] !== undefined) {
                        formData.append(key, sightingData[key]);
                    }
                });
            }

            const response = await this.api.post('/sightings', formData);

            if (response.data || response) {
                const newData = response.data || response;
                this.sightings.unshift(newData);
                return { success: true, data: newData };
            }
        } catch (error) {
            return { 
                success: false, 
                error: error.message || 'Error al crear avistamiento' 
            };
        }
    }

    async classify(formData) {
        try {
            const response = await this.api.post('/sightings/classify', formData);
            return response.data || response;
        } catch (error) {
            return { 
                success: false, 
                error: error.message || 'Error al clasificar imagen' 
            };
        }
    }

    async getByUser(userId) {
        try {
            const response = await this.api.get(`/sightings/user/${userId}`);
            return response.data || response || [];
        } catch (error) {
            console.error('Error fetching user sightings:', error);
            return [];
        }
    }

    async getByZone(zoneId) {
        try {
            const response = await this.api.get(`/sightings/zone/${zoneId}`);
            return response.data || response || [];
        } catch (error) {
            console.error('Error fetching zone sightings:', error);
            return [];
        }
    }

    async search(filters) {
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const response = await this.api.get(`/sightings?${queryParams}`);
            return response.data || response || [];
        } catch (error) {
            console.error('Error searching sightings:', error);
            return [];
        }
    }

    async approve(id) {
        try {
            const response = await this.api.put(`/sightings/${id}/approve`);
            if (response.data || response) {
                const newData = response.data || response;
                const index = this.sightings.findIndex(s => s.id === id);
                if (index !== -1) {
                    this.sightings[index] = newData;
                }
                return { success: true, data: newData };
            }
        } catch (error) {
            return { 
                success: false, 
                error: error.message || 'Error al aprobar avistamiento' 
            };
        }
    }

    async delete(id) {
        try {
            const response = await this.api.delete(`/sightings/${id}`);
            if (response.data || response) {
                // Remove from local array
                this.sightings = this.sightings.filter(s => s.id !== id);
                return { success: true };
            }
        } catch (error) {
            return { 
                success: false, 
                error: error.message || 'Error al eliminar avistamiento' 
            };
        }
    }
    async update(id, updateData) {
        try {
            const response = await this.api.put(`/sightings/${id}`, updateData);
            if (response.data || response) {
                const newData = response.data || response;
                const index = this.sightings.findIndex(s => s.id === id);
                if (index !== -1) {
                    this.sightings[index] = newData;
                }
                return { success: true, data: newData };
            }
        } catch (error) {
            return { 
                success: false, 
                error: error.message || 'Error al actualizar avistamiento' 
            };
        }
    }
}
