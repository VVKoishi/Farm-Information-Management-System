<?php
	require('../header.php');

    $plot_id = intval($_POST['plot_id']);
    $crop_id = intval($_POST['crop_id']);
	if($crop_id)
		$query = "delete from plant_info where plot_id='".$plot_id."' AND crop_id='".$crop_id."'";
	else
		$query = "delete from plant_info where plot_id='".$plot_id."'";
	

	$result = $db->query($query);
	if ($result) {
		echo $db->affected_rows;
	} else {
		echo $db->error;
	}	
?>
