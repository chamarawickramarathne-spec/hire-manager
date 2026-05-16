<?php
class Database {
    protected $host;
    protected $database_name;
    protected $username;
    protected $password;
    public $conn;

    private $apps = [
        'lens_manager' => [
            'local' => ['db' => 'lens_booking_pro', 'user' => 'root', 'pass' => ''],
            'prod'  => ['db' => 'hiresmcq_lensbooking', 'user' => 'hiresmcq_lensrun', 'pass' => 'Q}Pf;9#?^djT)MT']
        ],
        'workshop' => [
            'local' => ['db' => 'lens_workshop', 'user' => 'root', 'pass' => ''],
            'prod'  => ['db' => 'hiresmcq_lens_workshop', 'user' => 'hiresmcq_lens_workshop', 'pass' => '!BupfUTT8&?3R2>']
        ],
        'calculator' => [
            'local' => ['db' => 'lens_calculator', 'user' => 'root', 'pass' => ''],
            'prod'  => ['db' => 'hiresmcq_lens_calculator', 'user' => 'hiresmcq_lens_me', 'pass' => '~CzLGA~;v%Ye']
        ]
    ];

    public function __construct($app = 'lens_manager') {
        // Automatically determine environment
        $serverName = $_SERVER['SERVER_NAME'] ?? '';
        $isLocal = ($serverName === 'localhost' || $serverName === '127.0.0.1' || $serverName === '');
        $env = $isLocal ? 'local' : 'prod';

        if (!isset($this->apps[$app])) {
            $app = 'lens_manager';
        }

        $config = $this->apps[$app][$env];
        
        $this->host = "localhost";
        $this->database_name = $config['db'];
        $this->username = $config['user'];
        $this->password = $config['pass'];
    }

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->database_name, $this->username, $this->password);
            $this->conn->exec("set names utf8mb4");
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            // Log error instead of echoing in production if possible, but keeping consistency
            error_log("Connection error: " . $exception->getMessage());
            return null;
        }

        return $this->conn;
    }
}
?>
