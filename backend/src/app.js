const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 1. Importar rutas existentes
const clienteRoutes = require('./routes/clienteRoutes');
const tecnicoRoutes = require('./routes/tecnicoRoutes');
const ordenRoutes = require('./routes/ordenRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const statsRoutes = require('./routes/statsRoutes');

// 2. NUEVA RUTA: Importar ruta de personal de recepción
const recepcionRoutes = require('./routes/recepcionRoutes'); 

const app = express();

// Middlewares
app.use(cors()); // Permite peticiones desde el frontend (React)
app.use(express.json()); // Permite recibir JSON en el cuerpo de las peticiones

// 3. Conectar las rutas
app.use('/api/clientes', clienteRoutes);
app.use('/api/tecnicos', tecnicoRoutes);
app.use('/api/ordenes', ordenRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/stats', statsRoutes);

// 4. NUEVO ENDPOINT: Conectar personal de recepción
app.use('/api/recepcion', recepcionRoutes);

// Ruta de prueba inicial
app.get('/', (req, res) => {
  res.send('Servidor del Taller Técnico funcionando');
});

// IMPORTANTE: Tu servidor corre en el 3000 por defecto según este código
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;