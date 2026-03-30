const pool = require('../config/db');

// 1. LISTAR ÓRDENES (Con joins para nombres de cliente y técnico)
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

// 2. CREAR ORDEN (Corregido para coincidir con la columna id_usuario)
const crearOrden = async (req, res) => {
    const { 
        id_usuario,       // Viene del frontend
        cliente_id, 
        tecnico_id, 
        recibido_por, 
        tipo_articulo, 
        placa, 
        tipo_especifico, 
        categoria_servicio, 
        mano_obra,
        codigo_equipo, 
        estado, 
        total 
    } = req.body;

    // Validación de seguridad
    if (!id_usuario) {
        return res.status(400).json({ error: "El ID del usuario creador es obligatorio" });
    }

    try {
        const query = `
            INSERT INTO ordenes_servicio (
                id_usuario,         -- CAMBIADO: Antes decía usuario_id, ahora coincide con la DB
                cliente_id, 
                tecnico_id, 
                recibido_por, 
                tipo_articulo, 
                placa, 
                tipo_especifico, 
                categoria_servicio, 
                mano_obra, 
                codigo_equipo, 
                estado, 
                total
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
            RETURNING *`;

        const values = [
            id_usuario,         // $1
            cliente_id || null, // $2
            tecnico_id || null, // $3
            recibido_por,       // $4
            tipo_articulo,      // $5
            placa,              // $6
            tipo_especifico,    // $7
            categoria_servicio, // $8
            mano_obra || 0,     // $9
            codigo_equipo,      // $10
            estado || 'Recibido', // $11
            total || 0          // $12
        ];

        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error al crear orden:", error.message);
        res.status(500).json({ error: "Error al guardar la orden en la base de datos" });
    }
};

// 3. HISTORIAL POR PLACA
const getHistorialPorPlaca = async (req, res) => {
    const { placa } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM ordenes_servicio WHERE placa = $1 ORDER BY id_orden_servicio DESC',
            [placa]
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener historial:", error.message);
        res.status(500).json({ error: "Error al obtener historial" });
    }
};

// 4. HISTORIAL POR CÓDIGO (Con detalles de cliente/técnico)
const getHistorialPorCodigo = async (req, res) => {
    const { codigo } = req.params;
    try {
        const query = `
            SELECT o.*, t.nombre as nombre_tecnico, c.nombre as nombre_cliente, c.contacto
            FROM ordenes_servicio o
            LEFT JOIN tecnicos t ON o.tecnico_id = t.id_tecnicos
            LEFT JOIN clientes c ON o.cliente_id = c.id
            WHERE o.codigo_equipo = $1
            ORDER BY o.fecha_ingreso DESC
        `;
        const result = await pool.query(query, [codigo]);
        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener historial por código:", error.message);
        res.status(500).json({ error: "Error al obtener historial" });
    }
};

module.exports = {
    listarOrdenes,
    crearOrden,
    getHistorialPorPlaca,
    getHistorialPorCodigo
};