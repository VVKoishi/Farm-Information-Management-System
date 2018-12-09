<?php
	require('../header.php');

	$crop_id = intval($_POST['crop_id']);
	$crop_name = addslashes($_POST['crop_name']);
	$crop_num = intval($_POST['crop_num']);
	$crop_area = floatval($_POST['crop_area']);
	$crop_cycle = floatval($_POST['crop_cycle']);
	$crop_profit = floatval($_POST['crop_profit']);
	$crop_description = addslashes($_POST['crop_description']);

	$query = "update crop_info set crop_name='".$crop_name."',crop_num='".$crop_num."',crop_area='".$crop_area."',crop_cycle='".$crop_cycle."',crop_profit='".$crop_profit."',crop_description='".$crop_description."' where crop_id='".$crop_id."'";
	

	$result = $db->query($query);
	if ($result) {
		echo $db->affected_rows;
	} else {
		echo $db->error;
	}	
?>
