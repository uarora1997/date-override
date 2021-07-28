<?php

include 'config.php';

if(isset($_POST['slots'])){
    $slots = json_encode($_POST['slots']);
} else {
    $slots = json_encode(array());
}
$id = $_POST['overwriteId'];

$sql = "UPDATE `date_overrides` SET `slots` = '$slots' WHERE `id` = $id";
$result = @mysqli_query($conn, $sql);

if (@mysqli_affected_rows($conn) > 0) {
    echo 'DONE';
} else {
  echo "NOT DONE";
}

@mysqli_close($conn);
?>