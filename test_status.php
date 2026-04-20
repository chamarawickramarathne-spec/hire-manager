<?php
require_once 'api/config/database.php';
require_once 'api/models/Photographer.php';

$database = new Database();
$db = $database->getConnection();
$photographer = new Photographer($db);

// Try updating user 1 to Inactive
$result = $photographer->updatePlan(1, 1, '2026-12-31', 'Inactive');
var_dump($result);

$stmt = $db->query("SELECT is_active FROM users WHERE id = 1");
print_r($stmt->fetch(PDO::FETCH_ASSOC));
?>
