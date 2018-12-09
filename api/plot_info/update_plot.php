<?php
	require('../header.php');

	$plot_id = intval($_POST['plot_id']);
	$plot_name = addslashes($_POST['plot_name']);
	$plot_area = intval($_POST['plot_area']);
	$plot_description = addslashes($_POST['plot_description']);

	$query = "update plot_info set plot_name='".$plot_name."',plot_area='".$plot_area."',plot_description='".$plot_description."' where plot_id='".$plot_id."'";
	

	$result = $db->query($query);
	if ($result) {
		echo $db->affected_rows;
	} else {
		echo $db->error;
	}	
?>
