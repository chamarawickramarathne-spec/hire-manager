<?php
$_SERVER['SERVER_NAME'] = 'localhost';
require_once __DIR__ . '/../api/config/database.php';
$db = (new Database())->getConnection();
try {
    $db->exec('ALTER TABLE access_levels ADD COLUMN package_price DECIMAL(10,2) DEFAULT 0.00;');
    echo "Added package_price.\n";
} catch (Exception $e) { echo $e->getMessage() . "\n"; }
try {
    $db->exec('ALTER TABLE access_levels ADD COLUMN discount_percentage DECIMAL(5,2) DEFAULT 0.00;');
    echo "Added discount_percentage.\n";
} catch (Exception $e) { echo $e->getMessage() . "\n"; }
?>
