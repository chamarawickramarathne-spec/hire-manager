<?php
require_once 'api/config/database.php';
$app = 'workshop';
$database = new Database($app);
$db = $database->getConnection();

echo "Structure of 'packages':\n";
$query = "DESCRIBE packages";
$stmt = $db->query($query);
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

echo "\nStructure of 'profiles':\n";
$query = "DESCRIBE profiles";
$stmt = $db->query($query);
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

echo "\nStructure of 'join_requests':\n";
$query = "DESCRIBE join_requests";
$stmt = $db->query($query);
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
