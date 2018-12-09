//Ajax
var address = "http://123.56.0.11/api/";
function myAjax(url, method, data, success) {
  $.ajax({
    url: address + url,
    type:method,
    dataType:'json',
    data:data,
    success: function(data) {
      if(typeof(success)!=="function") return;
      success(data);
    },
    error:function(e){
      if(e.status == 200){
        console.log("200 ajax error");
      }else{
        console.log(e.status);
      }
    }
  })
}

function precsion(num){
  num = num.toFixed(2);
  if(num.slice(-1)=="0") num = num.slice(0,-1);
  if(num.slice(-1)=="0") num = num.slice(0,-2);
  return num;
}
