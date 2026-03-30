const app = require('./src/app');
const express = require('express');
const cors = require('cors');
const userRoutes = require('./src/routes/userRoutes'); // Asegúrate de que la ruta sea correcta

const port = process.env.PORT || 3000;

// --- Middlewares Globales ---
// Permite peticiones desde otros dominios (como tu frontend de React)
app.use(cors()); 

// Permite que el servidor entienda archivos JSON en el cuerpo de las peticiones
app.use(express.json()); 

// --- Definición de Rutas ---
// Montamos las rutas de usuario bajo el prefijo /api/users
app.use('/api/users', userRoutes);

// --- Manejo de Errores Básico ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ mensaje: 'Algo salió mal en el servidor' });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
  console.log(`Rutas de usuarios listas en http://localhost:${port}/api/users`);
});