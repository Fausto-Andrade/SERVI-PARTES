const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 1. Importar rutas existentes
const clienteRoutes = require('./routes/clienteRoutes');
const tecnicoRoutes = require('./routes/tecnicoRoutes');
const ordenRoutes = require('./routes/ordenRoutes');
const authRoutes = require('./routes/authRoutes'); // <--- AQUÍ ESTÁ TU LOGIN
const userRoutes = require('./routes/userRoutes');
const statsRoutes = require('./routes/statsRoutes');
const recepcionRoutes = require('./routes/recepcionRoutes'); 

const app = express();

// Middlewares
// Permitimos el acceso desde cualquier origen para evitar errores de CORS en producción
app.use(cors()); 
app.use(express.json()); 

// 3. Conectar las rutas
app.use('/api/clientes', clienteRoutes);
app.use('/api/tecnicos', tecnicoRoutes);
app.use('/api/ordenes', ordenRoutes);
app.use('/api/auth', authRoutes); // Login y autenticación
app.use('/api/usuarios', userRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/recepcion', recepcionRoutes);

// Ruta de prueba inicial (útil para verificar si el backend responde)
app.get('/', (req, res) => {
  res.send('Servidor del Taller Técnico funcionando correctamente');
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        // En el servidor, se sigue escuchando internamente en el 3000
        console.log(`Servidor escuchando en el puerto ${PORT}`);
    });
}

module.exports = app;