<?php
require_once '../config/cors.php';
require_once '../config/database.php';

$app = 'calculator'; // Ensure it uses the calculator DB
$database = new Database($app);
$db = $database->getConnection();

if (!$db) {
    http_response_code(500);
    echo json_encode(["message" => "Database connection failed"]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        if (isset($_GET['categories'])) {
            $stmt = $db->query("SELECT * FROM category_types ORDER BY display_order ASC, name ASC");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            exit;
        }

        $query = "
            SELECT e.*, c.name as category_name 
            FROM equipment_details e
            LEFT JOIN category_types c ON e.category_id = c.id
            ORDER BY e.created_at DESC
        ";
        $stmt = $db->query($query);
        $equipment = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($equipment);

    } elseif ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"));
        
        if (!empty($data->name) && !empty($data->model) && !empty($data->category_id)) {
            $query = "INSERT INTO equipment_details 
                (category_id, type, model, name, value, description, is_active) 
                VALUES (:category_id, :type, :model, :name, :value, :description, :is_active)";
            
            $stmt = $db->prepare($query);
            
            $stmt->bindParam(":category_id", $data->category_id);
            $stmt->bindParam(":type", $data->type);
            $stmt->bindParam(":model", $data->model);
            $stmt->bindParam(":name", $data->name);
            $stmt->bindParam(":value", $data->value);
            $stmt->bindParam(":description", $data->description);
            $isActive = isset($data->is_active) ? $data->is_active : 1;
            $stmt->bindParam(":is_active", $isActive);
            
            if ($stmt->execute()) {
                http_response_code(201);
                echo json_encode(["message" => "Equipment added successfully.", "id" => $db->lastInsertId()]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "Unable to add equipment."]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Incomplete data."]);
        }

    } elseif ($method === 'PUT') {
        $data = json_decode(file_get_contents("php://input"));
        
        if (!empty($data->id) && !empty($data->name) && !empty($data->model) && !empty($data->category_id)) {
            $query = "UPDATE equipment_details 
                SET category_id = :category_id, 
                    type = :type, 
                    model = :model, 
                    name = :name, 
                    value = :value, 
                    description = :description, 
                    is_active = :is_active
                WHERE id = :id";
            
            $stmt = $db->prepare($query);
            
            $stmt->bindParam(":category_id", $data->category_id);
            $stmt->bindParam(":type", $data->type);
            $stmt->bindParam(":model", $data->model);
            $stmt->bindParam(":name", $data->name);
            $stmt->bindParam(":value", $data->value);
            $stmt->bindParam(":description", $data->description);
            $stmt->bindParam(":is_active", $data->is_active);
            $stmt->bindParam(":id", $data->id);
            
            if ($stmt->execute()) {
                http_response_code(200);
                echo json_encode(["message" => "Equipment updated successfully."]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "Unable to update equipment."]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Incomplete data."]);
        }

    } elseif ($method === 'DELETE') {
        $data = json_decode(file_get_contents("php://input"));
        
        if (!empty($data->id)) {
            $query = "DELETE FROM equipment_details WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":id", $data->id);
            
            if ($stmt->execute()) {
                http_response_code(200);
                echo json_encode(["message" => "Equipment deleted successfully."]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "Unable to delete equipment."]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Incomplete data. ID is missing."]);
        }
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Error processing request", "error" => $e->getMessage()]);
}
?>
