const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Rutas principales
router.post('/registro', userController.registrar);
router.get('/', userController.listar);

// Rutas con parámetros
router.put('/reset-password/:id', userController.actualizarPassword);
router.delete('/:id', userController.eliminar);

module.exports = router;