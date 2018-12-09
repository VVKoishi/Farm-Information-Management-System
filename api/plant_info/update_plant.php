<?php
	require('../header.php');

	$plot_id = intval($_POST['plot_id']);
	$crop_id = intval($_POST['crop_id']);
	$plant_num = intval($_POST['plant_num']);
	

	$query = "update plant_info set plant_num='".$plant_num."' where plot_id='".$plot_id."' AND crop_id='".$crop_id."'";
	

	$result = $db->query($query);
	if ($result) {
		echo $db->affected_rows;
	} else {
		echo $db->error;
	}	
?>
