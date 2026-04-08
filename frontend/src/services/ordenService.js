// 1. Importamos la instancia configurada con baseURL: '/api'
import api from '../api/axios'; 

// 2. Ruta relativa para las órdenes
const API_URL = '/ordenes';

// 1. Obtener todas las órdenes
export const getOrdenes = async () => {
    // La petición final será: /api/ordenes
    const response = await api.get(API_URL);
    return response.data;
};

// 2. Crear una nueva orden
export const createOrden = async (ordenData) => {
    const response = await api.post(API_URL, ordenData);
    return response.data;
};

// 3. Actualizar una orden completa (Edición)
export const updateOrden = async (id, ordenData) => {
    const response = await api.put(`${API_URL}/${id}`, ordenData);
    return response.data;
};

// 4. Actualizar solo el estado de la orden
export const updateEstadoOrden = async (id, nuevoEstado) => {
    // Usamos patch como tenías definido, pero a través de la instancia api
    const response = await api.patch(`${API_URL}/${id}/estado`, {
        nuevo_estado: nuevoEstado
    });
    return response.data;
};