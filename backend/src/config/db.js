const { Pool } = require('pg');
require('dotenv').config();

// Configuración del pool de conexiones usando las variables del .env
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Verificación de conexión exitosa
pool.on('connect', () => {
  console.log('Conexión establecida con la base de datos PostgreSQL');
});

// Manejo de errores en el pool
pool.on('error', (err) => {
  console.error('Error inesperado en el pool de conexiones', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
