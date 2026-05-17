<?php
try {
    $db = new PDO('mysql:host=localhost;dbname=lens_calculator', 'root', '');
    $stmt = $db->query('DESCRIBE equipment_details');
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo $e->getMessage();
}
?>
