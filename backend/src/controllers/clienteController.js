const Cliente = require('../models/clienteModel');

const clienteController = {
  // Crear un cliente (POST)
  crearCliente: async (req, res) => {
    try {
      const { nombre, contacto } = req.body;

      // Validación básica: que no vengan vacíos
      if (!nombre || !contacto) {
        return res.status(400).json({ 
          mensaje: 'Nombre y contacto son obligatorios' 
        });
      }

      const nuevoCliente = await Cliente.create(nombre, contacto);
      res.status(201).json({
        mensaje: 'Cliente registrado con éxito',
        data: nuevoCliente
      });
    } catch (error) {
      console.error('Error al crear cliente:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
  },

  // Obtener todos los clientes (GET)
  listarClientes: async (req, res) => {
    try {
      const clientes = await Cliente.getAll();
      res.json(clientes);
    } catch (error) {
      console.error('Error al listar clientes:', error);
      res.status(500).json({ mensaje: 'Error al obtener los clientes' });
    }
  },

  // --- FUNCIÓN UPDATE INTEGRADA CORRECTAMENTE ---
  update: async (req, res) => {
    const { id } = req.params;
    const { nombre, contacto } = req.body;
    
    try {
        // IMPORTANTE: Asegúrate de que en clienteModel.js tengas un método update
        const resultado = await Cliente.update(id, { nombre, contacto });
        
        res.json({ 
            mensaje: "Cliente actualizado con éxito",
            data: resultado 
        });
    } catch (error) {
        console.error('Error al actualizar:', error);
        res.status(500).json({ error: "Error al actualizar el cliente" });
    }
  },

  // Buscar clientes (GET con query params)
  buscarClientes: async (req, res) => {
    try {
      const { q } = req.query; // Ejemplo: /api/clientes/buscar?q=juan
      if (!q) {
        return res.status(400).json({ mensaje: 'Debes proporcionar un término de búsqueda' });
      }

      const resultados = await Cliente.search(q);
      res.json(resultados);
    } catch (error) {
      console.error('Error en búsqueda:', error);
      res.status(500).json({ mensaje: 'Error al realizar la búsqueda' });
    }
  }
};



module.exports = clienteController;