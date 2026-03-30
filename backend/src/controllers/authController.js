const db = require('../config/db');
const jwt = require('jsonwebtoken');

// --- FUNCIÓN DE LOGIN ---
const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await db.query('SELECT * FROM usuarios WHERE username = $1', [username]);
        const user = result.rows[0];

        if (!user || user.password !== password) { // Aquí luego usaremos bcrypt
            return res.status(401).json({ mensaje: 'Credenciales inválidas' });
        }

        // Generar el Token (expira en 2 horas)
        const token = jwt.sign(
            { id: user.id_usuario, rol: user.rol }, 
            'TU_CLAVE_SECRETA_SUPER_SEGURA', 
            { expiresIn: '2h' }
        );

        res.json({ token, username: user.username, rol: user.rol });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error en el servidor al iniciar sesión' });
    }
};

// --- FUNCIÓN DE REGISTRO (Nueva integración) ---
const registro = async (req, res) => {
    const { username, password, rol } = req.body;

    try {
        // 1. Validar si el usuario ya existe en la base de datos
        const existe = await db.query('SELECT id_usuario FROM usuarios WHERE username = $1', [username]);
        
        if (existe.rows.length > 0) {
            return res.status(400).json({ mensaje: 'El nombre de usuario ya está en uso' });
        }

        // 2. Insertar el nuevo usuario
        // Nota: Asegúrate de que los nombres de las columnas coincidan con tu tabla (username, password, rol)
        await db.query(
            'INSERT INTO usuarios (username, password, rol) VALUES ($1, $2, $3)',
            [username, password, rol || 'empleado']
        );

        res.status(201).json({ mensaje: 'Usuario registrado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error en el servidor al registrar usuario' });
    }
};

module.exports = { 
    login,
    registro 
};