const Tecnico = require('../models/tecnicoModel');

const tecnicoController = {
    listarTecnicos: async (req, res) => {
        try {
        const tecnicos = await Tecnico.getAll();
        
        // Refuerzo de ordenamiento en el controlador
        const tecnicosOrdenados = tecnicos.sort((a, b) => 
            a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
        );

        res.json(tecnicosOrdenados);
        } catch (error) {
        console.error('Error al listar técnicos:', error);
        res.status(500).json({ mensaje: 'Error al obtener los técnicos' });
        }
    },
    
    crearTecnico: async (req, res) => {
        try {
            const { nombre, especialidad } = req.body;
            // Al crear, por defecto el campo 'activo' debería ser true en tu DB o Model
            const nuevoTecnico = await Tecnico.create(nombre, especialidad);
            res.status(201).json(nuevoTecnico);
        } catch (error) {
            console.error("Error al crear técnico:", error.message);
            res.status(500).json({ mensaje: 'Error al crear el técnico' });
        }
    },

    // ESTA ES LA FUNCIÓN NUEVA PARA EL BLOQUEO LÓGICO
    eliminarTecnico: async (req, res) => {
        const { id } = req.params;
        try {
            // Llamamos al modelo para que cambie el estado a 'false' en lugar de borrar
            const resultado = await Tecnico.updateEstado(id, false);
            
            if (!resultado) {
                return res.status(404).json({ mensaje: 'Técnico no encontrado' });
            }

            res.json({ mensaje: 'Técnico desactivado correctamente (bloqueo lógico)' });
        } catch (error) {
            console.error("Error al desactivar técnico:", error.message);
            res.status(500).json({ mensaje: 'Error al procesar la solicitud de desactivación' });
        }
    }
};

module.exports = tecnicoController;