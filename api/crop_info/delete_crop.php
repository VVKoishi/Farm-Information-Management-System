<?php
	require('../header.php');

	$crop_id = intval($_POST['crop_id']);

	$query = "delete from crop_info where crop_id='".$crop_id."'";
	

	$result = $db->query($query);
	if ($result) {
		echo $db->affected_rows;
	} else {
		echo $db->error;
	}	



	$query = "delete from plant_info where crop_id='".$crop_id."'";
	
	$result = $db->query($query);
	if ($result) {
		echo $db->affected_rows;
	} else {
		echo $db->error;
	}
?>
