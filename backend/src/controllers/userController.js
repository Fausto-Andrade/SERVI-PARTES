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
            // Consulta ajustada para contar órdenes basadas en quién las recibió
            const query = `
                SELECT 
                    u.id_usuario, 
                    u.username, 
                    u.rol,
                    COUNT(o.id_orden_servicio) AS ordenes_activas
                FROM usuarios u
                LEFT JOIN ordenes_servicio o ON u.username = o.recibido_por 
                    AND UPPER(TRIM(o.estado)) NOT IN ('FINALIZADO', 'ENTREGADO', 'CANCELADO')
                GROUP BY u.id_usuario, u.username, u.rol
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

    eliminar: async (req, res) => {
        const { id } = req.params;
        try {
            // 1. Primero obtenemos el nombre del usuario para verificar sus órdenes por "recibido_por"
            const userRes = await db.query("SELECT username FROM usuarios WHERE id_usuario = $1", [id]);
            
            if (userRes.rowCount === 0) {
                return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
            }

            const username = userRes.rows[0].username;

            // 2. Validación de seguridad: verificar órdenes activas donde este usuario sea el receptor o el técnico
            const check = await db.query(
                `SELECT COUNT(*) FROM ordenes_servicio 
                 WHERE (recibido_por = $1 OR tecnico_id = $2) 
                 AND UPPER(TRIM(estado)) NOT IN ('FINALIZADO', 'ENTREGADO', 'CANCELADO')`, 
                [username, id]
            );
            
            if (parseInt(check.rows[0].count) > 0) {
                return res.status(400).json({ 
                    mensaje: `No se puede eliminar: El usuario tiene ${check.rows[0].count} órdenes activas bajo su responsabilidad.` 
                });
            }

            // 3. Si no tiene órdenes pendientes, procedemos a borrar
            await db.query('DELETE FROM usuarios WHERE id_usuario = $1', [id]);
            res.json({ mensaje: 'Usuario eliminado correctamente.' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error al intentar eliminar.' });
        }
    }
};

module.exports = userController;