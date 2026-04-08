import axios from 'axios';

const api = axios.create({
  // baseURL: 'http://localhost:3000/api'
  baseURL: 'http://138.36.237.111:3000/api'
});

export default api;