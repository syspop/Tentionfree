<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET");
header("Access-Control-Allow-Headers: Content-Type");

$file = '../customers.json';
$ordersFile = '../orders.json';

function getCustomers()
{
    global $file;
    if (!file_exists($file))
        return [];
    return json_decode(file_get_contents($file), true) ?: [];
}

function saveCustomers($data)
{
    global $file;
    file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
}

$data = json_decode(file_get_contents("php://input"), true);
$action = isset($_GET['action']) ? $_GET['action'] : (isset($data['action']) ? $data['action'] : '');

if ($action === 'register') {
    $customers = getCustomers();
    $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);

    // Check if exists
    foreach ($customers as $c) {
        if ($c['email'] === $email) {
            echo json_encode(["success" => false, "message" => "Email already registered"]);
            exit;
        }
    }

    $newCustomer = [
        "id" => uniqid('usr_'),
        "name" => htmlspecialchars($data['name']),
        "email" => $email,
        "phone" => htmlspecialchars($data['phone']),
        "password" => password_hash($data['password'], PASSWORD_DEFAULT),
        "joined" => date("Y-m-d H:i:s")
    ];

    $customers[] = $newCustomer;
    saveCustomers($customers);

    // Return user without password
    unset($newCustomer['password']);
    echo json_encode(["success" => true, "user" => $newCustomer]);

} elseif ($action === 'login') {
    $customers = getCustomers();
    $email = $data['email'];
    $password = $data['password'];

    foreach ($customers as $c) {
        if ($c['email'] === $email) {
            if (password_verify($password, $c['password'])) {
                unset($c['password']); // Hide hash
                echo json_encode(["success" => true, "user" => $c]);
                exit;
            } else {
                echo json_encode(["success" => false, "message" => "Invalid Password"]);
                exit;
            }
        }
    }
    echo json_encode(["success" => false, "message" => "User not found"]);

} elseif ($action === 'history') {
    // Fetch orders for a specific email
    // Securely, we should verify a token, but for this file-base system we will trust the client sends the right email for now.
    // Ideally user inputs email, but here we assume the client 'Profile' page requests it.

    // NOTE: In a real production environment, use Session/JWT. 
    // Here we are building a simple MVP as requested.

    $email = isset($_GET['email']) ? $_GET['email'] : '';
    if (!$email) {
        echo json_encode([]);
        exit;
    }

    if (!file_exists($ordersFile)) {
        echo json_encode([]);
        exit;
    }

    $orders = json_decode(file_get_contents($ordersFile), true) ?: [];

    // Filter by customer email or exact name match if cleaner
    // Assuming 'customer' field in orders might differ, but let's assume we capture email in future orders.
    // For now, filtering by 'customer' name might be the only link if email wasn't saved in orders.json.
    // Wait, the order structure has 'contact' which is usually phone/email/whatsapp.

    // Let's filter by checking if the order's contact info contains the email
    $myOrders = [];
    foreach ($orders as $o) {
        // Try to verify ownership
        // In orders.json, we have 'customer' (Name) and maybe other fields in 'details'? 
        // The current script config saves: id, date, customer, price, status, items...
        // Does it save email? 
        // script.js `submitOrder`: `customer: name`, `contact: contact`

        // We will try to match the contact field
        // Check for 'email' field or 'contact' field
        if (
            (isset($o['email']) && $o['email'] === $email) ||
            (isset($o['contact']) && strpos($o['contact'], $email) !== false)
        ) {
            $myOrders[] = $o;
        }
        // Fallback: Check by Name if provided
        else if (isset($_GET['name']) && isset($o['customer']) && strtolower($o['customer']) === strtolower($_GET['name'])) {
            $myOrders[] = $o;
        }
    }

    echo json_encode($myOrders);
} elseif ($action === 'all_users') {
    $customers = getCustomers();
    // Return all users safely
    $safe_users = [];
    foreach ($customers as $c) {
        unset($c['password']); // key security
        $safe_users[] = $c;
    }
    echo json_encode($safe_users);
}
?>