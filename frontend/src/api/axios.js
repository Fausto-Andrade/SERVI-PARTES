import axios from 'axios';

const api = axios.create({
  // Al usar solo /api, el navegador le pregunta al mismo servidor que le entregó la página
  baseURL: '/api' 
});

export default api;