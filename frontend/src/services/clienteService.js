import axios from 'axios';

// const API_URL = 'http://localhost:3000/api/clientes';
const API_URL = 'http://138.36.237.111:3000/api/clientes';

export const getClientes = async () => {
    const res = await axios.get(API_URL);
    return res.data;
};

export const createCliente = async (cliente) => {
    const res = await axios.post(API_URL, cliente);
    return res.data;
};

export const updateCliente = async (id, clienteData) => {
    // Asegúrate de usar backticks (``) para la plantilla de cadena
    // const response = await fetch(`http://localhost:3000/api/clientes/${id}`, {
    const response = await fetch(`http://138.36.237.111:3000/api/clientes/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(clienteData),
    });

    if (!response.ok) {
        throw new Error('Error al actualizar el cliente');
    }
    return await response.json();
};

// ESTA ES LA FUNCIÓN QUE TE FALTA:
export const deleteCliente = async (id) => {
    const res = await axios.delete(`${API_URL}/${id}`);
    return res.data;
};