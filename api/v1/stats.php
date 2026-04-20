<?php
require_once '../config/cors.php';
require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    http_response_code(500);
    echo json_encode(["message" => "Database connection failed"]);
    exit;
}

try {
    // Total Photographers
    $total_photographers = 0;
    try {
        $query = "SELECT COUNT(*) as count FROM users WHERE role = 'photographer'";
        $stmt = $db->query($query);
        if ($stmt) {
            $total_photographers = $stmt->fetch(PDO::FETCH_ASSOC)['count'] ?? 0;
        }
    } catch (Exception $e) {}

    // Active Subscriptions (not expired)
    $active_subscriptions = 0;
    try {
        $query = "SELECT COUNT(u.id) as count FROM users u LEFT JOIN access_levels al ON u.access_level_id = al.id WHERE u.role = 'photographer' AND (u.expire_date > NOW() OR u.expire_date IS NULL OR LOWER(al.level_name) = 'free')";
        $stmt = $db->query($query);
        if ($stmt) {
            $active_subscriptions = $stmt->fetch(PDO::FETCH_ASSOC)['count'] ?? 0;
        }
    } catch (Exception $e) {}

    // Total Revenue
    $total_revenue = 0;
    try {
        $query = "SELECT SUM(amount) as total FROM plan_subscriptions";
        $stmt = $db->query($query);
        if ($stmt) {
            $total_revenue = $stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;
        }
    } catch (Exception $e) {}

    // Revenue Last 30 Days
    $monthly_revenue = 0;
    try {
        $query = "SELECT SUM(amount) as total FROM plan_subscriptions WHERE payment_date > DATE_SUB(NOW(), INTERVAL 30 DAY)";
        $stmt = $db->query($query);
        if ($stmt) {
            $monthly_revenue = $stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;
        }
    } catch (Exception $e) {}

    // Recent Signups (Last 5)
    $recent_signups = [];
    try {
        $query = "SELECT u.full_name as name, u.email, u.created_at, al.level_name as plan 
                  FROM users u
                  LEFT JOIN access_levels al ON u.access_level_id = al.id
                  WHERE u.role = 'photographer' 
                  ORDER BY u.created_at DESC LIMIT 5";
        $stmt = $db->query($query);
        if ($stmt) {
            $recent_signups = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
    } catch (Exception $e) {}

    // Plan Distribution
    $plan_distribution = [];
    try {
        $query = "SELECT al.level_name, COUNT(u.id) as count 
                  FROM access_levels al 
                  LEFT JOIN users u ON u.access_level_id = al.id 
                  GROUP BY al.id, al.level_name";
        $stmt = $db->query($query);
        if ($stmt) {
            $plan_distribution = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
    } catch (Exception $e) {}

    // Revenue History for Chart
    $period = $_GET['period'] ?? '7days';
    $history = [];
    
    try {
        if ($period === '12months') {
            $query = "SELECT DATE_FORMAT(payment_date, '%b') as name, SUM(amount) as revenue 
                      FROM plan_subscriptions 
                      WHERE payment_date > DATE_SUB(NOW(), INTERVAL 12 MONTH)
                      GROUP BY MONTH(payment_date), name
                      ORDER BY payment_date ASC";
        } elseif ($period === '30days') {
            $query = "SELECT DATE_FORMAT(payment_date, '%d %b') as name, SUM(amount) as revenue 
                      FROM plan_subscriptions 
                      WHERE payment_date > DATE_SUB(NOW(), INTERVAL 30 DAY)
                      GROUP BY DATE(payment_date), name
                      ORDER BY payment_date ASC";
        } else { // 7days
            $query = "SELECT DATE_FORMAT(payment_date, '%a') as name, SUM(amount) as revenue 
                      FROM plan_subscriptions 
                      WHERE payment_date > DATE_SUB(NOW(), INTERVAL 7 DAY)
                      GROUP BY DATE(payment_date), name
                      ORDER BY payment_date ASC";
        }
        $stmt = $db->query($query);
        if ($stmt) {
            $history = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        
        // Ensure we have some data points for the UI if empty
        if (empty($history)) {
             if ($period === '12months') {
                 $history = [['name' => 'Jan', 'revenue' => 0], ['name' => 'Dec', 'revenue' => 0]];
             } else {
                 $history = [['name' => 'Mon', 'revenue' => 0], ['name' => 'Sun', 'revenue' => 0]];
             }
        }
    } catch (Exception $e) {
        $history = [];
    }

    echo json_encode([
        "totals" => [
            "photographers" => $total_photographers,
            "active_subscriptions" => $active_subscriptions,
            "total_revenue" => $total_revenue,
            "monthly_revenue" => $monthly_revenue
        ],
        "recent_signups" => $recent_signups,
        "plan_distribution" => $plan_distribution,
        "revenue_history" => $history
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Error fetching stats", "error" => $e->getMessage()]);
}
?>
