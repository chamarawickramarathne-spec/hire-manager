<?php
class Database {
    private $host;
    private $database_name;
    private $username;
    private $password;
    public $conn;

    public function __construct() {
        // Automatically determine environment
        $serverName = $_SERVER['SERVER_NAME'] ?? '';
        if ($serverName === 'localhost' || $serverName === '127.0.0.1') {
            // Local Configuration
            $this->host = "localhost";
            $this->database_name = "lens_booking_pro";
            $this->username = "test";
            $this->password = "FZ8V6dtvf2kNG0";
        } else {
            // Production Configuration (Live) - e.g., on manager.hireartist.studio
            $this->host = "localhost";
            $this->database_name = "hiresmcq_lensbooking";
            $this->username = "hiresmcq_lensrun";
            $this->password = "Q}Pf;9#?^djT)MT";
        }
    }

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->database_name, $this->username, $this->password);
            $this->conn->exec("set names utf8mb4");
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }

        return $this->conn;
    }
}
?>
