<?php

include 'config.php';

if(isset($_POST['slots'])){
    $slots = json_encode(@$_POST['slots']);
} else {
    $slots = json_encode(array());
}
$staff_id = $_POST['staffId'];
$schedule_id = $_POST['scheduleId'];
$date = $_POST['date'];

$sql = "INSERT INTO `date_overrides` SET `date` = '$date', `slots` = '$slots', `staff_id` = '$staff_id', `schedule_id` = '$schedule_id'";
$result = @mysqli_query($conn, $sql);

if (@mysqli_affected_rows($conn) > 0) {
    echo 'DONE';
} else {
  echo "NOT DONE";
}

@mysqli_close($conn);
?>