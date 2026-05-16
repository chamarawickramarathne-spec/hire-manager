<?php
require_once '../config/cors.php';
require_once '../config/database.php';

$app = $_GET['app'] ?? $_POST['app'] ?? 'lens_manager';
$database = new Database($app);
$db = $database->getConnection();

$userId = isset($_GET['id']) ? $_GET['id'] : null;

if (!$userId) {
    http_response_code(400);
    echo json_encode(["message" => "User ID is required"]);
    exit;
}

try {
    // 1. Get User and Plan Info
    if ($app === 'workshop') {
        $query = "SELECT u.id, p.display_name as name, u.email, NULL as expire_date, u.created_at, 1 as is_active,
                         pk.name as level_name, pk.max_students_per_workshop as max_clients, pk.max_workshops as max_bookings, pk.max_slip_size_mb as max_storage_gb,
                         (SELECT COUNT(*) FROM join_requests jr JOIN events e ON jr.event_id = e.id WHERE e.user_id = u.id) as current_clients,
                         (SELECT COUNT(*) FROM events WHERE user_id = u.id) as current_bookings,
                         0 as current_storage_bytes
                  FROM users u
                  LEFT JOIN profiles p ON u.id = p.user_id
                  LEFT JOIN packages pk ON u.package_id = pk.id
                  WHERE u.id = :id";
    } else {
        $query = "SELECT u.id, u.full_name as name, u.email, u.expire_date, u.created_at, u.is_active,
                         al.level_name, al.max_clients, al.max_bookings, al.max_storage_gb,
                         (SELECT COUNT(*) FROM clients WHERE user_id = u.id) as current_clients,
                         (SELECT COUNT(*) FROM bookings WHERE user_id = u.id) as current_bookings,
                         (SELECT SUM(gi.file_size) FROM gallery_images gi JOIN galleries g ON gi.gallery_id = g.id WHERE g.user_id = u.id) as current_storage_bytes
                  FROM users u
                  LEFT JOIN access_levels al ON u.access_level_id = al.id
                  WHERE u.id = :id AND u.role = 'photographer'";
    }
    
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
    if ($app === 'workshop') {
        // For workshop, we'll show events joined by the user as "payment history" or nothing if they don't have personal subscriptions
        $query = "SELECT jr.id, e.event_name as plan_name, jr.amount_paid as amount, jr.created_at as payment_date, 'Online' as payment_method, jr.status
                  FROM join_requests jr
                  JOIN events e ON jr.event_id = e.id
                  JOIN users u ON e.user_id = u.id
                  WHERE u.id = :id
                  ORDER BY jr.id DESC";
    } else {
        $query = "SELECT s.*, al.level_name as plan_name 
                  FROM plan_subscriptions s
                  JOIN access_levels al ON s.access_level_id = al.id
                  WHERE s.photographer_id = :id
                  ORDER BY s.id DESC";
    }
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(":id", $userId);
    $stmt->execute();
    $history = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Calculate usage
    $userData['current_storage_gb'] = round(($userData['current_storage_bytes'] ?? 0) / (1024 * 1024 * 1024), 4);

    $is_active = $userData['is_active'];
    $al_name = $userData['level_name'] ?? 'None';
    $expire_date = $userData['expire_date'];

    if ($is_active == 2) {
        $userData['status'] = 'Suspended';
    } elseif ($is_active == 0) {
        $userData['status'] = 'Inactive';
    } elseif (strtolower($al_name) === 'free' || $app === 'workshop') {
        $userData['status'] = 'Active';
    } elseif (!$expire_date) {
        $userData['status'] = 'Active';
    } else {
        $userData['status'] = (strtotime($expire_date) > time()) ? 'Active' : 'Expired';
    }

    echo json_encode([
        "user" => $userData,
        "payment_history" => $history
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Error fetching details", "error" => $e->getMessage()]);
}
?>
