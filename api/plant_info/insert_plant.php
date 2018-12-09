<?php
	require('../header.php');

	$plot_id = intval($_POST['plot_id']);
	$crop_id = intval($_POST['crop_id']);
	$plant_num = intval($_POST['plant_num']);
	


	$query = "insert into plant_info values('".$plot_id."','".$crop_id."','".$plant_num."')";


	$result = $db->query($query);
	if ($result) {
		echo $db->affected_rows;
	} else {
		echo $db->error;
	}

?>