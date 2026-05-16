<?php
require_once 'api/config/database.php';
$db = (new Database('workshop'))->getConnection();
echo "Events table:\n";
$q = $db->query('DESCRIBE events');
print_r($q->fetchAll(PDO::FETCH_ASSOC));
?>
