import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // La URL de tu backend
});

export default api;