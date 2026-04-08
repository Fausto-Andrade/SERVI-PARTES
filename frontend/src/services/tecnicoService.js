// 1. Importamos tu instancia configurada
import api from '../api/axios'; 

// 2. Definimos la ruta relativa (la base '/api' ya viene en la instancia)
const API_URL = '/tecnicos';
// const API_URL = 'http://localhost:3000/api/tecnicos';

export const getTecnicos = async () => {
  // Usamos 'api' en lugar de 'axios'
  const response = await api.get(API_URL);
  return response.data;
};

export const createTecnico = async (tecnicoData) => {
  const response = await api.post(API_URL, tecnicoData);
  return response.data;
};

export const deleteTecnico = async (id) => {
  try {
    // La URL final será /api/tecnicos/:id
    const response = await api.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    const mensaje = error.response?.data?.mensaje || 'Error al procesar la baja del técnico';
    throw new Error(mensaje);
  }
};