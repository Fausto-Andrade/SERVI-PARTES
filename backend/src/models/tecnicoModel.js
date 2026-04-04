const db = require('../config/db');

const Tecnico = {
  // Crear un nuevo técnico
  create: async (nombre, especialidad) => {
    const query = `
      INSERT INTO tecnicos (nombre, especialidad) 
      VALUES ($1, $2) 
      RETURNING *;
    `;
    const { rows } = await db.query(query, [nombre, especialidad]);
    return rows[0];
  },

 // Obtener todos los técnicos con su carga de órdenes activa
 getAll: async () => {
    // ACTUALIZADO: Primero los activos, luego orden alfabético por nombre
    const queryConOrdenes = `
      SELECT t.*, 
      (SELECT COUNT(*)::int 
       FROM ordenes_servicio o 
       WHERE o.tecnico_id = t.id_tecnicos 
       AND o.estado NOT IN ('Entregado', 'Terminado', 'Cancelado')) AS ordenes_activas
      FROM tecnicos t
      ORDER BY t.activo DESC, t.nombre COLLATE "es_ES" ASC; 
    `;

    try {
      const { rows } = await db.query(queryConOrdenes);
      return rows;
    } catch (error) {
      console.error("--- ERROR EN SQL DE TÉCNICOS ---");
      console.error("Mensaje:", error.message);
      
      const querySimple = 'SELECT *, 0 AS ordenes_activas FROM tecnicos ORDER BY id_tecnicos DESC;';
      const { rows } = await db.query(querySimple);
      return rows;
    }
  },

  // NUEVA FUNCIÓN: Actualiza el estado (Bloqueo Lógico)
  updateEstado: async (id, estado) => {
    try {
      const query = `
        UPDATE tecnicos 
        SET activo = $1 
        WHERE id_tecnicos = $2 
        RETURNING *;
      `;
      const { rows } = await db.query(query, [estado, id]);
      return rows[0];
    } catch (error) {
      console.error("Error al actualizar estado del técnico:", error.message);
      throw error;
    }
  },

  // Método para eliminar técnico (mantiene la coherencia con TecnicosPage.jsx)
  delete: async (id) => {
    const query = 'DELETE FROM tecnicos WHERE id_tecnicos = $1 RETURNING *;';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }  
};

module.exports = Tecnico;