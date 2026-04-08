import axios from 'axios';

// const API_URL = 'http://localhost:3000/api/users'; 
const API_URL = 'http://138.36.237.111:3000/api/users'; 

const usuarioService = {
    // Coincide con router.get('/') -> userController.listar
    listar: async () => {
        try {
            const response = await axios.get(API_URL);
            return response.data;
        } catch (error) {
            console.error("Error al listar usuarios:", error);
            throw error;
        }
    },

    // Coincide con router.post('/registro') -> userController.registrar
    registrar: async (userData) => {
        try {
            const response = await axios.post(`${API_URL}/registro`, userData);
            return response.data;
        } catch (error) {
            console.error("Error al registrar usuario:", error);
            throw error;
        }
    },

    actualizarPassword: async (id, password) => {
        try {
            const response = await axios.put(`${API_URL}/reset-password/${id}`, { password });
            return response.data;
        } catch (error) {
            console.error("Error al actualizar contraseña:", error);
            throw error;
        }
    },

    // Coincide con router.delete('/:id') -> userController.eliminar
    eliminar: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
            throw error;
        }
    }
};

export default usuarioService;