<?php

include 'config.php';

$overrideId = $_POST['overrideId'];

$sql = "DELETE FROM date_overrides WHERE `id` = $overrideId" ;
$result = @mysqli_query($conn, $sql);

if (@mysqli_num_rows($result) > 0) {
  // output data of each row
  $arr = array();
  while($row = @mysqli_fetch_assoc($result)) {
    array_push($arr, $row);
  }
  echo json_encode($arr);
} else {
  echo "0 results";
}

@mysqli_close($conn);
?>