<?php
require_once 'db.php';

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        // Obtener todos los productos
        $result = $conn->query('SELECT * FROM productos');
        $productos = [];
        while ($row = $result->fetch_assoc()) {
            $productos[] = $row;
        }
        echo json_encode($productos);
        break;
    case 'POST':
        // Crear producto
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
        break;
    case 'PUT':
        // Actualizar producto
        $data = json_decode(file_get_contents('php://input'), true);
        $id = (int)($data['id'] ?? 0);
        $codigo = $conn->real_escape_string($data['codigo'] ?? '');
        $nombre = $conn->real_escape_string($data['nombre'] ?? '');
        $costo = (float)($data['costo'] ?? 0);
        $precio = (float)($data['precio'] ?? 0);
        $fechaCaducidad = $conn->real_escape_string($data['fechaCaducidad'] ?? null);
        $categoria = $conn->real_escape_string($data['categoria'] ?? '');
        $imagen = $conn->real_escape_string($data['imagen'] ?? '');
        $sql = "UPDATE productos SET codigo='$codigo', nombre='$nombre', costo=$costo, precio=$precio, fechaCaducidad='$fechaCaducidad', categoria='$categoria', imagen='$imagen' WHERE id=$id";
        if ($conn->query($sql)) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(400);
            echo json_encode(['error' => $conn->error]);
        }
        break;
    case 'DELETE':
        // Eliminar producto o todo el inventario
        $data = json_decode(file_get_contents('php://input'), true);
        if (isset($data['all']) && $data['all'] === true) {
            $sql = "DELETE FROM productos";
            if ($conn->query($sql)) {
                echo json_encode(['success' => true, 'all_deleted' => true]);
            } else {
                http_response_code(400);
                echo json_encode(['error' => $conn->error]);
            }
        } else {
            $id = (int)($data['id'] ?? 0);
            $sql = "DELETE FROM productos WHERE id=$id";
            if ($conn->query($sql)) {
                echo json_encode(['success' => true]);
            } else {
                http_response_code(400);
                echo json_encode(['error' => $conn->error]);
            }
        }
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Método no permitido']);
}
$conn->close();
?>
