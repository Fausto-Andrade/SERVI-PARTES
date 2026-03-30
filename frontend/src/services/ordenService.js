import axios from 'axios';

const API_URL = 'http://localhost:3000/api/ordenes';

// 1. Obtener todas las órdenes
export const getOrdenes = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

// 2. Crear una nueva orden
export const createOrden = async (ordenData) => {
    const response = await axios.post(API_URL, ordenData);
    return response.data;
};

// 3. Actualizar una orden completa (Edición)
export const updateOrden = async (id, ordenData) => {
    const response = await axios.put(`${API_URL}/${id}`, ordenData);
    return response.data;
};

// 4. Actualizar solo el estado de la orden
export const updateEstadoOrden = async (id, nuevoEstado) => {
    const response = await axios.patch(`${API_URL}/${id}/estado`, {
        nuevo_estado: nuevoEstado
    });
    return response.data;
};