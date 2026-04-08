import axios from 'axios';

// const API_URL = 'http://localhost:3000/api/recepcion';
const API_URL = 'http://138.36.237.111:3000/api/recepcion';

export const getPersonalRecepcion = async () => {
    try {
        // CAMBIO CRUCIAL: Quitamos '/empleados' porque el router ya está en '/'
        const response = await axios.get(API_URL); 
        return response.data; 
    } catch (error) {
        console.error("Error al obtener empleados:", error);
        throw error;
    }
};

export const createAsesor = async (datos) => {
    const response = await axios.post(API_URL, datos);
    return response.data;
};

// Agrega esto al final de tu recepcionService.js
export const deleteAsesor = async (id) => {
    try {
        // const response = await fetch(`http://localhost:3000/api/recepcion/${id}`, {
        const response = await fetch(`http://138.36.237.111:3000/api/recepcion/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Error al eliminar');
        return await response.json();
    } catch (error) {
        console.error("Error en service deleteAsesor:", error);
        throw error;
    }
};