<?php
require_once '../config/cors.php';
require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        try {
            $query = "SELECT * FROM access_levels ORDER BY id ASC";
            $stmt = $db->query($query);
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($data);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["message" => "Error fetching access levels", "error" => $e->getMessage()]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"));
        if (!isset($data->id)) {
            http_response_code(400);
            echo json_encode(["message" => "Missing required fields"]);
            break;
        }

        try {
            $query = "UPDATE access_levels SET 
                      max_clients = :m_c, 
                      max_bookings = :m_b, 
                      max_storage_gb = :m_s 
                      WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":m_c", $data->max_clients);
            $stmt->bindParam(":m_b", $data->max_bookings);
            $stmt->bindParam(":m_s", $data->max_storage_gb);
            $stmt->bindParam(":id", $data->id);
            $stmt->execute();
            echo json_encode(["message" => "Access level updated successfully"]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["message" => "Error updating access level", "error" => $e->getMessage()]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        if (!isset($data->level_name)) {
            http_response_code(400);
            echo json_encode(["message" => "Missing level_name"]);
            break;
        }

        try {
            $query = "INSERT INTO access_levels (level_name, max_clients, max_bookings, max_storage_gb)
                      VALUES (:name, :m_c, :m_b, :m_s)";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":name", $data->level_name);
            $stmt->bindParam(":m_c", $data->max_clients);
            $stmt->bindParam(":m_b", $data->max_bookings);
            $stmt->bindParam(":m_s", $data->max_storage_gb);
            $stmt->execute();
            $newId = $db->lastInsertId();
            echo json_encode(["message" => "Access level created successfully", "id" => $newId]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["message" => "Error creating access level", "error" => $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed"]);
        break;
}
?>
