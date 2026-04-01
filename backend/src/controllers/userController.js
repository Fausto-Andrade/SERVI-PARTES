const Usuario = require('../models/userModel');
const db = require('../config/db');
const bcrypt = require('bcryptjs');

const userController = {
    registrar: async (req, res) => {
        try {
            const nuevoUsuario = await Usuario.create(req.body);
            res.status(201).json(nuevoUsuario);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al registrar usuario' });
        }
    },

    listar: async (req, res) => {
        try {
            // Agregamos u.activo a la consulta para que el Frontend pueda filtrar
            const query = `
                SELECT 
                    u.id_usuario, 
                    u.username, 
                    u.rol,
                    u.activo,
                    COUNT(o.id_orden_servicio) AS ordenes_activas
                FROM usuarios u
                LEFT JOIN ordenes_servicio o ON u.username = o.recibido_por 
                    AND UPPER(TRIM(o.estado)) NOT IN ('FINALIZADO', 'ENTREGADO', 'CANCELADO')
                GROUP BY u.id_usuario, u.username, u.rol, u.activo
                ORDER BY u.id_usuario DESC;
            `;
            const { rows } = await db.query(query);
            res.json(rows);
        } catch (error) {
            console.error("Error al obtener usuarios con órdenes:", error);
            res.status(500).json({ mensaje: 'Error al obtener usuarios' });
        }
    },

    actualizarPassword: async (req, res) => {
        const id = parseInt(req.params.id);
        const { password } = req.body;
        try {
            if (!password || password.length < 4) {
                return res.status(400).json({ error: "Contraseña demasiado corta" });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const result = await db.query(
                "UPDATE usuarios SET password = $1 WHERE id_usuario = $2 RETURNING id_usuario",
                [hashedPassword, id]
            );
            if (result.rowCount === 0) return res.status(404).json({ error: "Usuario no encontrado" });
            res.json({ mensaje: "Contraseña actualizada con éxito" });
        } catch (err) {
            res.status(500).json({ error: "Error interno" });
        }
    },

    desactivar: async (req, res) => {
        const { id } = req.params;
        try {
            const userId = parseInt(id);

            // Cambiamos el estado a false en lugar de borrar la fila
            const result = await db.query(
                "UPDATE usuarios SET activo = false WHERE id_usuario = $1", 
                [userId]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
            }

            res.json({ mensaje: 'Usuario retirado de la lista correctamente.' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al intentar retirar el usuario.' });
        }
    }
};

module.exports = userController;