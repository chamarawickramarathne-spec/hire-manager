<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../models/Photographer.php';

$database = new Database();
$db = $database->getConnection();
$photographer = new Photographer($db);

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $search = isset($_GET['search']) ? $_GET['search'] : '';
        try {
            $data = $photographer->getAll($search);
            echo json_encode($data);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["message" => "Error fetching photographers", "error" => $e->getMessage()]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"));
        if (!isset($data->id) || !isset($data->level_id)) {
            http_response_code(400);
            echo json_encode(["message" => "Missing required fields"]);
            break;
        }

        try {
            $expire_date = isset($data->expire_date) ? $data->expire_date : null;
            $status = isset($data->status) ? $data->status : 'Active';
            $activation_date = isset($data->activation_date) ? $data->activation_date : null;
            $amount = isset($data->amount) ? $data->amount : 0;
            $transaction_id = isset($data->transaction_id) ? $data->transaction_id : '';
            $payment_method = isset($data->payment_method) ? $data->payment_method : 'Manual Override';
            
            if ($photographer->updatePlan($data->id, $data->level_id, $expire_date, $status, $activation_date, $amount, $transaction_id, $payment_method)) {
                echo json_encode(["message" => "Plan updated successfully"]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "Failed to update plan"]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["message" => "Error updating plan", "error" => $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed"]);
        break;
}
?>
