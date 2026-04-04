const pool = require('../config/db');

// 1. LISTAR ÓRDENES
const listarOrdenes = async (req, res) => {
    try {
        const query = `
            SELECT 
                o.*, 
                c.nombre AS nombre_cliente, 
                c.contacto AS contacto,
                t.nombre AS nombre_tecnico
            FROM ordenes_servicio o
            LEFT JOIN clientes c ON o.cliente_id = c.id
            LEFT JOIN tecnicos t ON o.tecnico_id = t.id_tecnicos
            ORDER BY o.id_orden_servicio DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error("Error al listar órdenes:", error.message);
        res.status(500).json({ error: "Error al obtener las órdenes" });
    }
};

// 2. CREAR ORDEN
const crearOrden = async (req, res) => {
    const { 
        id_usuario, cliente_id, tecnico_id, recibido_por, tipo_articulo, 
        placa, tipo_especifico, categoria_servicio, mano_obra,
        codigo_equipo, estado, total, tipo_orden 
    } = req.body;

    if (!id_usuario) return res.status(400).json({ error: "El ID del usuario es obligatorio" });

    try {
        const query = `
            INSERT INTO ordenes_servicio (
                id_usuario, cliente_id, tecnico_id, recibido_por, tipo_articulo, 
                placa, tipo_especifico, categoria_servicio, mano_obra, 
                codigo_equipo, estado, total, tipo_orden
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
            RETURNING *`;

        const values = [
            id_usuario, cliente_id || null, tecnico_id || null, recibido_por, tipo_articulo,
            placa, tipo_especifico, categoria_servicio, mano_obra || 0,
            codigo_equipo, estado || 'Recibido', total || 0, tipo_orden || 'nueva'
        ];

        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error al crear:", error.message);
        res.status(500).json({ error: "Error al guardar en la DB" });
    }
};

// 3. ACTUALIZAR ORDEN (¡ESTO TE FALTABA PARA QUE EL TÉCNICO CAMBIE!)
const actualizarOrden = async (req, res) => {
    const { id } = req.params;
    const { 
        tecnico_id, recibido_por, placa, tipo_especifico, 
        categoria_servicio, mano_obra, total, estado, tipo_orden 
    } = req.body;

    try {
        const query = `
            UPDATE ordenes_servicio 
            SET tecnico_id = $1, recibido_por = $2, placa = $3, tipo_especifico = $4, 
                categoria_servicio = $5, mano_obra = $6, total = $7, estado = $8, tipo_orden = $9
            WHERE id_orden_servicio = $10
            RETURNING *`;

        const values = [
            tecnico_id || null, recibido_por, placa, tipo_especifico,
            categoria_servicio, mano_obra, total, estado, tipo_orden, id
        ];

        const result = await pool.query(query, values);
        if (result.rowCount === 0) return res.status(404).json({ error: "Orden no encontrada" });
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error al actualizar:", error.message);
        res.status(500).json({ error: "Error al actualizar la orden" });
    }
};

// 4. HISTORIAL POR PLACA Y CÓDIGO (Simplificados)
const getHistorialPorPlaca = async (req, res) => {
    const { placa } = req.params;
    try {
        const result = await pool.query('SELECT * FROM ordenes_servicio WHERE placa = $1 ORDER BY id_orden_servicio DESC', [placa]);
        res.json(result.rows);
    } catch (error) { res.status(500).json({ error: "Error en historial" }); }
};

const getHistorialPorCodigo = async (req, res) => {
    const { codigo } = req.params;
    try {
        const query = `
            SELECT o.*, t.nombre as nombre_tecnico, c.nombre as nombre_cliente 
            FROM ordenes_servicio o
            LEFT JOIN tecnicos t ON o.tecnico_id = t.id_tecnicos
            LEFT JOIN clientes c ON o.cliente_id = c.id
            WHERE o.codigo_equipo = $1 ORDER BY o.fecha_ingreso DESC`;
        const result = await pool.query(query, [codigo]);
        res.json(result.rows);
    } catch (error) { res.status(500).json({ error: "Error en historial" }); }
};

module.exports = {
    listarOrdenes,
    crearOrden,
    actualizarOrden, // <-- Exportado
    getHistorialPorPlaca,
    getHistorialPorCodigo
};