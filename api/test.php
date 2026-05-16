<?php
require_once 'config/database.php';

try {
    $db = (new Database('workshop'))->getConnection();
    $stmt = $db->query("DESCRIBE users");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($columns);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
