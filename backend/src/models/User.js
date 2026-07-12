class User {
    constructor(id, name, email, passwordHash, role = 'user', createdAt = new Date()) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role; // 'user' | 'admin'
        this.createdAt = createdAt;
        this.updatedAt = new Date();
        this.isActive = true;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            role: this.role,
            createdAt: this.createdAt
        };
    }

    canModerate() {
        return this.role === 'admin';
    }
}

module.exports = User;
