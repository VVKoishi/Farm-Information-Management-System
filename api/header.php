<?php
	header('Access-Control-Allow-Origin:*');//跨域
	header('Content-type: application/json; charset=UTF8');
	//数据库连接
	$db = new mysqli('localhost','*','*','internet_plus');
	if (mysqli_connect_errno()) {
		echo "Error: Could not connect to database. Please try again later.";
		exit;
	}
	mysql_query('set names utf8');
?>
