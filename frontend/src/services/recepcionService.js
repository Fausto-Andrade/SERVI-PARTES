// 1. Importamos tu instancia configurada
import api from '../api/axios';

// 2. Definimos la ruta relativa
const API_URL = '/recepcion';

export const getPersonalRecepcion = async () => {
    try {
        // Usamos 'api' en lugar de 'axios'
        const response = await api.get(API_URL); 
        return response.data; 
    } catch (error) {
        console.error("Error al obtener empleados:", error);
        throw error;
    }
};

export const createAsesor = async (datos) => {
    try {
        // Usamos 'api' para mantener la base /api
        const response = await api.post(API_URL, datos);
        return response.data;
    } catch (error) {
        console.error("Error al crear asesor:", error);
        throw error;
    }
};

export const deleteAsesor = async (id) => {
    try {
        // CAMBIO PRO: Eliminamos fetch y la IP. Usamos nuestra instancia 'api'.
        // La URL final será automáticamente /api/recepcion/{id}
        const response = await api.delete(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error en service deleteAsesor:", error);
        // Extraemos el mensaje de error del backend si existe
        const mensaje = error.response?.data?.mensaje || 'Error al eliminar';
        throw new Error(mensaje);
    }
};