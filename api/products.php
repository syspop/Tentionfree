<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Content-Type: application/json");

$file = __DIR__ . '/../products.json'; // Store in root or specific data folder

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($file)) {
        clearstatcache();
        $content = file_get_contents($file);
        if ($content === false || empty(trim($content))) {
            echo "[]";
        } else {
            echo $content;
        }
    } else {
        echo "[]"; // Return empty array if no file
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = file_get_contents("php://input");
    if ($data) {
        $decoded = json_decode($data);
        if ($decoded === null) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Invalid JSON provided"]);
            exit;
        }

        if (file_put_contents($file, json_encode($decoded, JSON_PRETTY_PRINT))) {
            echo json_encode(["success" => true, "message" => "Products saved"]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Failed to save products. Check permissions."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "No data provided"]);
    }
}