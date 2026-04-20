<?php
require_once 'api/config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    // 1. Insert test photographers if they don't exist
    $test_users = [
        ['Kasun Kalhara', 'kasun@example.com', 3, '2026-12-31'],
        ['Malith Perera', 'malith@example.com', 1, null],
        ['Nuwan Thilaka', 'nuwan@example.com', 2, '2026-03-20'],
        ['Dasun Shanaka', 'dasun@example.com', 3, '2026-08-15'],
        ['Chaminda Vass', 'vass@example.com', 1, null]
    ];

    foreach ($test_users as $user) {
        $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$user[1]]);
        if (!$stmt->fetch()) {
            $stmt = $db->prepare("INSERT INTO users (full_name, email, password_hash, role, access_level_id, expire_date, created_at) VALUES (?, ?, ?, 'photographer', ?, ?, NOW())");
            $stmt->execute([$user[0], $user[1], password_hash('password123', PASSWORD_DEFAULT), $user[2], $user[3]]);
            echo "Inserted user: {$user[0]}\n";
            
            $user_id = $db->lastInsertId();
            
            // Add some test storage usage (gallery images)
            // (Assuming tables exist from previous conversations)
            try {
                $db->exec("INSERT INTO galleries (user_id, name) VALUES ($user_id, 'Portfolio')");
                $gallery_id = $db->lastInsertId();
                $db->exec("INSERT INTO gallery_images (gallery_id, file_name, file_size) VALUES ($gallery_id, 'test.jpg', " . rand(1000000, 5000000) . ")");
            } catch (Exception $e) {}
        }
    }

    // 2. Insert some test subscriptions
    $stmt = $db->query("SELECT id FROM plan_subscriptions LIMIT 1");
    if (!$stmt->fetch()) {
        $stmt = $db->query("SELECT id, access_level_id FROM users WHERE role = 'photographer' LIMIT 3");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($users as $u) {
            $stmt = $db->prepare("INSERT INTO plan_subscriptions (photographer_id, access_level_id, amount, payment_date, expiry_date, payment_method, status) VALUES (?, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY), ?, 'Card', 'Completed')");
            $amount = ($u['access_level_id'] == 3) ? 4500 : 2500;
            $stmt->execute([$u['id'], $u['access_level_id'], $amount, rand(1, 30), '2026-12-31']);
        }
        echo "Inserted test subscriptions.\n";
    }

    echo "Data seeding completed successfully.";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
