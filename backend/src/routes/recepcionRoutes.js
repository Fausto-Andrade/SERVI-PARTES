const express = require('express');
const router = express.Router();
const pool = require('../config/db'); 

/**
 * GET /api/recepcion
 * Ahora obtiene los 'username' de la tabla 'usuarios' que tengan rol 'EMPLEADO',
 * manteniendo también al personal registrado manualmente en 'personal_recepcion' 
 * si así lo deseas.
 */
router.get('/', async (req, res) => {
  try {
    // Forzamos que ambos SELECT devuelvan una columna llamada "nombre"
    const query = `
      SELECT username AS nombre FROM usuarios WHERE rol = 'empleado'
      UNION
      SELECT nombre FROM personal_recepcion
      ORDER BY nombre ASC
    `;
    
    const result = await pool.query(query);
    console.log("Filas enviadas al frontend:", result.rows); // Verifica esto en la consola de tu terminal (Node)
    res.json(result.rows);
  } catch (err) {
    console.error("Error en GET /api/recepcion:", err.message);
    res.status(500).json({ error: "Error al obtener el personal" });
  }
});

// Crear nuevo asesor (Sigue funcionando para la tabla personal_recepcion)
router.post('/', async (req, res) => {
  const { nombre, cargo } = req.body;
  
  if (!nombre || !cargo) {
    return res.status(400).json({ error: "Nombre y cargo son obligatorios" });
  }

  try {
    const result = await pool.query(
      'INSERT INTO personal_recepcion (nombre, cargo) VALUES ($1, $2) RETURNING *',
      [nombre, cargo]
    );
    res.json(result.rows[0]); 
  } catch (err) {
    console.error("Error en POST /api/recepcion:", err.message);
    res.status(500).json({ error: "Error al registrar el asesor" });
  }
});

// Eliminar un asesor (Solo de la tabla personal_recepcion)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM personal_recepcion WHERE id_recepcion = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Asesor no encontrado" });
    }

    res.json({ mensaje: "Asesor eliminado correctamente", asesor: result.rows[0] });
  } catch (err) {
    console.error("Error en DELETE /api/recepcion:", err.message);
    res.status(500).json({ error: "No se puede eliminar el asesor porque está vinculado a una orden de servicio existente." });
  }
});

module.exports = router;