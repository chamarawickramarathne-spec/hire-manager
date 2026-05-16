<?php
require_once 'api/config/database.php';

$app = 'workshop';
echo "Checking connection for app: $app\n";

$database = new Database($app);
$db = $database->getConnection();

if (!$db) {
    echo "FAILED: Could not connect to database.\n";
    exit;
}

echo "SUCCESS: Connected to database.\n";

try {
    $query = "SHOW TABLES LIKE 'access_levels'";
    $stmt = $db->query($query);
    if ($stmt->rowCount() > 0) {
        echo "SUCCESS: Table 'access_levels' exists.\n";
        
        $query = "DESCRIBE access_levels";
        $stmt = $db->query($query);
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "Table structure:\n";
        print_r($columns);
    } else {
        echo "FAILED: Table 'access_levels' does not exist.\n";
        
        echo "Listing available tables:\n";
        $query = "SHOW TABLES";
        $stmt = $db->query($query);
        print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
?>
