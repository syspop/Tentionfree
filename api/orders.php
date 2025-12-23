<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Content-Type: application/json");

$file = __DIR__ . '/../orders.json';

// Ensure file exists and is writable
if (!file_exists($file)) {
    if (file_put_contents($file, '[]') === false) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to create database file. Check permissions."]);
        exit;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($file)) {
        // Clear cache if needed
        clearstatcache(); 
        $content = file_get_contents($file);
        if ($content === false || empty(trim($content))) {
             echo "[]"; 
        } else {
             echo $content;
        }
    } else {
        echo "[]";
    }
    exit;
}

// Handle POST (New Order) and PUT (Update/Delete list)
if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = file_get_contents("php://input");
    
    // Read current data
    $currentJson = file_exists($file) ? file_get_contents($file) : '[]';
    $currentData = json_decode($currentJson, true);
    
    if (!is_array($currentData)) {
        $currentData = [];
    }

    $newData = json_decode($input, true);

    if ($newData === null) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid JSON input"]);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Append new order
        if (isset($newData['id'])) {
            $currentData[] = $newData;
            if (file_put_contents($file, json_encode($currentData, JSON_PRETTY_PRINT))) {
                echo json_encode(["success" => true, "message" => "Order added"]);
            } else {
                http_response_code(500);
                echo json_encode(["success" => false, "message" => "Failed to write to file. Check permissions."]);
            }
        } else {
            // If raw list sent via POST (legacy/bulk support)
            if (is_array($newData)) {
                if (file_put_contents($file, json_encode($newData, JSON_PRETTY_PRINT))) {
                    echo json_encode(["success" => true, "message" => "Orders updated"]);
                } else {
                    http_response_code(500);
                    echo json_encode(["success" => false, "message" => "Failed to write to file"]);
                }
            } else {
                 http_response_code(400);
                 echo json_encode(["success" => false, "message" => "Invalid data format"]);
            }
        }
    }

    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        // Full list overwrite replacement (used for update status/delete)
        if (is_array($newData)) {
            if (file_put_contents($file, json_encode($newData, JSON_PRETTY_PRINT))) {
                echo json_encode(["success" => true, "message" => "Orders list updated"]);
            } else {
                http_response_code(500);
                echo json_encode(["success" => false, "message" => "Failed to update file"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Invalid data format for PUT"]);
        }
    }
}
