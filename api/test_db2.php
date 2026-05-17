<?php
try {
    $db = new PDO('mysql:host=localhost;dbname=lens_calculator', 'root', '');
    $stmt = $db->query('SHOW TABLES LIKE "%category%"');
    $tables = $stmt->fetchAll(PDO::FETCH_ASSOC);
    print_r($tables);
    if (!empty($tables)) {
        $firstTable = array_values($tables[0])[0];
        $stmt2 = $db->query("DESCRIBE $firstTable");
        print_r($stmt2->fetchAll(PDO::FETCH_ASSOC));
        $stmt3 = $db->query("SELECT * FROM $firstTable LIMIT 5");
        print_r($stmt3->fetchAll(PDO::FETCH_ASSOC));
    }
} catch (Exception $e) {
    echo $e->getMessage();
}
?>
