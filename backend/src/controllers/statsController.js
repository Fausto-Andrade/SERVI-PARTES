const db = require('../config/db');

const getStats = async (req, res) => {
    try {
        // 1. Total Dinero Generado (Solo de órdenes terminadas/entregadas)
        const totalIngresos = await db.query(
            "SELECT SUM(mano_obra) as total FROM ordenes_servicio WHERE estado IN ('Terminado', 'Entregado')"
        );

        // 2. Conteo de Órdenes por Estado
        const porEstado = await db.query(
            "SELECT estado, COUNT(*) as cantidad FROM ordenes_servicio GROUP BY estado"
        );

        // 3. Cantidad de Clientes Registrados
        const totalClientes = await db.query("SELECT COUNT(*) as total FROM clientes");

        res.json({
            ingresos: totalIngresos.rows[0].total || 0,
            estados: porEstado.rows,
            clientes: totalClientes.rows[0].total
        });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener estadísticas' });
    }
};

module.exports = { getStats };