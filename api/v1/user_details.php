<?php
require_once '../config/cors.php';
require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$userId = isset($_GET['id']) ? $_GET['id'] : null;

if (!$userId) {
    http_response_code(400);
    echo json_encode(["message" => "User ID is required"]);
    exit;
}

try {
    // 1. Get User and Plan Info
    $query = "SELECT u.id, u.full_name as name, u.email, u.expire_date, u.created_at, u.is_active,
                     al.level_name, al.max_clients, al.max_bookings, al.max_storage_gb,
                     (SELECT COUNT(*) FROM clients WHERE user_id = u.id) as current_clients,
                     (SELECT COUNT(*) FROM bookings WHERE user_id = u.id) as current_bookings,
                     (SELECT SUM(gi.file_size) FROM gallery_images gi JOIN galleries g ON gi.gallery_id = g.id WHERE g.user_id = u.id) as current_storage_bytes
              FROM users u
              LEFT JOIN access_levels al ON u.access_level_id = al.id
              WHERE u.id = :id AND u.role = 'photographer'";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(":id", $userId);
    $stmt->execute();
    $userData = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$userData) {
        http_response_code(404);
        echo json_encode(["message" => "Photographer not found"]);
        exit;
    }

    // 2. Get Payment History
    $query = "SELECT s.*, al.level_name as plan_name 
              FROM plan_subscriptions s
              JOIN access_levels al ON s.access_level_id = al.id
              WHERE s.photographer_id = :id
              ORDER BY s.id DESC";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(":id", $userId);
    $stmt->execute();
    $history = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Calculate usage
    $userData['current_storage_gb'] = round(($userData['current_storage_bytes'] ?? 0) / (1024 * 1024 * 1024), 4);

    echo json_encode([
        "user" => $userData,
        "payment_history" => $history
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Error fetching details", "error" => $e->getMessage()]);
}
?>
