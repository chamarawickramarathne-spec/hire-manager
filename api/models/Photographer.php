<?php
class Photographer {
    private $conn;
    private $table_name = "users";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll($search = '') {
        $query = "SELECT u.id, u.full_name as name, u.email, u.access_level_id, u.expire_date, u.created_at, u.is_active,
                         al.level_name as al_name
                  FROM " . $this->table_name . " u
                  LEFT JOIN access_levels al ON u.access_level_id = al.id
                  WHERE u.role = 'photographer'";
        
        if ($search) {
            $query .= " AND (u.full_name LIKE :search OR u.email LIKE :search)";
        }
        
        $query .= " ORDER BY u.created_at DESC";

        try {
            $stmt = $this->conn->prepare($query);
            if ($search) {
                $search = "%{$search}%";
                $stmt->bindParam(":search", $search);
            }
            $stmt->execute();
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Fetch additional stats safely for each photographer
            foreach ($results as &$row) {
                $userId = $row['id'];
                
                // Set default values
                $row['activation_date'] = null;
                $row['client_count'] = 0;
                $row['booking_count'] = 0;
                $row['storage_bytes'] = 0;

                // Try each subquery separately to handle missing tables/columns
                try {
                    $q = "SELECT MAX(payment_date) as ad FROM plan_subscriptions WHERE photographer_id = ?";
                    $s = $this->conn->prepare($q);
                    $s->execute([$userId]);
                    $res = $s->fetch(PDO::FETCH_ASSOC);
                    $row['activation_date'] = $res ? $res['ad'] : null;
                } catch (Exception $e) {}

                try {
                    $q = "SELECT COUNT(*) as c FROM clients WHERE user_id = ?";
                    $s = $this->conn->prepare($q);
                    $s->execute([$userId]);
                    $res = $s->fetch(PDO::FETCH_ASSOC);
                    $row['client_count'] = $res ? $res['c'] : 0;
                } catch (Exception $e) {}

                try {
                    $q = "SELECT COUNT(*) as b FROM bookings WHERE user_id = ?";
                    $s = $this->conn->prepare($q);
                    $s->execute([$userId]);
                    $res = $s->fetch(PDO::FETCH_ASSOC);
                    $row['booking_count'] = $res ? $res['b'] : 0;
                } catch (Exception $e) {}

                try {
                    $q = "SELECT SUM(gi.file_size) as sb FROM gallery_images gi JOIN galleries g ON gi.gallery_id = g.id WHERE g.user_id = ?";
                    $s = $this->conn->prepare($q);
                    $s->execute([$userId]);
                    $res = $s->fetch(PDO::FETCH_ASSOC);
                    $row['storage_bytes'] = $res ? ($res['sb'] ?? 0) : 0;
                } catch (Exception $e) {}

                $row['storage_gb'] = round(($row['storage_bytes'] ?? 0) / (1024 * 1024 * 1024), 4);
                $row['status'] = $this->getStatus($row['expire_date'], $row['is_active']);
            }
            
            return $results;
        } catch (Exception $e) {
            throw new Exception("Error in getAll: " . $e->getMessage());
        }
    }

    private function getStatus($expire_date, $is_active) {
        if ($is_active == 0) return 'Inactive';
        if (!$expire_date) return 'Active';
        return (strtotime($expire_date) > time()) ? 'Active' : 'Expired';
    }

    public function updatePlan($id, $level_id, $expire_date, $status = 'Active', $activation_date = null, $amount = 0, $transaction_id = '', $payment_method = 'Manual Override') {
        $this->conn->beginTransaction();
        try {
            // 1. Update user record
            $is_active = ($status === 'Active') ? 1 : 0;
            $query = "UPDATE " . $this->table_name . " 
                      SET access_level_id = :level_id, expire_date = :expire_date, is_active = :is_active
                      WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":level_id", $level_id);
            $stmt->bindParam(":expire_date", $expire_date);
            $stmt->bindParam(":is_active", $is_active);
            $stmt->bindParam(":id", $id);
            $stmt->execute();

            // 2. If activation date provided, record a subscription entry
            if ($activation_date) {
                $query = "INSERT INTO plan_subscriptions (photographer_id, access_level_id, amount, payment_date, expiry_date, payment_method, transaction_id, status)
                          VALUES (:id, :level_id, :amount, :p_date, :e_date, :p_method, :t_id, 'Completed')";
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(":id", $id);
                $stmt->bindParam(":level_id", $level_id);
                $stmt->bindParam(":amount", $amount);
                $stmt->bindParam(":p_date", $activation_date);
                $stmt->bindParam(":e_date", $expire_date);
                $stmt->bindParam(":p_method", $payment_method);
                $stmt->bindParam(":t_id", $transaction_id);
                $stmt->execute();
            }

            $this->conn->commit();
            return true;
        } catch (Exception $e) {
            $this->conn->rollBack();
            throw $e;
        }
    }
}
?>
