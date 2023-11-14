<!DOCTYPE html>
<html>
<head>
    <style>
	body {
	background-color: #FFFFFF;
	}

        /* CSS für die Bildzentrierung */
        .image-container {
/*            text-align: center;*/
	padding-top:10px;
        }
        .image-container img {
/*            display: inline-block;
            margin: 0 auto;*/
	padding-left:5px;
        }
    </style>
</head>
<body>
<?php
// Bilder-Dateien und Verzeichnis festlegen
$imageNames = isset($_GET['name']) ? explode(',', $_GET['name']) : array();
$imageDirectory = 'images/';

// Prüfen, ob Bilder angegeben wurden
if (!empty($imageNames)) {
    // Container-Div für die Bilder erstellen
    echo '<div class="image-container">';

    // Schleife durch die Bildnamen
    foreach ($imageNames as $imageName) {
        // Leerzeichen entfernen und in Kleinbuchstaben umwandeln
        $formattedImageName = strtolower(str_replace(' ', '', trim($imageName)));

        // Bildpfad zusammensetzen
        $imagePath = $imageDirectory . $formattedImageName . '.png';

        // Prüfen, ob die Datei existiert
        if (file_exists($imagePath)) {
            // Bild ausgeben
            echo '<img width="70px" src="' . $imagePath . '" alt="' . $imageName . '" /> ';
        } else {
            // Falls das Bild nicht existiert, eine Meldung ausgeben
            echo $imageName; //$formattedImageName;
        }
    }

    // Container-Div schließen
    echo '</div>';
} else {
    // Falls keine Bildnamen angegeben wurden, eine Meldung ausgeben
    echo 'Missing Parameters.';
}
?>
</body>
</html>