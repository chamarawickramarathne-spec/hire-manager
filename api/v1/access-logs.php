<?php
require_once '../config/cors.php';
require_once '../config/database.php';

$app = $_GET['app'] ?? $_POST['app'] ?? 'calculator';
$database = new Database($app);
$db = $database->getConnection();

if (!$db) {
    http_response_code(500);
    echo json_encode(["message" => "Database connection failed"]);
    exit;
}

try {
    $query = "SELECT * FROM access_logs ORDER BY accessed_at DESC LIMIT 100";
    $stmt = $db->query($query);
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($logs);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Error fetching access logs", "error" => $e->getMessage()]);
}
?>