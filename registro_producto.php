<?php
require_once 'db.php';

// Permitir solo POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$codigo = $conn->real_escape_string($data['codigo'] ?? '');
$nombre = $conn->real_escape_string($data['nombre'] ?? '');
$costo = (float)($data['costo'] ?? 0);
$precio = (float)($data['precio'] ?? 0);
$fechaCaducidad = $conn->real_escape_string($data['fechaCaducidad'] ?? null);
$categoria = $conn->real_escape_string($data['categoria'] ?? '');
$imagen = $conn->real_escape_string($data['imagen'] ?? '');

$sql = "INSERT INTO productos (codigo, nombre, costo, precio, fechaCaducidad, categoria, imagen) VALUES ('$codigo', '$nombre', $costo, $precio, '$fechaCaducidad', '$categoria', '$imagen')";
if ($conn->query($sql)) {
    echo json_encode(['success' => true, 'id' => $conn->insert_id]);
} else {
    http_response_code(400);
    echo json_encode(['error' => $conn->error]);
}
$conn->close();
?>
