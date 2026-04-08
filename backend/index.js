const app = require('./src/app');
const express = require('express');
const cors = require('cors');
const userRoutes = require('./src/routes/userRoutes'); 

const port = process.env.PORT || 3000;

// --- Middlewares Globales ---
// En producción, es mejor ser específicos, pero para solucionar el error actual, 
// cors() abierto está bien.
app.use(cors()); 
app.use(express.json()); 

// --- Definición de Rutas ---
app.use('/api/users', userRoutes);

// --- Manejo de Errores Básico ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ mensaje: 'Algo salió mal en el servidor' });
});

// Cambiamos el log para que sea más informativo en la nube
app.listen(port, '0.0.0.0', () => {
  console.log(`--------------------------------------------------`);
  console.log(` Servidor Backend Activo`);
  console.log(` Puerto: ${port}`);
  console.log(` URL Interna: http://localhost:${port}`);
  console.log(`--------------------------------------------------`);
});