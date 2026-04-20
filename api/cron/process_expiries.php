<?php
// api/cron/process_expiries.php

// දත්ත සමුදාය සම්බන්ධ කිරීම
require_once __DIR__ . '/../config/database.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    die("Database connection failed.");
}

try {
    // 1. "Free" ප්ලෑන් එකේ ID එක ලබා ගැනීම
    $query = "SELECT id FROM access_levels WHERE level_name = 'Free' LIMIT 1";
    $stmt = $db->query($query);
    $free_plan = $stmt->fetch(PDO::FETCH_ASSOC);
    $free_id = $free_plan ? $free_plan['id'] : 1; // Default to 1 if not found

    // 2. කාලය ඉකුත් වූ (Expired) ප්ලෑන් යාවත්කාලීන කිරීම
    // expire_date අද දිනට වඩා අඩු නම් සහ දැනටමත් Free නොවේ නම් පමණක් වෙනස් කරයි
    $query = "UPDATE users 
              SET access_level_id = :free_id 
              WHERE role = 'photographer' 
              AND access_level_id != :free_id
              AND expire_date IS NOT NULL 
              AND expire_date < NOW()";

    $stmt = $db->prepare($query);
    $stmt->bindParam(":free_id", $free_id);
    $stmt->execute();

    $updated_count = $stmt->rowCount();

    // ලොග් එකක් ලෙස ප්‍රතිඵලය පෙන්වීම
    echo "[" . date('Y-m-d H:i:s') . "] Processed. $updated_count photographers moved to Free plan.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>