<?php
require_once '../config/cors.php';
require_once '../config/database.php';

$app = $_GET['app'] ?? $_POST['app'] ?? 'lens_manager';
$database = new Database($app);
$db = $database->getConnection();

if (!$db) {
    http_response_code(500);
    echo json_encode(["message" => "Database connection failed"]);
    exit;
}

$total_photographers = 0;
$active_subscriptions = 0;
$total_revenue = 0;
$monthly_revenue = 0;
$recent_signups = [];
$plan_distribution = [];
$history = [];

try {
    // Total Photographers
    try {
        if ($app === 'workshop') {
            $query = "SELECT COUNT(*) as count FROM users";
        } else {
            $query = "SELECT COUNT(*) as count FROM users WHERE role = 'photographer'";
        }
        $stmt = $db->query($query);
        if ($stmt) {
            $total_photographers = (int)($stmt->fetch(PDO::FETCH_ASSOC)['count'] ?? 0);
        }
    } catch (Exception $e) {}

    // Active Photographers (Subscriptions)
    try {
        if ($app === 'workshop') {
             $query = "SELECT COUNT(*) as count FROM users u JOIN packages pk ON u.package_id = pk.id WHERE (u.is_active = 1 OR u.is_active IS NULL)";
        } else {
            $query = "SELECT COUNT(u.id) as count FROM users u LEFT JOIN access_levels al ON u.access_level_id = al.id 
                      WHERE u.role = 'photographer' AND (u.is_active = 1 OR u.is_active IS NULL) 
                      AND (u.expire_date > NOW() OR u.expire_date IS NULL OR LOWER(al.level_name) = 'free')";
        }
        $stmt = $db->query($query);
        if ($stmt) {
            $active_subscriptions = (int)($stmt->fetch(PDO::FETCH_ASSOC)['count'] ?? 0);
        }
    } catch (Exception $e) {}

    // Total Revenue
    try {
        if ($app === 'workshop') {
            $query = "SELECT SUM(amount_paid) as total FROM join_requests WHERE status = 'approved'";
        } else {
            $query = "SELECT SUM(amount) as total FROM plan_subscriptions";
        }
        $stmt = $db->query($query);
        if ($stmt) {
            $total_revenue = (float)($stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0);
        }
    } catch (Exception $e) {}

    // Revenue Last 30 Days
    try {
        if ($app === 'workshop') {
            $query = "SELECT SUM(amount_paid) as total FROM join_requests WHERE status = 'approved' AND created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)";
        } else {
            $query = "SELECT SUM(amount) as total FROM plan_subscriptions WHERE payment_date > DATE_SUB(NOW(), INTERVAL 30 DAY)";
        }
        $stmt = $db->query($query);
        if ($stmt) {
            $monthly_revenue = (float)($stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0);
        }
    } catch (Exception $e) {}

    // Recent Signups (Last 5)
    try {
        if ($app === 'workshop') {
            $query = "SELECT COALESCE(p.display_name, 'New User') as name, u.email, u.created_at, pk.name as plan 
                      FROM users u
                      LEFT JOIN profiles p ON u.id = p.user_id
                      LEFT JOIN packages pk ON u.package_id = pk.id
                      ORDER BY u.created_at DESC LIMIT 5";
        } else {
            $query = "SELECT u.full_name as name, u.email, u.created_at, al.level_name as plan 
                      FROM users u
                      LEFT JOIN access_levels al ON u.access_level_id = al.id
                      WHERE u.role = 'photographer' 
                      ORDER BY u.created_at DESC LIMIT 5";
        }
        $stmt = $db->query($query);
        if ($stmt) {
            $recent_signups = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
    } catch (Exception $e) {}

    // Plan Distribution
    try {
        if ($app === 'workshop') {
            $query = "SELECT pk.name as level_name, COUNT(u.id) as count 
                      FROM packages pk 
                      LEFT JOIN users u ON u.package_id = pk.id 
                      GROUP BY pk.id, pk.name";
        } else {
            $query = "SELECT al.level_name, COUNT(u.id) as count 
                      FROM access_levels al 
                      LEFT JOIN users u ON u.access_level_id = al.id 
                      GROUP BY al.id, al.level_name";
        }
        $stmt = $db->query($query);
        if ($stmt) {
            $plan_distribution = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
    } catch (Exception $e) {}

    // Revenue History for Chart
    $period = $_GET['period'] ?? '7days';
    try {
        if ($app === 'workshop') {
            $date_col = 'created_at';
            $amt_col = 'amount_paid';
            $table = 'join_requests';
            $where = "WHERE status = 'approved'";
        } else {
            $date_col = 'payment_date';
            $amt_col = 'amount';
            $table = 'plan_subscriptions';
            $where = "WHERE 1=1";
        }

        if ($period === '12months') {
            $query = "SELECT DATE_FORMAT($date_col, '%b') as name, SUM($amt_col) as revenue 
                      FROM $table 
                      $where AND $date_col > DATE_SUB(NOW(), INTERVAL 12 MONTH)
                      GROUP BY MONTH($date_col), name
                      ORDER BY $date_col ASC";
        } elseif ($period === '30days') {
            $query = "SELECT DATE_FORMAT($date_col, '%d %b') as name, SUM($amt_col) as revenue 
                      FROM $table 
                      $where AND $date_col > DATE_SUB(NOW(), INTERVAL 30 DAY)
                      GROUP BY DATE($date_col), name
                      ORDER BY $date_col ASC";
        } else { // 7days
            $query = "SELECT DATE_FORMAT($date_col, '%a') as name, SUM($amt_col) as revenue 
                      FROM $table 
                      $where AND $date_col > DATE_SUB(NOW(), INTERVAL 7 DAY)
                      GROUP BY DATE($date_col), name
                      ORDER BY $date_col ASC";
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
