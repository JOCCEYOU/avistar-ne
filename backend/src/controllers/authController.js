const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.register = async (req, res) => {
    try {
        const { name, last_name, cedula, email, password } = req.body;

        const lastNameVal = last_name !== undefined ? last_name : null;
        const cedulaVal = (cedula !== undefined && cedula !== '') ? cedula : null;

        // Verificar si el usuario ya existe por email o cédula
        let userExists;
        if (cedulaVal) {
            userExists = await db.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1) OR cedula = $2', [email, cedulaVal]);
        } else {
            userExists = await db.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
        }

        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'El correo o la cédula ya están registrados' });
        }

        // Hashear contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Insertar usuario (guardando correo en minúscula)
        const newUser = await db.query(
            'INSERT INTO users (name, last_name, cedula, email, password_hash) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, last_name, cedula, email, role, created_at',
            [name, lastNameVal, cedulaVal, email.toLowerCase(), passwordHash]
        );

        const user = newUser.rows[0];

        // Crear token
        const token = jwt.sign(
            { id: user.id, role: user.role, status: 'active' },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            token,
            user
        });
    } catch (error) {
        console.error('Error en register:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Verificar si el usuario existe (de forma insensible a mayúsculas)
        const result = await db.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const user = result.rows[0];

        // Verificar contraseña
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Crear token
        const token = jwt.sign(
            { id: user.id, role: user.role, status: user.status || 'active' },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.json({
            message: 'Login exitoso',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status || 'active',
                profile_image: user.profile_image,
                created_at: user.created_at
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { password } = req.body;
        
        let updates = [];
        let values = [];
        let valueIndex = 1;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(password, salt);
            updates.push(`password_hash = $${valueIndex++}`);
            values.push(password_hash);
        }

        if (req.file) {
            const image_url = `/uploads/${req.file.filename}`;
            updates.push(`profile_image = $${valueIndex++}`);
            values.push(image_url);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'No hay datos para actualizar' });
        }

        values.push(userId);
        const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${valueIndex} RETURNING id, name, email, role, profile_image`;
        
        const result = await db.query(query, values);
        if (result.rowCount === 0) return res.status(404).json({ message: 'Usuario no encontrado' });

        res.json({ message: 'Perfil actualizado', user: result.rows[0] });
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};
