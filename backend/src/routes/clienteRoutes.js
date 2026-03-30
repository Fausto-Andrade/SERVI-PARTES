const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

// Definición de rutas
// POST: http://localhost:3000/api/clientes/
router.post('/', clienteController.crearCliente);

// GET: http://localhost:3000/api/clientes/
router.get('/', clienteController.listarClientes);

// GET: http://localhost:3000/api/clientes/buscar?q=termino
router.get('/buscar', clienteController.buscarClientes);

router.put('/:id', clienteController.update);

module.exports = router;