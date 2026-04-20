<?php
require_once 'api/config/database.php';
$database = new Database();
$db = $database->getConnection();
$stmt = $db->query("DESCRIBE users");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
