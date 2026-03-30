import axios from 'axios';

const API_URL = 'http://localhost:3000/api/tecnicos';

export const getTecnicos = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const createTecnico = async (tecnicoData) => {
  const response = await axios.post(API_URL, tecnicoData);
  return response.data;
};

/**
 * Realiza un bloqueo lógico del técnico.
 * El backend ahora responderá con éxito incluso si el técnico tiene órdenes,
 * ya que solo cambiará su estado a 'activo = false'.
 */
export const deleteTecnico = async (id) => {
    try {
        // Mantenemos el método DELETE si así configuraste tu ruta en Express,
        // o puedes cambiarlo a PATCH si prefieres ser más semántico.
        const response = await axios.delete(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        // Extraemos el mensaje detallado que enviamos desde el controlador
        const mensaje = error.response?.data?.mensaje || 'Error al procesar la baja del técnico';
        throw new Error(mensaje);
    }
};