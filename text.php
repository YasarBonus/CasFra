<?php
// Überprüfen, ob der URL-Parameter "text" gesetzt ist und nicht leer ist
if(isset($_GET['text']) && !empty($_GET['text'])) {
    // Text aus dem URL-Parameter abrufen
    $text = $_GET['text'];

    // Text formatieren und ausgeben
    echo "<span style='color: white;
    padding: 4px;
    font-family: Arial;
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    background-color: #A9325C'>" . nl2br($text) . "</span>";
}
?>


