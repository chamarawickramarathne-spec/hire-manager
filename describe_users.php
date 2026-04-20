<?php
require_once 'api/config/database.php';
$database = new Database();
$db = $database->getConnection();
$stmt = $db->query('DESCRIBE users');
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_PRETTY_PRINT);
?>
