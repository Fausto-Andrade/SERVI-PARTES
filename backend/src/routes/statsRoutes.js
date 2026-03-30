const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

// Definir la ruta para obtener las estadísticas
router.get('/', statsController.getStats);

module.exports = router;