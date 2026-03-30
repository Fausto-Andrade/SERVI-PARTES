const express = require('express');
const router = express.Router();
const ordenController = require('../controllers/ordenController');
const pool = require('../config/db'); 

// 1. Listar todas las órdenes
router.get('/', ordenController.listarOrdenes);

// 2. Crear una nueva orden 
router.post('/', ordenController.crearOrden);

// 3. Actualizar una orden completa (Edición)
// Esta ruta recibe todos los campos desde el formulario de edición
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const idNumerico = parseInt(id);
        
        const {
            cliente_id, tecnico_id, recibido_por, tipo_articulo,
            placa, codigo_equipo, categoria_servicio, tipo_especifico,
            mano_obra, total, requiere_factura, factura_emitida,
            estado_pago, abono_inicial, estado
        } = req.body;

        const query = `
            UPDATE ordenes_servicio 
            SET 
                cliente_id = $1, tecnico_id = $2, recibido_por = $3, 
                tipo_articulo = $4, placa = $5, codigo_equipo = $6, 
                categoria_servicio = $7, tipo_especifico = $8, 
                mano_obra = $9, total = $10, requiere_factura = $11, 
                factura_emitida = $12, estado_pago = $13, 
                abono_inicial = $14, estado = $15
            WHERE id_orden_servicio = $16
            RETURNING *;
        `;

        const values = [
            cliente_id, tecnico_id, recibido_por, tipo_articulo,
            placa, codigo_equipo, categoria_servicio, tipo_especifico,
            mano_obra, total, requiere_factura, factura_emitida,
            estado_pago, abono_inicial, estado, idNumerico
        ];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "No se encontró la orden para actualizar" });
        }

        res.json({ message: "Orden actualizada correctamente", orden: result.rows[0] });
    } catch (err) {
        console.error("Error en PUT orden:", err.message);
        res.status(500).json({ error: "Error del servidor al editar la orden" });
    }
});

// 4. Actualizar solo el estado (Tu ruta original)
router.patch('/:id/estado', async (req, res) => {
    try {
        const { id } = req.params;
        const { nuevo_estado } = req.body; 
        const idNumerico = parseInt(id);

        const result = await pool.query(
            'UPDATE ordenes_servicio SET estado = $1 WHERE id_orden_servicio = $2 RETURNING *',
            [nuevo_estado, idNumerico]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "No se encontró la orden" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error en PATCH estado:", err.message);
        res.status(500).json({ error: "Error del servidor al actualizar estado" });
    }
});

// Endpoint para validar duplicados en órdenes abiertas
router.get('/validar-duplicado', async (req, res) => {
  const { codigo_equipo, placa } = req.query;
  
  try {
    // Buscamos órdenes que NO estén en estado 'Entregado'
    const query = `
      SELECT id_orden_servicio, codigo_equipo, placa 
      FROM ordenes_servicio 
      WHERE estado != 'Entregado' 
      AND (codigo_equipo = $1 OR (placa = $2 AND placa != ''))
    `;
    
    const result = await pool.query(query, [codigo_equipo, placa]);

    if (result.rows.length > 0) {
      return res.json({ 
        existe: true, 
        mensaje: "Ya existe una orden abierta para este equipo o placa." 
      });
    }

    res.json({ existe: false });
  } catch (err) {
    res.status(500).json({ error: "Error al validar duplicados" });
  }
});

// 5. Historiales
router.get('/historial/:placa', ordenController.getHistorialPorPlaca);
router.get('/historial-codigo/:codigo', ordenController.getHistorialPorCodigo);

module.exports = router;