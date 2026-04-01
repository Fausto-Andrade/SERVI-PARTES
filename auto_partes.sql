CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    contacto VARCHAR(50),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tecnicos (
    id_tecnicos SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    especialidad VARCHAR(100)
);

-- 3. Tabla Principal: Órdenes de Servicio
CREATE TABLE ordenes_servicio (
    id_orden_servicio SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
    fecha_ingreso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    recibido_por VARCHAR(100) NOT NULL,
    tipo_articulo VARCHAR(50) NOT NULL, -- Ej: 'Vehículo', 'Taladro'
    placa VARCHAR(20), -- Opcional
    
    -- Detalles del servicio
    categoria_servicio VARCHAR(100), -- Ej: 'Sistemas Eléctricos'
    tipo_especifico VARCHAR(100),    -- Ej: 'Alternador'
    
    -- Estado del servicio
    estado VARCHAR(50) DEFAULT 'Pendiente confirmación', 
    -- Se recomienda usar un CHECK o un ENUM: 
    -- 'En proceso', 'Terminado y entregado', 'Terminado sin entregar', 'Autorizado', etc.
    
    -- Costos y Facturación
    mano_obra DECIMAL(12, 2) DEFAULT 0.00,
    requiere_factura BOOLEAN DEFAULT FALSE,
    factura_emitida BOOLEAN DEFAULT FALSE,
    estado_pago VARCHAR(30) DEFAULT 'Pendiente' -- 'Cancelado', 'Pendiente', 'Abono parcial'
);

CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Aquí guardaremos el hash, no el texto plano
    rol VARCHAR(20) DEFAULT 'empleado' -- 'admin' o 'empleado'
);


CREATE TABLE personal_recepcion (
    id_recepcion SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    cargo VARCHAR(50),
    activo BOOLEAN DEFAULT TRUE
);

-- Opcional: Una tabla para el historial de movimientos (trazabilidad)
CREATE TABLE historial_estados (
    id_historial SERIAL PRIMARY KEY,
    id_orden INT REFERENCES ordenes_servicio(id_orden_servicio),
    estado_anterior VARCHAR(20),
    estado_nuevo VARCHAR(20),
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notas TEXT
);

ALTER TABLE ordenes_servicio 
ADD COLUMN tecnico_id INTEGER REFERENCES tecnicos(id_tecnicos);

ALTER TABLE ordenes_servicio 
ADD COLUMN codigo_equipo VARCHAR(50);

INSERT INTO personal_recepcion (nombre, cargo) VALUES 
('Ana', 'asesora'),
('Gloria.', 'asesora'),
('Andrés', 'asesora');

CREATE TABLE pagos (
    id_pagos SERIAL PRIMARY KEY,
    orden_id INTEGER REFERENCES ordenes_servicio(id_orden_servicio) ON DELETE CASCADE,
    monto DECIMAL(12, 2) NOT NULL,
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tu tabla de pagos está bien, pero le agregamos 'metodo_pago' para mayor control
ALTER TABLE ordenes_servicio 
ADD COLUMN abono_inicial DECIMAL(12,2) DEFAULT 0;


-- Insertemos un usuario de prueba (contraseña: admin123)
-- Nota: En producción, nunca insertaríamos el password así, pero para la prueba inicial:
INSERT INTO usuarios (username, password, rol) 
VALUES ('admin', 'admin123', 'admin');

INSERT INTO usuarios (username, password, rol) 
VALUES ('ana', '123456', 'empleado');

ALTER TABLE ordenes_servicio 
ADD COLUMN total DECIMAL(12, 2) DEFAULT 0;

select * FROM usuarios;
select * FROM clientes;
select * FROM tecnicos;
select * FROM ordenes_servicio;
select * FROM personal_recepcion;
select * FROM pagos;

delete FROM ordenes_servicio;
delete FROM personal_recepcion;

delete FROM clientes
WHERE id = 3;

select * FROM tecnicos;
select * FROM ordenes_servicio;
select * FROM usuarios;

delete FROM usuarios
WHERE id_usuario = 8;


SELECT 
    u.id_usuario, 
    u.username, 
    u.rol,
    COUNT(o.id_orden_servicio) AS ordenes_activas
FROM usuarios u
LEFT JOIN ordenes_servicio o ON u.id_usuario = o.tecnico_id AND o.estado != 'Completado'
GROUP BY u.id_usuario;

-- Reemplaza el 10 por el ID de 'pepita roa'
SELECT id_orden_servicio, tecnico_id, estado 
FROM ordenes_servicio 
WHERE tecnico_id = 10;

SELECT 
    o.id_orden_servicio, 
    o.tecnico_id, 
    u.username, 
    o.estado
FROM ordenes_servicio o
LEFT JOIN usuarios u ON o.tecnico_id = u.id_usuario;

TRUNCATE TABLE ordenes_servicio RESTART IDENTITY CASCADE;
TRUNCATE TABLE usuarios RESTART IDENTITY CASCADE;
TRUNCATE TABLE tecnicos RESTART IDENTITY CASCADE;

ALTER TABLE ordenes_servicio 
ADD COLUMN id_usuario INTEGER REFERENCES usuarios(id_usuario);

ALTER TABLE ordenes_servicio ALTER COLUMN id_usuario DROP NOT NULL;

ALTER TABLE tecnicos ADD COLUMN activo BOOLEAN DEFAULT TRUE;

ALTER TABLE ordenes_servicio
ALTER COLUMN mano_obra TYPE DECIMAL(12,0);

SELECT * FROM ordenes_servicio WHERE id_usuario = 1;

ALTER TABLE usuarios ADD COLUMN activo BOOLEAN DEFAULT TRUE;