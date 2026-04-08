import api from '../api/axios'; 

// const API_URL = 'http://localhost:3000/api/users';
const API_URL = '/usuarios'; 

const usuarioService = {
    listar: async () => {
        try {
            // Usamos 'api' en lugar de 'axios'
            const response = await api.get(API_URL);
            return response.data;
        } catch (error) {
            console.error("Error al listar usuarios:", error);
            throw error;
        }
    },

    registrar: async (userData) => {
        try {
            const response = await api.post(`${API_URL}/registro`, userData);
            return response.data;
        } catch (error) {
            console.error("Error al registrar usuario:", error);
            throw error;
        }
    },

    actualizarPassword: async (id, password) => {
        try {
            const response = await api.put(`${API_URL}/reset-password/${id}`, { password });
            return response.data;
        } catch (error) {
            console.error("Error al actualizar contraseña:", error);
            throw error;
        }
    },

    eliminar: async (id) => {
        try {
            const response = await api.delete(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
            throw error;
        }
    }
};

export default usuarioService;