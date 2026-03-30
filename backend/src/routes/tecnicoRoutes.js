const express = require('express');
const router = express.Router();
const tecnicoController = require('../controllers/tecnicoController');
const pool = require('../config/db');

// 1. Obtener todos los técnicos
router.get('/', tecnicoController.listarTecnicos);

// 2. Registrar técnico
router.post('/', tecnicoController.crearTecnico);

// 3. Verificar órdenes en la tabla 'ordenes_servicio'
router.get('/check-ordenes/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Usamos el nombre real de tu tabla: ordenes_servicio
        // Nota: Asegúrate de que los estados coincidan con los que usas ('Entregado', 'Terminado', etc.)
        const result = await pool.query(
            "SELECT COUNT(*) FROM ordenes_servicio WHERE tecnico_id = $1 AND estado NOT IN ('Entregado', 'Terminado', 'Cancelado')",
            [id]
        );

        const ordenesActivas = parseInt(result.rows[0].count);
        
        res.json({ 
            tieneOrdenesAbiertas: ordenesActivas > 0,
            total: ordenesActivas 
        });
    } catch (err) {
        console.error("Error al verificar ordenes_servicio:", err.message);
        res.status(200).json({ 
            tieneOrdenesAbiertas: false, 
            total: 0 
        });
    }
});

/**
 * 4. ELIMINACIÓN LÓGICA (BLOQUEO)
 * En lugar de DELETE físico, hacemos un UPDATE del campo 'activo'.
 * Esto evita el error de llave foránea y mantiene el historial.
 */
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Cambiamos el estado a false. El registro permanece, pero queda "inactivo"
        const result = await pool.query(
            'UPDATE tecnicos SET activo = false WHERE id_tecnicos = $1 RETURNING *', 
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Técnico no encontrado" });
        }

        res.json({ mensaje: "Técnico retirado correctamente (Bloqueo lógico)" });
    } catch (err) {
        console.error("Error en el retiro del técnico:", err.message);
        res.status(500).json({ 
            error: "Error interno al intentar retirar al técnico." 
        });
    }
});

module.exports = router;