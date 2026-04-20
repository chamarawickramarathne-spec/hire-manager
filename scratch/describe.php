<?php
$_SERVER['SERVER_NAME'] = 'localhost';
require_once __DIR__ . '/../api/config/database.php';
$db = (new Database())->getConnection();
$stmt = $db->query("DESCRIBE users");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
