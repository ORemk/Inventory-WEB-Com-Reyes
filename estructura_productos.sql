-- Script para crear la tabla productos con todos los campos requeridos
CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(50),
  nombre VARCHAR(120) NOT NULL,
  costo DECIMAL(10,2) DEFAULT 0,
  precio DECIMAL(10,2) DEFAULT 0,
  fechaCaducidad DATE,
  categoria VARCHAR(100),
  imagen VARCHAR(255),
  creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
