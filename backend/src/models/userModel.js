const db = require('../config/db');

const Usuario = {
    // Crea un nuevo usuario y retorna los datos básicos
    create: async (datos) => {
        const { username, password, rol } = datos;
        const query = `
            INSERT INTO usuarios (username, password, rol) 
            VALUES ($1, $2, $3) 
            RETURNING id_usuario, username, rol;
        `;
        const { rows } = await db.query(query, [username, password, rol || 'empleado']);
        return rows[0];
    },

    // Obtiene todos los usuarios con el conteo de órdenes basadas en 'recibido_por'
    getAll: async () => {
        const query = `
            SELECT 
                u.id_usuario, 
                u.username, 
                u.rol,
                COUNT(o.id_orden_servicio) AS ordenes_activas
            FROM usuarios u
            -- Unimos las tablas comparando el nombre de usuario con quien recibió la orden
            LEFT JOIN ordenes_servicio o ON u.username = o.recibido_por 
                AND UPPER(TRIM(o.estado)) NOT IN ('FINALIZADO', 'ENTREGADO', 'COMPLETADO', 'CANCELADO')
            GROUP BY u.id_usuario, u.username, u.rol
            ORDER BY u.id_usuario DESC;
        `;
        
        const { rows } = await db.query(query);
        return rows;
    }
};

module.exports = Usuario;