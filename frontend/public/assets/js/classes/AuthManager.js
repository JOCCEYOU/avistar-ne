export class AuthManager {
    constructor(apiClient) {
        this.api = apiClient;
        this.currentUser = null;
        this.isAuthenticated = false;
        this.listeners = [];
        this.loadSession();
    }

    async register(userData) {
        try {
            const response = await this.api.post('/auth/register', userData);
            if (response.data || response.token) {
                const token = response.token || response.data.token;
                const user = response.user || response.data.user;
                this.setSession(token, user);
                this.notifyListeners();
                return { success: true, user };
            }
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                error: error.message || 'Error al registrar' 
            };
        }
    }

    async login(email, password, rememberMe = false) {
        try {
            const response = await this.api.post('/auth/login', { email, password });
            if (response.data || response.token) {
                const token = response.token || response.data.token;
                const user = response.user || response.data.user;
                this.setSession(token, user, rememberMe);
                this.notifyListeners();
                return { success: true, user };
            }
            return { success: false, error: 'Respuesta inválida del servidor' };
        } catch (error) {
            return { 
                success: false, 
                error: error.message || 'Credenciales inválidas' 
            };
        }
    }

    async updateProfile(formData) {
        try {
            const response = await this.api.put('/auth/profile', formData);
            if (response.data || response.user) {
                const updatedUser = response.user || response.data.user;
                this.currentUser = updatedUser;
                sessionStorage.setItem('user', JSON.stringify(updatedUser));
                this.notifyListeners();
                return { success: true, user: updatedUser };
            }
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                error: error.message || 'Error al actualizar perfil' 
            };
        }
    }

    logout() {
        this.clearSession();
        this.notifyListeners();
        window.location.hash = '#/';
    }

    setSession(token, user, rememberMe = false) {
        this.token = token;
        this.currentUser = user;
        this.isAuthenticated = true;
        this.api.setToken(token);
        if (token) {
            sessionStorage.setItem('authToken', token);
            if (rememberMe) {
                localStorage.setItem('authToken', token);
            } else {
                localStorage.removeItem('authToken');
            }
        }
        if (user) {
            sessionStorage.setItem('user', JSON.stringify(user));
            if (rememberMe) {
                localStorage.setItem('user', JSON.stringify(user));
            } else {
                localStorage.removeItem('user');
            }
        }
    }

    clearSession() {
        this.token = null;
        this.currentUser = null;
        this.isAuthenticated = false;
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('user');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        if (this.api) this.api.setToken(null);
    }

    loadSession() {
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
        const user = sessionStorage.getItem('user') || localStorage.getItem('user');
        if (token && user && user !== 'undefined') {
            try {
                const parsedUser = JSON.parse(user);
                if (parsedUser) {
                    this.token = token;
                    this.currentUser = parsedUser;
                    this.isAuthenticated = true;
                    if (this.api) this.api.setToken(token);
                    return true;
                }
            } catch (e) {
                this.clearSession();
                return false;
            }
        }
        this.clearSession();
        return false;
    }

    addListener(callback) {
        this.listeners.push(callback);
    }

    notifyListeners() {
        this.listeners.forEach(callback => callback(this));
    }

    isAdmin() {
        return this.currentUser?.role === 'admin';
    }
}
