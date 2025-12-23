<?php
header('Content-Type: application/json');

// Allow CORS if needed, or keeping it strict for same-origin
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

$data = json_decode(file_get_contents("php://input"), true);
$inputUser = isset($data['user']) ? $data['user'] : '';
$inputPassword = isset($data['pass']) ? $data['pass'] : '';

// SECRET CREDENTIALS (HIDDEN ON SERVER)
$params = [
    "admin_user" => "sala-bc",
    "server_secret" => "website-er-mairebap"
];

if ($inputUser === $params['admin_user'] && $inputPassword === $params['server_secret']) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false]);
}
?>