<?php
require 'api/config/database.php';
foreach (['lens_manager', 'workshop', 'calculator'] as $app) {
    echo "App: $app\n";
    $db = (new Database($app))->getConnection();
    if ($db) {
        $stmt = $db->query("SHOW TABLES");
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        echo implode(", ", $tables) . "\n";
    }
}
