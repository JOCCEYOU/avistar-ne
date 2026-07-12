export class ApiClient {
    constructor(baseURL = window.APP_CONFIG.API_URL) {
        this.baseURL = baseURL;
        this.token = null;
    }

    setToken(token) {
        this.token = token;
        sessionStorage.setItem('authToken', token);
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const config = {
            ...options,
            headers
        };

        // If body is FormData, don't set Content-Type so browser can set it with boundary
        if (options.body instanceof FormData) {
            delete headers['Content-Type'];
        }

        const response = await fetch(url, config);
        
        let data;
        try {
            data = await response.json();
        } catch (e) {
            data = { message: 'Respuesta no válida del servidor' };
        }

        if (!response.ok) {
            throw new Error(data.message || 'Error en la petición');
        }

        return data;
    }

    get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }

    post(endpoint, body, options = {}) {
        const isFormData = body instanceof FormData;
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: isFormData ? body : JSON.stringify(body)
        });
    }

    put(endpoint, body, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(body)
        });
    }

    delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }
}
