<?php
	require('../header.php');

	$plot_name = addslashes($_POST['plot_name']);
	$plot_area = intval($_POST['plot_area']);
	$plot_description = addslashes($_POST['plot_description']);
	
	$query = "insert into plot_info values(NULL,'".$plot_name."','".$plot_area."','".$plot_description."')";
	

	$result = $db->query($query);
	if ($result) {
		echo $db->affected_rows;
	} else {
		echo $db->error;
	}
?>
