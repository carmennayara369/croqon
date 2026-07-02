<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$action = isset($_GET['action']) ? $_GET['action'] : '';
$store_dir = __DIR__ . '/data_store';

// Create data store folder if it doesn't exist
if (!file_exists($store_dir)) {
    mkdir($store_dir, 0755, true);
    // Write htaccess to deny direct URL access to raw data files
    file_put_contents($store_dir . '/.htaccess', "Deny from all\n");
}

$orders_file = $store_dir . '/orders.json';
$products_file = $store_dir . '/products.json';
$clients_file = $store_dir . '/clients.json';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

switch ($action) {
    case 'get_orders':
        if (file_exists($orders_file)) {
            echo file_get_contents($orders_file);
        } else {
            echo json_encode([]);
        }
        break;
        
    case 'save_orders':
        $data = file_get_contents('php://input');
        if (json_decode($data) !== null) {
            file_put_contents($orders_file, $data);
            echo json_encode(['status' => 'success']);
        } else {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Invalid JSON']);
        }
        break;

    case 'get_products':
        if (file_exists($products_file)) {
            echo file_get_contents($products_file);
        } else {
            echo json_encode(null);
        }
        break;
        
    case 'save_products':
        $data = file_get_contents('php://input');
        if (json_decode($data) !== null) {
            file_put_contents($products_file, $data);
            echo json_encode(['status' => 'success']);
        } else {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Invalid JSON']);
        }
        break;

    case 'get_clients':
        if (file_exists($clients_file)) {
            echo file_get_contents($clients_file);
        } else {
            echo json_encode(null);
        }
        break;
        
    case 'save_clients':
        $data = file_get_contents('php://input');
        if (json_decode($data) !== null) {
            file_put_contents($clients_file, $data);
            echo json_encode(['status' => 'success']);
        } else {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Invalid JSON']);
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Action not found']);
        break;
}
