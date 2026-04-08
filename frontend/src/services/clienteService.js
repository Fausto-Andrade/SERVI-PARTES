// 1. Importamos tu instancia configurada
import api from '../api/axios'; 

// 2. Ruta relativa (la base '/api' ya viene en la instancia api)
const API_URL = '/clientes';

export const getClientes = async () => {
    // La petición final será /api/clientes
    const res = await api.get(API_URL);
    return res.data;
};

export const createCliente = async (cliente) => {
    const res = await api.post(API_URL, cliente);
    return res.data;
};

export const updateCliente = async (id, clienteData) => {
    try {
        // CAMBIO PRO: Sustituimos 'fetch' con IP por nuestra instancia 'api'
        // Esto es mucho más limpio y maneja los headers automáticamente
        const res = await api.put(`${API_URL}/${id}`, clienteData);
        return res.data;
    } catch (error) {
        console.error("Error al actualizar el cliente:", error);
        const mensaje = error.response?.data?.mensaje || 'Error al actualizar el cliente';
        throw new Error(mensaje);
    }
};

export const deleteCliente = async (id) => {
    try {
        const res = await api.delete(`${API_URL}/${id}`);
        return res.data;
    } catch (error) {
        console.error("Error al eliminar cliente:", error);
        const mensaje = error.response?.data?.mensaje || 'Error al eliminar cliente';
        throw new Error(mensaje);
    }
};