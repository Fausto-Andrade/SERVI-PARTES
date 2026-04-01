const request = require('supertest');
const app = require('../src/app'); 
const dbModule = require('../src/config/DB.JS');

// Manejamos la exportación del pool (por si es exportación directa o un objeto)
const pool = dbModule.pool || dbModule; 

/**
 * CONFIGURACIÓN DE PRUEBAS
 */

// Verificación de depuración en consola
console.log('--- Depuración de App ---');
console.log('¿App es una función?:', typeof app === 'function');
console.log('¿App tiene address?:', typeof app.address === 'function');
console.log('-------------------------');

afterAll(async () => {
    // Cerramos la conexión de forma segura para que Jest pueda finalizar
    if (pool && typeof pool.end === 'function') {
        await pool.end();
    }
});

afterEach(async () => {
    try {
        // Limpiamos registros de prueba si existen
        await pool.query("DELETE FROM ordenes WHERE codigo_equipo = 'TEST-999'");
    } catch (err) {
        // Si la tabla no existe o falla, el test continúa
    }
});

test('Debe rechazar la actualización si el abono es mayor al total', async () => {
    // 1. Buscamos un ID real para la prueba
    const ordenQuery = await pool.query('SELECT id_orden_servicio FROM ordenes_servicio LIMIT 1');
    const idReal = ordenQuery.rows[0].id_orden_servicio;

    const res = await request(app)
        .put(`/api/ordenes/${idReal}`)
        .send({
            cliente_id: 8,      // Datos dummy pero con estructura correcta
            tecnico_id: 6,
            recibido_por: 'Test',
            tipo_articulo: 'Equipo',
            placa: 'TEST000',
            codigo_equipo: 'EQ-000',
            categoria_servicio: 'Reparacion',
            tipo_especifico: 'General',
            mano_obra: 100000,
            total: 100000,      // Total: 100k
            requiere_factura: false,
            factura_emitida: false,
            estado_pago: 'Parcial',
            abono_inicial: 150000, // Abono: 150k (ERROR)
            estado: 'Pendiente'
        });

    expect(res.statusCode).toBe(400); 
    expect(res.body.error).toMatch(/excede el total/);
});