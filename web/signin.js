$("form").submit(function(e){
	e.preventDefault();
	var email = $("#inputEmail").val();
	var password = $("#inputPassword").val();
	
	myAjax("usr/checkusr.php", "POST", {"email": email, "password": password}, function(data){
		console.log(data);
	});	
	// alert("Submitted");
});




