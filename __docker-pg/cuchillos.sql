-- Conectar a la base de datos 'cuchillos'
\c cuchillos;

-- Crear la tabla 'productos'
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    medidas VARCHAR(100),
    material VARCHAR(100),
    cabo VARCHAR(100),
    precio NUMERIC(10, 2),
    imagen VARCHAR(255)
);
-- Tabla de usuarios para autenticación (TP4)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO productos (nombre, medidas, material, cabo, precio, imagen) VALUES
('Cuchillo número 39', '16cm de hoja, 32cm en total', 'Acero Inoxidable', 'Guayubira', 160000.00, 'Cuchillo N39.jpeg'),
('Cuchillo número 41', '15cm de hoja, 28cm en total', 'Acero Inoxidable', 'Caranda', 130000.00, 'Cuchillo N41.jpeg'),
('Cuchillo número 42', '12cm de hoja, 26cm en total', 'Acero Inoxidable', 'Paraiso', 120000.00, 'Cuchillo N42.jpeg'),
('Cuchillo número 43', '14cm de hoja, 28cm en total', 'Acero Inoxidable', 'Guayacan', 130000.00, 'Cuchillo N43.jpeg'),
('Cuchillo número 44', '18cm de hoja, 35cm en total', 'Acero Inoxidable', 'Quebracho', 200000.00, 'Cuchillo N44.jpeg');



-- Tabla galeria (fotos de cuchillos ya hechos)
CREATE TABLE galeria (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    imagen VARCHAR(255)
);

INSERT INTO galeria (nombre, imagen) VALUES
('Cuchillo número 39', 'Cuchillo N39.jpeg'),
('Cuchillo número 42', 'Cuchillo N42.jpeg'),
('Cuchillo número 44', 'Cuchillo N44.jpeg');

-- Fotos adicionales (más de una imagen por producto o por foto de galería).
-- 'imagen' en productos/galeria sigue siendo la portada; esta tabla guarda el resto.
CREATE TABLE imagenes (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('producto', 'galeria')),
    item_id INTEGER NOT NULL,
    archivo VARCHAR(255) NOT NULL,
    orden INTEGER NOT NULL DEFAULT 0,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_imagenes_item ON imagenes (tipo, item_id);