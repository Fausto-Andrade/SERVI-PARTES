const db = require('../config/db');

const Cliente = {
  // Crear un nuevo cliente
  create: async (nombre, contacto) => {
    const query = `
      INSERT INTO clientes (nombre, contacto)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const { rows } = await db.query(query, [nombre, contacto]);
    return rows[0];
  },

  // NUEVO MÉTODO: Update
    update: async (id, datos) => {
        const { nombre, contacto } = datos;
        try {
            // En PostgreSQL los parámetros se marcan con $1, $2, $3...
            const text = 'UPDATE clientes SET nombre = $1, contacto = $2 WHERE id = $3 RETURNING *';
            const values = [nombre, contacto, id];
            
            const res = await db.query(text, values);
            
            if (res.rowCount === 0) {
                throw new Error('Cliente no encontrado');
            }
            
            return res.rows[0]; // Retorna el cliente actualizado
        } catch (error) {
            console.error('Error en Cliente.update (Postgres):', error);
            throw error;
        }
    },

 // Obtener todos los clientes
  getAll: async () => {
    const query = 'SELECT * FROM clientes ORDER BY fecha_registro DESC;';
    const { rows } = await db.query(query);
    return rows;
  },

  // Buscar un cliente por ID
  getById: async (id) => {
    const query = 'SELECT * FROM clientes WHERE id = $1;';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  },

  // Buscar cliente por nombre o contacto (Muy útil para el buscador del taller)
  search: async (termino) => {
    const query = `
      SELECT * FROM clientes 
      WHERE nombre ILIKE $1 OR contacto ILIKE $1;
    `;
    const values = [`%${termino}%`];
    const { rows } = await db.query(query, values);
    return rows;
  }
};

module.exports = Cliente;