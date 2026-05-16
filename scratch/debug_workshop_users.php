<?php
require_once 'api/config/database.php';
$app = 'workshop';
$database = new Database($app);
$db = $database->getConnection();

echo "Structure of 'users' in workshop:\n";
$query = "DESCRIBE users";
$stmt = $db->query($query);
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
