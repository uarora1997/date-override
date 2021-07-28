<?php

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "appointnow";

// Create connection
$conn = @mysqli_connect($servername, $username, $password, $dbname);
// Check connection
if (!$conn) {
  die(json_encode(array('error' => mysqli_connect_error())));
}

?>