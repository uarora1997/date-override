<?php

include 'config.php';

$staffId = $_POST['staffId'];

$sql = "SELECT * FROM staff_schedules WHERE `staff_id` = $staffId";
$result = @mysqli_query($conn, $sql);

if (@mysqli_num_rows($result) > 0) {
  // output data of each row
  while($row = @mysqli_fetch_assoc($result)) {
    echo json_encode($row);
  }
} else {
  echo "0 results";
}

@mysqli_close($conn);
?>