<?php
require_once 'api/config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    // Create plan_subscriptions table
    $sql = "CREATE TABLE IF NOT EXISTS plan_subscriptions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        photographer_id INT NOT NULL,
        access_level_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_date DATE NOT NULL,
        expiry_date DATE NOT NULL,
        payment_method VARCHAR(50),
        transaction_id VARCHAR(255),
        status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (photographer_id),
        INDEX (access_level_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

    $db->exec($sql);
    echo "Table plan_subscriptions verified/created.\n";

    // Add columns directly (will fail if exists, but we catch it)
    try {
        $db->exec("ALTER TABLE users ADD COLUMN expire_date DATE DEFAULT NULL");
        echo "Column expire_date added.\n";
    } catch (Throwable $e) {
        echo "expire_date error: " . $e->getMessage() . "\n";
    }

    try {
        $db->exec("ALTER TABLE users ADD COLUMN role ENUM('admin', 'photographer', 'client') DEFAULT 'photographer'");
        echo "Column role added.\n";
    } catch (Throwable $e) {
        echo "role error: " . $e->getMessage() . "\n";
    }

} catch(PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
