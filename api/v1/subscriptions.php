<?php
require_once '../config/cors.php';
require_once '../config/database.php';

$app = $_GET['app'] ?? $_POST['app'] ?? 'lens_manager';
$database = new Database($app);
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        try {
            $data = [];
            try {
                if ($app === 'workshop') {
                    $query = "SELECT jr.id, jr.student_name as photographer_name, e.event_name as plan_name, 
                                     jr.amount_paid as amount, jr.created_at as payment_date, 
                                     'Online/Slip' as payment_method, jr.status, jr.payment_slip_url as transaction_id
                              FROM join_requests jr
                              JOIN events e ON jr.event_id = e.id
                              ORDER BY jr.created_at DESC";
                } else {
                    $query = "SELECT s.*, u.full_name as photographer_name, al.level_name as plan_name 
                              FROM plan_subscriptions s
                              JOIN users u ON s.photographer_id = u.id
                              JOIN access_levels al ON s.access_level_id = al.id
                              ORDER BY s.id DESC";
                }
                $stmt = $db->query($query);
                if ($stmt) {
                    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
                }
            } catch (Exception $e) {
                // Table might not exist for this app (e.g., calculator)
            }
            echo json_encode($data);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["message" => "Error fetching subscriptions", "error" => $e->getMessage()]);
        }
        break;

    case 'POST':
        if ($app === 'workshop') {
            http_response_code(400);
            echo json_encode(["message" => "Subscription recording not supported for this app via this endpoint"]);
            break;
        }
        $data = json_decode(file_get_contents("php://input"));
        if (!isset($data->photographer_id) || !isset($data->access_level_id) || !isset($data->amount)) {
            http_response_code(400);
            echo json_encode(["message" => "Missing required fields"]);
            break;
        }

        try {
            $db->beginTransaction();

            // 1. Insert into plan_subscriptions
            $query = "INSERT INTO plan_subscriptions 
                      (photographer_id, access_level_id, amount, payment_date, expiry_date, payment_method, transaction_id, notes) 
                      VALUES (:p_id, :al_id, :amount, :p_date, :e_date, :method, :t_id, :notes)";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(":p_id", $data->photographer_id);
            $stmt->bindParam(":al_id", $data->access_level_id);
            $stmt->bindParam(":amount", $data->amount);
            $stmt->bindParam(":p_date", $data->payment_date);
            $stmt->bindParam(":e_date", $data->expiry_date);
            $stmt->bindParam(":method", $data->payment_method);
            $stmt->bindParam(":t_id", $data->transaction_id);
            $stmt->bindParam(":notes", $data->notes);
            $stmt->execute();

            // 2. Update user's plan and expiry date
            $query = "UPDATE users SET access_level_id = :al_id, expire_date = :e_date WHERE id = :p_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":al_id", $data->access_level_id);
            $stmt->bindParam(":e_date", $data->expiry_date);
            $stmt->bindParam(":p_id", $data->photographer_id);
            $stmt->execute();

            $db->commit();
            echo json_encode(["message" => "Subscription recorded successfully"]);
        } catch (Exception $e) {
            $db->rollBack();
            http_response_code(500);
            echo json_encode(["message" => "Error recording subscription", "error" => $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed"]);
        break;
}
?>
