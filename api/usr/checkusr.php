<?php
	require('../header.php');

	$email = addslashes($_POST['email']);
	$password = addslashes($_POST['password']);


	$query = "SELECT password FROM usr WHERE email='".$email."'";

	$result = $db->query($query);
	if ($result) {
		if($row = mysqli_fetch_array($result, MYSQL_ASSOC)){
			$arr = array('success' => 'false');
		    if ($row['password'] == $password) {//检查密码
		    	$arr['success'] = 'true';
		    }
		    $return = json_encode($arr);
		    echo $return;//返回true或false
		} else {
			echo "fetch wrong";
		}
	} else {
		echo "result wrong";
	}

	
?>