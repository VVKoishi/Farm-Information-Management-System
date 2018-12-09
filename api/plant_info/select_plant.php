<?php
	require('../header.php');
    
	// $email = addslashes($_POST['email']);
	// $password = addslashes($_POST['password']);


	$query = "SELECT * FROM plant_info";

	$result = $db->query($query);
	if ($result) {
        $rows = array();//查询结果数组
		while($row = mysqli_fetch_array($result, MYSQL_ASSOC)){
            $rows[] = $row;
        }
        $return = json_encode($rows);
        echo $return;
	} else {
		echo "result wrong";
	}
    
	
?>