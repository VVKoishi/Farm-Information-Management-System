<?php
	require('../header.php');

	$plot_id = intval($_POST['plot_id']);

	$query = "delete from plot_info where plot_id='".$plot_id."'";
	

	$result = $db->query($query);
	if ($result) {
		echo $db->affected_rows;
	} else {
		echo $db->error;
	}


	$query = "delete from plant_info where plot_id='".$plot_id."'";
	
	$result = $db->query($query);
	if ($result) {
		echo $db->affected_rows;
	} else {
		echo $db->error;
	}
?>
