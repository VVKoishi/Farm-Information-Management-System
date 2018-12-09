<?php
	require('../header.php');

	$crop_name = addslashes($_POST['crop_name']);
	$crop_num = intval($_POST['crop_num']);
	$crop_area = floatval($_POST['crop_area']);
	$crop_cycle = floatval($_POST['crop_cycle']);
	$crop_profit = floatval($_POST['crop_profit']);
	$crop_description = addslashes($_POST['crop_description']);


	$query = "insert into crop_info values(NULL,'".$crop_name."','".$crop_num."','".$crop_area."','".$crop_cycle."','".$crop_profit."','".$crop_description."')";


	$result = $db->query($query);
	if ($result) {
		echo $db->affected_rows;
	} else {
		echo $db->error;
	}
	
// //测试
// 	$sql = "SELECT * FROM crop_info";  
// 	$result = mysqli_query($db,$sql);  
// 	if (!$result) {
// 	    printf("Error: %s\n", mysqli_error($db));
// 	    exit();
// 	}


// 	$jarr = array();
// 	while ($rows=mysqli_fetch_array($result,MYSQL_ASSOC)){
// 	    $count=count($rows);//不能在循环语句中，由于每次删除 row数组长度都减小  
// 	    for($i=0;$i<$count;$i++){  
// 	        unset($rows[$i]);//删除冗余数据  
// 	    }
// 	    array_push($jarr,$rows);
// 	}
// 	print_r($jarr);//查看数组
// 	echo "<br/>";
	 
// 	echo '<hr>';

// 	echo '编码后的json字符串：';
// 	echo $str=json_encode($jarr);//将数组进行json编码
// 	echo '<br>';
// 	$arr=json_decode($str);//再进行json解码
// 	echo '解码后的数组：';
// 	print_r($arr);//打印解码后的数组，数据存储在对象数组中
	
?>