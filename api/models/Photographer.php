<?php
class Photographer {
    private $conn;
    private $table_name = "users";
    private $app;

    public function __construct($db, $app = 'lens_manager') {
        $this->conn = $db;
        $this->app = $app;
    }

    public function getAll($search = '') {
        if ($this->app === 'workshop') {
            $query = "SELECT u.id, COALESCE(p.display_name, 'New User') as name, u.email, u.package_id as access_level_id, NULL as expire_date, u.created_at, 1 as is_active,
                             pk.name as al_name
                      FROM " . $this->table_name . " u
                      LEFT JOIN profiles p ON u.id = p.user_id
                      LEFT JOIN packages pk ON u.package_id = pk.id
                      WHERE 1=1";
            
            if ($search) {
                $query .= " AND (p.display_name LIKE :search OR u.email LIKE :search)";
            }
        } else {
            $query = "SELECT u.id, u.full_name as name, u.email, u.access_level_id, u.expire_date, u.created_at, u.is_active,
                             al.level_name as al_name
                      FROM " . $this->table_name . " u
                      LEFT JOIN access_levels al ON u.access_level_id = al.id
                      WHERE u.role = 'photographer'";
            
            if ($search) {
                $query .= " AND (u.full_name LIKE :search OR u.email LIKE :search)";
            }
        }
        
        $query .= " ORDER BY u.created_at DESC";

        try {
            $results = [];
            try {
                $stmt = $this->conn->prepare($query);
                if ($search) {
                    $search = "%{$search}%";
                    $stmt->bindParam(":search", $search);
                }
                $stmt->execute();
                $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            } catch (Exception $e) {
                // Return empty array if tables don't exist (e.g. for calculator app)
                return [];
            }

            // Fetch additional stats safely for each photographer
            foreach ($results as &$row) {
                $userId = $row['id'];
                
                // Set default values
                $row['activation_date'] = null;
                $row['client_count'] = 0;
                $row['booking_count'] = 0;
                $row['storage_bytes'] = 0;

                // Try each subquery separately to handle missing tables/columns
                if ($this->app === 'workshop') {
                    try {
                        $q = "SELECT COUNT(*) as c FROM events WHERE user_id = ?";
                        $s = $this->conn->prepare($q);
                        $s->execute([$userId]);
                        $res = $s->fetch(PDO::FETCH_ASSOC);
                        $row['booking_count'] = $res ? $res['c'] : 0; // Using events as bookings
                    } catch (Exception $e) {}

                    try {
                        $q = "SELECT COUNT(*) as c FROM join_requests jr JOIN events e ON jr.event_id = e.id WHERE e.user_id = ?";
                        $s = $this->conn->prepare($q);
                        $s->execute([$userId]);
                        $res = $s->fetch(PDO::FETCH_ASSOC);
                        $row['client_count'] = $res ? $res['c'] : 0; // Using students as clients
                    } catch (Exception $e) {}
                } else {
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
                }

                $row['storage_gb'] = round(($row['storage_bytes'] ?? 0) / (1024 * 1024 * 1024), 4);
                $row['status'] = $this->getStatus($row['expire_date'], $row['is_active'] ?? 1, $row['al_name'] ?? '');
            }
            
            return $results;
        } catch (Exception $e) {
            throw new Exception("Error in getAll: " . $e->getMessage());
        }
    }

    private function getStatus($expire_date, $is_active, $al_name = '') {
        if ($is_active == 2) return 'Suspended';
        if ($is_active == 0) return 'Inactive';
        if (strtolower($al_name) === 'free') return 'Active';
        if (!$expire_date) return 'Active';
        return (strtotime($expire_date) > time()) ? 'Active' : 'Expired';
    }

    public function updatePlan($id, $level_id, $expire_date, $status = 'Active', $activation_date = null, $amount = 0, $transaction_id = '', $payment_method = 'Manual Override') {
        $this->conn->beginTransaction();
        try {
            if ($this->app === 'workshop') {
                $query = "UPDATE " . $this->table_name . " 
                          SET package_id = :level_id
                          WHERE id = :id";
                $stmt = $this->conn->prepare($query);
                $stmt->bindValue(":level_id", $level_id, PDO::PARAM_INT);
                $stmt->bindValue(":id", $id);
                $stmt->execute();
            } else {
                // 1. Update user record
                $is_active = 1;
                if ($status === 'Inactive') $is_active = 0;
                if ($status === 'Suspended') $is_active = 2;
                
                $query = "UPDATE " . $this->table_name . " 
                          SET access_level_id = :level_id, expire_date = :expire_date, is_active = :is_active
                          WHERE id = :id";
                $stmt = $this->conn->prepare($query);
                $stmt->bindValue(":level_id", $level_id, PDO::PARAM_INT);
                $stmt->bindValue(":expire_date", $expire_date === '' ? null : $expire_date);
                $stmt->bindValue(":is_active", $is_active, PDO::PARAM_INT);
                $stmt->bindValue(":id", $id, PDO::PARAM_INT);
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
