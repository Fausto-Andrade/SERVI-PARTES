const db = require('../config/db');

const Orden = {
  create: async (datos) => {
    const { cliente_id, recibido_por, tipo_articulo, placa, categoria_servicio, tipo_especifico, mano_obra } = datos;
    const query = `
      INSERT INTO ordenes_servicio 
      (cliente_id, recibido_por, tipo_articulo, placa, categoria_servicio, tipo_especifico, mano_obra) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *;
    `;
    const values = [cliente_id, recibido_por, tipo_articulo, placa, categoria_servicio, tipo_especifico, mano_obra];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  getAll: async () => {
    // Aquí traemos el nombre del cliente uniendo las tablas
    const query = `
      SELECT o.*, c.nombre as nombre_cliente 
      FROM ordenes_servicio o
      JOIN clientes c ON o.cliente_id = c.id
      ORDER BY o.fecha_ingreso DESC;
    `;
    const { rows } = await db.query(query);
    return rows;
  },

  updateEstado: async (id_orden, nuevoEstado) => {
    const query = `
        UPDATE ordenes_servicio 
        SET estado = $1 
        WHERE id_orden_servicio = $2 
        RETURNING *;
    `;
    const { rows } = await db.query(query, [nuevoEstado, id_orden]);
    return rows[0];
},

};

module.exports = Orden;