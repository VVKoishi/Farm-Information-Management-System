//维护对象 *插入会更新对象，删改现在也会
var plot = [];
var crop = [];
var plant = [];
//对象映射 *插入会更新映射，删改现在也会
var plot_map = [];//id->{name,area}
var crop_map = [];//id->{name,num,area,profit,cycle}
var plant_map = [];//id->[{id,num}]
var plant_map_from_crop = [];//id->[{id,num}]
var classRepeat = ["progress-bar-success","progress-bar-warning","progress-bar-danger","progress-bar-info"];//颜色交替
function mapping(str){//插入及删改都会去调用select_plant
    if(str == "plot"){
        var not_first = 0;
        if(plot_map.length){
            plot_map = [];
            not_first = 1;
        }
        for(var i=0; i<plot.length; i++){
            var id = plot[i].plot_id;
            var name = plot[i].plot_name;
            var area = plot[i].plot_area;
            plot_map[id] = {"name":name,"area":area};
        }
        if(not_first==1) select_plant();//非首次进入
    }
    else if(str == "crop"){
        var not_first = 0;
        if(crop_map.length){
            crop_map = [];
            not_first = 1;
        }
        for(var i=0; i<crop.length; i++){
            var id = crop[i].crop_id;
            var name = crop[i].crop_name;
            var num = crop[i].crop_num;
            var area = crop[i].crop_area;
            var profit = crop[i].crop_profit;
            var cycle = crop[i].crop_cycle;
            crop_map[id] = {"name":name,"num":num,"area":area,"profit":profit,"cycle":cycle};
        }
        if(not_first==1) select_plant();//非首次进入
    }
    else if(str == "plant"){
        plant.sort(cmp_plant);
        plant_map = [];
        for(var i=0; i<plant.length; ){
            plot_id = plant[i].plot_id;
            next = plant[i].plot_id;
            plant_map[plot_id] = [];
            while(next == plot_id){
                plant_map[plot_id].push({"id":plant[i].crop_id,"num":plant[i].plant_num});
                i++;
                if(i>=plant.length) { 
                    break;
                }
                next = plant[i].plot_id;
            }
        }
        for(var i=0; i<plot.length; i++){
            if(!plant_map[plot[i].plot_id]) plant_map[plot[i].plot_id] = [];
        }
        plant.sort(cmp_plant_from_crop);
        plant_map_from_crop = [];
        for(var i=0; i<plant.length; ){
            crop_id = plant[i].crop_id;
            next = plant[i].crop_id;
            plant_map_from_crop[crop_id] = [];
            while(next == crop_id){
                plant_map_from_crop[crop_id].push({"id":plant[i].plot_id,"num":plant[i].plant_num});
                i++;
                if(i>=plant.length) { 
                    break;
                }
                next = plant[i].crop_id;
            }
        }
        for(var i=0; i<crop.length; i++){
            if(!plant_map_from_crop[crop[i].crop_id]) plant_map_from_crop[crop[i].crop_id] = [];
        }
    }
}
function getRemain(){//return id->remain
    var rem = [];
    for(var i=0; i<crop_map.length; i++){
        if(!crop_map[i]) continue;
        var all = 0;
        for(var j=0; j<plant_map_from_crop[i].length; j++){
            all += parseInt(plant_map_from_crop[i][j].num);
        }
        rem[i] = crop_map[i].num - all;
    }
    return rem;
}
function alreadyHave(plot_id, crop_id){
    if(!plant_map[plot_id]) return false;
    for(var j=0; j<plant_map[plot_id].length; j++){
        if(plant_map[plot_id][j].id == crop_id) return true;
    }
    return false;
}
function getTotalPercent(plot_id){
    var total_percent = 0;
    for(var i=0; i<plant_map[plot_id].length; i++){
        var percent = plant_map[plot_id][i].num * crop_map[plant_map[plot_id][i].id].area / plot_map[plot_id].area *100;
        total_percent += percent;
    }
    return total_percent;
}
function cmp_plant(a,b){//plant重排
    if(parseInt(a.plot_id) < parseInt(b.plot_id)) return -1;
    else if (parseInt(a.plot_id) > parseInt(b.plot_id)) return 1;
    else {
        if(parseInt(a.crop_id) < parseInt(b.crop_id)) return -1;
        else if (parseInt(a.crop_id) > parseInt(b.crop_id)) return 1;
        else console.log("排序出错，发现重复项");
    }
}
function cmp_plant_from_crop(a,b){//plant_from_crop重排
    if(parseInt(a.crop_id) < parseInt(b.crop_id)) return -1;
    else if (parseInt(a.crop_id) > parseInt(b.crop_id)) return 1;
    else {
        if(parseInt(a.plot_id) < parseInt(b.plot_id)) return -1;
        else if (parseInt(a.plot_id) > parseInt(b.plot_id)) return 1;
        else console.log("排序出错，发现重复项");
    }
}
function check_flow(plot_id){//total percent check
    var total_percent = 0;
    for(var i=0; i<plant_map[plot_id].length; i++){
        var row = $("#plant_table"+plot_id+" tr:eq("+i+")");//该行
        row.removeClass("danger");
        var str = row.find(".percent").html();
        var index = str.indexOf("㎡");
        var area = str.slice(0,index);
        
        var percent = area/plot_map[plot_id].area *100;
        total_percent += percent;
        if(total_percent > 100){
            row.addClass("danger");
        }
    }
    redAndGreen();
}
function re_key(plot_id){//进度条重排
    for(var i=0; i<plant_map[plot_id].length; i++){
        $("#progress"+plot_id+" div:eq("+ i +")").attr("class","progress-bar "+ classRepeat[i%4] +" progress-bar-striped");
    }
}
function getTotalProfit(plot_id){
    total_profit = 0;
    for(var j=0; j<plant_map[plot_id].length; j++){
        total_profit += plant_map[plot_id][j].num * crop_map[plant_map[plot_id][j].id].profit;//循环加和
    }
    return total_profit;
}
function cmp_rate(a,b){
    if(a.rate!=b.rate) return a.rate<b.rate;
    else return crop_map[a.crop_id].cycle > crop_map[b.crop_id].cycle;
}
function getBest(plot_id){// return [{id,num}]
    var best = [];
    var rate_arr = [];
    var rem = getRemain();

    for(var i=0; i<plant_map[plot_id].length; i++){
        if(!rem[plant_map[plot_id][i].id]) rem[plant_map[plot_id][i].id]=0;
        rem[plant_map[plot_id][i].id] += parseInt(plant_map[plot_id][i].num); //加上原来已有的
    }

    for(var i=0; i<crop_map.length; i++){
        if(!crop_map[i]) continue;
        rate_arr.push({"rate":crop_map[i].profit/crop_map[i].area,"crop_id":i});
    }
    rate_arr.sort(cmp_rate);
    var total_area = 0;
    // console.log(rem);
    for(var i=0; i<rate_arr.length; i++){
        if(total_area >= plot_map[plot_id].area) break;//若足够面积则跳出
           
        if(rem[rate_arr[i].crop_id] > 0){//留存>0
            
            var crop_id = rate_arr[i].crop_id;
            
            if(rem[crop_id]*crop_map[crop_id].area + total_area <= plot_map[plot_id].area){
                best.push({"id":crop_id,"num":rem[crop_id]});
                total_area += rem[crop_id]*crop_map[crop_id].area;
            }
            else if(total_area<plot_map[plot_id].area){
                var num = Math.floor((plot_map[plot_id].area - total_area)/crop_map[crop_id].area);
                if(num>0) best.push({"id":crop_id,"num":num});
                total_area += num*crop_map[crop_id].area;
            }
        }
        
    }
    return best;
}


//获取内容函数
var dtd1 = $.Deferred();//plot监测
var dtd2 = $.Deferred();//crop监测
function select_plot(){
    myAjax("plot_info/select_plot.php", "POST", {}, function(data){
        // console.log(data);
        plot = data;
        mapping("plot");
        dtd1.resolve(); // 改变Deferred对象的执行状态

        var table = $("#plot_info");
        var tableList = "";
        for(var i=0; i<data.length; i++){
            tableList += "<tr><td>"+data[i].plot_id+"</td><td>"+data[i].plot_name+"</td><td>"
                +data[i].plot_area+"</td><td>"+data[i].plot_description+"</td><td>"
                +"<div style='width:91px;' class='btn-group' role='group' aria-label='...'>"
                +"<button id='update_plot"+data[i].plot_id+"' type='button' class='btn btn-primary btn-sm'>更改</button>"
                +"<button id='delete_plot"+data[i].plot_id+"' type='button' class='btn btn-danger btn-sm'>删除</button></div></td></tr>";
                //包含更改删除按钮
        }
        table.empty()
            .append(tableList);//清空并添加至DOM树
        //更改和删除菜地（生成后绑定）
        for(var i=0; i<data.length; i++){
            //更新代码块
            $("#update_plot"+data[i].plot_id).click(function(){
                var plot_id = $(this).attr("id").slice(11);
                var childList = $(this).parents("tr").children();//该行所有<td>
                //可修改区
                var plot_name = childList.eq(1);
                var plot_area = childList.eq(2);
                var plot_description = childList.eq(3);
                //预存值
                var plot_name_value = plot_name.html();
                var plot_area_value = plot_area.html();
                var plot_description_value = plot_description.html();
                //显示修改文本框
                plot_name.html("<input type='text' class='form-control' placeholder='菜地名称' value='"+plot_name_value+"'>");
                plot_area.html("<input type='text' class='form-control' placeholder='菜地面积' value='"+plot_area_value+"'>");
                plot_description.html("<input type='text' class='form-control' placeholder='菜地描述' value='"+plot_description_value+"'>");
                childList.eq(4).find(".btn-primary").addClass("hidden");//隐藏更改按钮
                //添加临时确认按钮，确认后删除
                childList.eq(4).children().prepend("<button id='decide_plot"+plot_id+"' type='button' class='btn btn-success btn-sm'>确认</button>");
                childList.eq(4).find(".btn-success").click(function(){
                    var plot_id = $(this).attr("id").slice(11);
                    var childList = $(this).parents("tr").children();//该行所有<td>
                    //可修改区
                    var plot_name = childList.eq(1);
                    var plot_area = childList.eq(2);
                    var plot_description = childList.eq(3);
                    //获取值
                    var plot_name_value = plot_name.find("input").val();
                    var plot_area_value = plot_area.find("input").val();
                    var plot_description_value = plot_description.find("input").val();
                    //发送数据库
                    myAjax("plot_info/update_plot.php", "POST", {"plot_id":plot_id,"plot_name":plot_name_value,"plot_area":plot_area_value,"plot_description":plot_description_value}, 
                        function(data){
                            // console.log(data);
                    });
                    //放回值
                    plot_name.html(plot_name_value);
                    plot_area.html(plot_area_value);
                    plot_description.html(plot_description_value);
                    //更新对象
                    for(var i=0; i<plot.length; i++){
                        if(plot[i].plot_id==plot_id){
                            plot[i].plot_name = plot_name_value;
                            plot[i].plot_area = plot_area_value;
                            plot[i].plot_description = plot_description_value;
                            mapping("plot");
                            break;
                        }
                    }
                    $(this).remove();//删除自身
                    childList.eq(4).find(".btn-primary").removeClass("hidden");//显示更改按钮
                });
                    
            });
            //删除代码块
            $("#delete_plot"+data[i].plot_id).click(function(){
                var plot_id = $(this).attr("id").slice(11);
                var ok = confirm("确认删除"+plot_id+"."+plot_map[plot_id].name);
                if(ok == false) return;
                myAjax("plot_info/delete_plot.php", "POST", {"plot_id":plot_id}, function(data){
                    // console.log(data);
                });
                //更新对象
                for(var i=0; i<plant.length; i++){
                    if(plant[i].plot_id==plot_id){
                        plant.splice(i,1);
                    }
                }
                mapping("plant");
                for(var i=0; i<plot.length; i++){
                    if(plot[i].plot_id==plot_id){
                        plot.splice(i,1);
                        mapping("plot");
                        break;
                    }
                }
                $(this).parents("tr").remove();//删除此行
            });
        }
        
    });
}
function select_crop(){
    myAjax("crop_info/select_crop.php", "POST", {}, function(data){
        // console.log(data);
        crop = data;
        mapping("crop");
        dtd2.resolve(); // 改变Deferred对象的执行状态

        var table = $("#crop_info");
        var tableList = "";
        for(var i=0; i<data.length; i++){
            tableList += "<tr><td>"+data[i].crop_id+"</td><td>"+data[i].crop_name+"</td><td>"
                +data[i].crop_num+"</td><td>"+data[i].crop_area+"</td><td>"+data[i].crop_cycle+"</td><td>"
                +data[i].crop_profit+"</td><td>"+data[i].crop_description+"</td><td>"
                +"<div style='width:91px;' class='btn-group' role='group' aria-label='...'>"
                +"<button id='update_crop"+data[i].crop_id+"' type='button' class='btn btn-primary btn-sm'>更改</button>"
                +"<button id='delete_crop"+data[i].crop_id+"' type='button' class='btn btn-danger btn-sm'>删除</button></div></td></tr>";
                //包含更改删除按钮
        }
        table.empty()
            .append(tableList);//清空并插入DOM树
        //更改和删除作物（生成后绑定）
        for(var i=0; i<data.length; i++){
            //更新代码块
            $("#update_crop"+data[i].crop_id).click(function(){
                var crop_id = $(this).attr("id").slice(11);
                var childList = $(this).parents("tr").children();//该行所有<td>
                //可修改区
                var crop_name = childList.eq(1);
                var crop_num = childList.eq(2);
                var crop_area = childList.eq(3);
                var crop_cycle = childList.eq(4);
                var crop_profit = childList.eq(5);
                var crop_description = childList.eq(6);
                //预存值
                var crop_name_value = crop_name.html();
                var crop_num_value = crop_num.html();
                var crop_area_value = crop_area.html();
                var crop_cycle_value = crop_cycle.html();
                var crop_profit_value = crop_profit.html();
                var crop_description_value = crop_description.html();
                //显示修改文本框
                crop_name.html("<input type='text' class='form-control' placeholder='作物名称' value='"+crop_name_value+"'>");
                crop_num.html("<input type='text' class='form-control' placeholder='作物数量' value='"+crop_num_value+"'>");
                crop_area.html("<input type='text' class='form-control' placeholder='单棵面积' value='"+crop_area_value+"'>");
                crop_cycle.html("<input type='text' class='form-control' placeholder='种植周期' value='"+crop_cycle_value+"'>");
                crop_profit.html("<input type='text' class='form-control' placeholder='单棵净收益' value='"+crop_profit_value+"'>");
                crop_description.html("<input type='text' class='form-control' placeholder='作物描述' value='"+crop_description_value+"'>");
                childList.eq(7).find(".btn-primary").addClass("hidden");//隐藏更改按钮
                //添加临时确认按钮，确认后删除
                childList.eq(7).children().prepend("<button id='decide_crop"+crop_id+"' type='button' class='btn btn-success btn-sm'>确认</button>");
                childList.eq(7).find(".btn-success").click(function(){
                    var crop_id = $(this).attr("id").slice(11);
                    var childList = $(this).parents("tr").children();//该行所有<td>
                    //可修改区
                    var crop_name = childList.eq(1);
                    var crop_num = childList.eq(2);
                    var crop_area = childList.eq(3);
                    var crop_cycle = childList.eq(4);
                    var crop_profit = childList.eq(5);
                    var crop_description = childList.eq(6);
                    //获取值
                    var crop_name_value = crop_name.find("input").val();
                    var crop_num_value = crop_num.find("input").val();
                    var crop_area_value = crop_area.find("input").val();
                    var crop_cycle_value = crop_cycle.find("input").val();
                    var crop_profit_value = crop_profit.find("input").val();
                    var crop_description_value = crop_description.find("input").val();
                    //发送数据库
                    myAjax("crop_info/update_crop.php", "POST", 
                        {"crop_id":crop_id,"crop_name":crop_name_value,"crop_num":crop_num_value,"crop_area":crop_area_value,"crop_cycle":crop_cycle_value,"crop_profit":crop_profit_value,"crop_description":crop_description_value}, 
                        function(data){
                            // console.log(data);
                    });
                    //放回值
                    crop_name.html(crop_name_value);
                    crop_num.html(crop_num_value);
                    crop_area.html(crop_area_value);
                    crop_cycle.html(crop_cycle_value);
                    crop_profit.html(crop_profit_value);
                    crop_description.html(crop_description_value);
                    //更新对象
                    for(var i=0; i<crop.length; i++){
                        if(crop[i].crop_id==crop_id){
                            crop[i].crop_name = crop_name_value;
                            crop[i].crop_num = crop_num_value;
                            crop[i].crop_area = crop_area_value;
                            crop[i].crop_cycle = crop_cycle_value;
                            crop[i].crop_profit = crop_profit_value;
                            crop[i].crop_description = crop_description_value;
                            mapping("crop");
                            break;
                        }
                    }
                    $(this).remove();//删除自身
                    childList.eq(7).find(".btn-primary").removeClass("hidden");//显示更改按钮
                });
                    
            });
            //删除代码块
            $("#delete_crop"+data[i].crop_id).click(function(){
                var crop_id = $(this).attr("id").slice(11);
                var ok = confirm("确认删除"+crop_id+"."+crop_map[crop_id].name);
                if(ok == false) return;
                myAjax("crop_info/delete_crop.php", "POST", {"crop_id":crop_id}, function(data){
                    // console.log(data);
                });
                //更新对象
                for(var i=0; i<plant.length; i++){
                    if(plant[i].crop_id==crop_id){
                        plant.splice(i,1);
                    }
                }
                mapping("plant");
                for(var i=0; i<crop.length; i++){
                    if(crop[i].crop_id==crop_id){
                        crop.splice(i,1);
                        mapping("crop");
                        break;
                    }
                }
                $(this).parents("tr").remove();
            });
        }
        
    });
}
//画图函数
function makeCharts(plot_id, plot_name, plot_area, crop_name_arr, crop_name_num_arr){
    //空缺处理
    var addon=0;
    for(var i=0; i<crop_name_num_arr.length; i++){
        addon += crop_name_num_arr[i].value;
    }
    if(addon < plot_area){
        var str = "空地";
        var area = plot_area - addon;
        crop_name_arr.push(str);
        crop_name_num_arr.push({"value":area,"name":str});
    }
    //创建DOM
    if(!$("#chart"+plot_id).length)//如果已经存在就不要再添加了，不存在才添加
    $("#pie_charts_set").append("<div class='col-md-4' style='height: 250px;' id='chart"+plot_id+"'></div>");
    var dom = document.getElementById("chart"+plot_id);
    var myChart = echarts.init(dom);
    option = null;
    option = {
        title : {
            text: plot_name,
            subtext: '面积：'+plot_area+'㎡',
            x:'center'
        },
        tooltip : {
            trigger: 'item',
            formatter: "{b} : {c}㎡ ({d}%)"
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            data: crop_name_arr
        },
        series : [
            {
                name: '种植比例',
                type: 'pie',
                radius : '55%',
                center: ['50%', '60%'],
                data: crop_name_num_arr,
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };
    if (option && typeof option === "object") {
        myChart.setOption(option, true);
    }
}
//获取图表函数
function select_plant(){//只ajax一次，本地维护对象
    if(plant.length){
        select_plant_content(plant);
        return;
    }
    myAjax("plant_info/select_plant.php", "POST", {}, function(data){
        // console.log(data);
        plant = data;
        select_plant_content(data);
    });
}
function select_plant_content(data){
    mapping("plant");
    after_select_plant();//I'm here!
    //预定义
    var plot_id;
    var next;
    var plot_name = '';
    var plot_area = 0;
    var crop_name_arr = [];
    var crop_name_num_arr = [];
    //遍历画图
    data.sort(cmp_plant);
    for(var i=0; ; ){
        plot_id = data[i].plot_id;
        next = data[i].plot_id;
        var total_area = 0;
        while(next == plot_id){
            plot_name = plot_map[plot_id].name;
            plot_area = plot_map[plot_id].area;
            var crop_id = data[i].crop_id;
            total_area += data[i].plant_num * crop_map[crop_id].area;
            if(total_area<=plot_area){
                crop_name_arr.push(crop_map[crop_id].name);
                crop_name_num_arr.push({"value":data[i].plant_num * crop_map[crop_id].area,"name":crop_map[crop_id].name});
            }
            
            i++;
            if(i>=data.length) {
                makeCharts(plot_id, plot_name, plot_area, crop_name_arr, crop_name_num_arr);
                return;
            }
            next = data[i].plot_id;
        }
        makeCharts(plot_id, plot_name, plot_area, crop_name_arr, crop_name_num_arr);
        crop_name_arr = [];
        crop_name_num_arr = [];
    }
    //注意程序不会执行到这里，因为return
}
//种植方案模块生成函数
function after_select_plant(){
    var chunk = '';//DOM
    for(var i=0; i<plant_map.length||i<plot_map.length; i++){
        if(!plot_map[i]) continue;
        //初始定义
        var key = 0;
        var total_profit = 0;
        var total_percent = 0;
        //单模块头
        chunk += "<div style='margin-bottom: 60px;' class='placeholder'>"
            +"<h3>"+ plot_map[i].name +" <small>"+ plot_map[i].area +"㎡</small></h3>"
            +"<div id='progress"+ i +"' style='height:28px;' class='progress'>";
        //循环遍历作物数组 这是进度条部分
        if(plant_map[i]){
            for(var j=0; j<plant_map[i].length; j++){
                total_profit += plant_map[i][j].num * crop_map[plant_map[i][j].id].profit;//循环加和
                var percent = ((plant_map[i][j].num * crop_map[plant_map[i][j].id].area / plot_map[i].area)*100);//所占百分比
                chunk += "<div id='progress"+ i +"_"+ plant_map[i][j].id +"' class='progress-bar "+ classRepeat[key] +" progress-bar-striped' style='width: "+ precsion(percent) +"%'>"
                    +"<span>"+ precsion(percent) +"% "+ crop_map[plant_map[i][j].id].name +"</span>"
                    +"</div>";
                key++;
                if(key>=classRepeat.length) key=0;//循环控制
            }
        }
        //单模块中
        chunk += "</div><h4><span id='plant_table_show"+ i +"' class='glyphicon glyphicon-chevron-right dropmenu'></span>"
            +"预期收益：￥<span id='total_profit"+ i +"'>"+ precsion(total_profit) +"</span>"
            +"<button id='best_profit"+ i +"' type='button' class='btn btn-warning btn-sm best-profit'>推荐</button></h4>"
            +"<div id='plant_table_main"+ i +"' style='display: none; margin-top:20px; text-align:left;' class='table-responsive'>"
            +"<table class='table table-hover'>"
            +"<thead><tr><th><span class='glyphicon glyphicon-tag'></span></th><th>作物名称</th><th>种植数量</th><th>种植面积</th><th>种植周期</th><th>净收益</th></tr>"
            +"</thead><tbody id='plant_table"+ i +"'>";
        if(plant_map[i]){//如果有种植信息，则轮询添加作物 这是表部分
            for(var k=0; k<plant_map[i].length; k++){
                var percent = ((plant_map[i][k].num * crop_map[plant_map[i][k].id].area / plot_map[i].area)*100);//所占百分比
                total_percent += percent;
                if(total_percent > 100) chunk += "<tr id='update_plant"+ i +"_"+ plant_map[i][k].id +"' data-toggle='modal' data-target='#myModal' class='danger'>";//溢出则变红
                else chunk += "<tr id='update_plant"+ i +"_"+ plant_map[i][k].id +"' data-toggle='modal' data-target='#myModal'>";
                chunk += "<td><span id='delete_plant"+ i +"_"+ plant_map[i][k].id +"' class='glyphicon glyphicon-remove'></span></td>"
                    +"<td>"+ crop_map[plant_map[i][k].id].name +"</td>"
                    +"<td>"+ plant_map[i][k].num +"</td>"
                    +"<td class='percent'>"+ precsion(plant_map[i][k].num * crop_map[plant_map[i][k].id].area) +"㎡ ("+ precsion(percent) +"%)</td>"
                    +"<td>"+ crop_map[plant_map[i][k].id].cycle +"年</td>"
                    +"<td>￥"+ precsion(plant_map[i][k].num * crop_map[plant_map[i][k].id].profit) +"</td>"
                    +"</tr>";
            }
        }
        //最后一行插入一个加号 insert_plant
        chunk += "<tr id='insert_plant"+ i +"' data-toggle='modal' data-target='#myModal'>"
            +"<td><span class='glyphicon glyphicon-plus green'></span></td>"
            +"<td></td>"
            +"<td></td>"
            +"<td></td>"
            +"<td></td>"
            +"<td></td>"
            +"</tr>";
        //单模块尾
        chunk += "</tbody></table></div>"
            +"</div>";
    }
    $("#plant_info").empty()
        .append(chunk);//插入DOM
    //展开方案表toggle 及 插入方案 删改方案
    for(var i=0; i<plant_map.length||i<plot_map.length; i++){
        if(!plot_map[i]) continue;
        //小三角展开方案表
        $("#plant_table_show"+i).click(function(){
            var i = $(this).attr("id").slice(16);
            if($(this).hasClass("glyphicon-chevron-right")){
                $(this).removeClass("glyphicon-chevron-right")
                    .addClass("glyphicon-chevron-down");
            } else {
                $(this).removeClass("glyphicon-chevron-down")
                    .addClass("glyphicon-chevron-right");
            }
            $("#plant_table_main"+i).slideToggle("fast");
        });
        //最优方案推荐
        $("#best_profit"+i).click(function(){
            var plot_id = $(this).attr("id").slice(11);
            
            var best = getBest(plot_id);

            var now_profit = getTotalProfit(plot_id);
            var new_profit = 0;
            for(var i=0; i<best.length; i++){
                new_profit += crop_map[best[i].id].profit * best[i].num;
            }
            
            var ok = confirm("确认更改"+plot_id+"."+plot_map[plot_id].name+"的方案\n当前总收益:￥"+now_profit+"\n更改后总收益:￥"+new_profit);
            if(ok == false) return;

            while(plant_map[plot_id].length>0){
                $("#plant_table"+plot_id+" .glyphicon-remove").trigger("click");
            }
            
            for(var i=0; i<best.length; i++){
                decide_insert_plant_content(plot_id,best[i].id,best[i].num);
            }

        });
        //插入方案
        $("#insert_plant"+i).click(function(e){
            var plot_id = $(this).attr("id").slice(12);
            var header = $("#myModal .modal-header h4");
            var body = $("#myModal .modal-body");
            
            header.html(plot_map[plot_id].name+": 添加");//header
            header.attr("plot_id",plot_id);//将plot_id放到header中
            $("#myModal .modal-body .dropdown button").html("选择作物 <span class='caret'></span>");//初始化选择框
            $("#after_dropdown").css("display","none");
            $("#myModal #decide").attr("disabled","disabled");

            var menu = getRemain();//获取剩余可分配额
            var menu_str = "";
            // console.log(menu);
            for(var i=0; i<menu.length; i++){
                if(!crop_map[i]) continue;
                if(alreadyHave(plot_id, i)) continue;
                if(!menu[i]) menu_str += "<li class='disabled'><a>"+ crop_map[i].name +"</a></li>";
                else menu_str += "<li id='set"+ i +"'><a>"+ crop_map[i].name +"</a></li>";
            }
            //插入DOM
            body.find(".dropdown-menu").empty()
                .append(menu_str);
            
            //绑定模态框 *模态框部分
            for(var i=0; i<menu.length; i++){
                if(!crop_map[i]) continue;
                //下拉菜单每项绑定
                body.find("#set"+i).click(function(){
                    //绑定事件中，失去上级变量，变量需重新获取
                    var rem = getRemain();
                    var crop_id = $(this).attr("id").slice(3);
                    var after_dropdown = $("#after_dropdown");//选择作物后展开的部分
                    $("#myModal .modal-body .dropdown button").html($(this).html()+" <span class='caret'></span>");//选择框切换到选择的值

                    after_dropdown.find("input").attr({"max":rem[crop_id],"id":"shift_num"+crop_id})//滑条设定ID和最大值
                        .next().html(" "+rem[crop_id])//右侧最大值的文本
                    
                    //预输入
                    var now = after_dropdown.find("input").val();//目前值
                    var plot_id = $("#myModal .modal-header h4").attr("plot_id");
                    var area = precsion(now * crop_map[crop_id].area);
                    var percent = precsion(area / plot_map[plot_id].area * 100);
                    var profit = precsion(now * crop_map[crop_id].profit);
                    //插入值
                    $("#dd_id").html("ID："+crop_id);
                    $("#dd_num").html("数量："+now);
                    $("#dd_area").html("面积："+ area +"㎡ ("+ percent +"%)");
                    $("#dd_cycle").html("周期："+crop_map[crop_id].cycle+"年");
                    $("#dd_profit").html("净收益：￥"+profit);
                    after_dropdown.find("input").change(function(){//滑动变化绑定
                        var now = $(this).val();//当前值
                        var crop_id = $(this).attr("id").slice(9);
                        var plot_id = $("#myModal .modal-header h4").attr("plot_id");
                        var area = precsion(now * crop_map[crop_id].area);
                        var percent = precsion(area / plot_map[plot_id].area * 100);
                        var profit = precsion(now * crop_map[crop_id].profit);
                        //变动值
                        $("#dd_num").html("数量："+now);
                        $("#dd_area").html("面积："+area+"㎡ ("+ percent +"%)");
                        $("#dd_profit").html("净收益：￥"+profit);
                    });

                    after_dropdown.slideDown("fast");//显示
                    $("#myModal #decide").removeAttr("disabled");

                    //确认按钮
                    $("#myModal #decide").unbind().click(function(){
                        var set = $("#myModal .modal-body .dropdown button").html();
                        if(set == "选择作物 <span class='caret'></span>") return false;
                        var plot_id = $("#myModal .modal-header h4").attr("plot_id");
                        var crop_id = $("#dd_id").text().slice(3);
                        var plant_num = $("#dd_num").text().slice(3);
                        decide_insert_plant_content(plot_id, crop_id, plant_num);
                    });

                });
            }
        });
        //删改方案
        if(plant_map[i]){//对非空菜地
            for(var j=0; j<plant_map[i].length; j++){//每行的作物
                delete_and_update_plant(i,plant_map[i][j].id);
            }
        }
    }
    redAndGreen();

}
function redAndGreen(){
    //叉叉变红
    $(".glyphicon-remove").mouseover(function(){
        $(this).attr("style","color:red;");
    }).mouseout(function(){
        $(this).attr("style","");
    });
    //加号变绿
    $(".green").mouseover(function(){
        $(this).attr("style","color:green;");
    }).mouseout(function(){
        $(this).attr("style","");
    });
}
function decide_insert_plant_content(plot_id, crop_id, plant_num){
    myAjax("plant_info/insert_plant.php", "POST", {"plot_id":plot_id,"crop_id":crop_id,"plant_num":plant_num}, function(data){
        // console.log(data);
    });
    //更新对象和界面
    plant.push({"plot_id":plot_id,"crop_id":crop_id,"plant_num":plant_num});
    
    mapping("plant");

    var percent = ((plant_num * crop_map[crop_id].area / plot_map[plot_id].area)*100);//所占百分比
    var total_percent = getTotalPercent(plot_id);
    var chunk = '';
    var chunk2 = '';
    if(total_percent > 100) chunk += "<tr id='update_plant"+ plot_id +"_"+ crop_id +"' data-toggle='modal' data-target='#myModal' class='danger'>";//溢出则变红
    else chunk += "<tr id='update_plant"+ plot_id +"_"+ crop_id +"' data-toggle='modal' data-target='#myModal'>";
    chunk += "<td><span id='delete_plant"+ plot_id +"_"+ crop_id +"' class='glyphicon glyphicon-remove'></span></td>"
        +"<td>"+ crop_map[crop_id].name +"</td>"
        +"<td>"+ plant_num +"</td>"
        +"<td class='percent'>"+ precsion(plant_num * crop_map[crop_id].area) +"㎡ ("+ precsion(percent) +"%)</td>"
        +"<td>"+ crop_map[crop_id].cycle +"年</td>"
        +"<td>￥"+ precsion(plant_num * crop_map[crop_id].profit) +"</td>"
        +"</tr>";
    $("#plant_table"+plot_id+" #insert_plant"+plot_id).before(chunk);//插入行
    chunk2 += "<div id='progress"+ plot_id +"_"+ crop_id +"' class='progress-bar "+ classRepeat[plant_map[plot_id].length%4-1] +" progress-bar-striped' style='width: "+ precsion(percent) +"%'>"
        +"<span>"+ precsion(percent) +"% "+ crop_map[crop_id].name +"</span>"
        +"</div>";
    $("#progress"+plot_id).append(chunk2);//插入进度条
    delete_and_update_plant(plot_id,crop_id);
    $("#total_profit"+plot_id).html(precsion(getTotalProfit(plot_id)));
    re_key(plot_id);
    check_flow(plot_id);
}

function delete_and_update_plant(plot_id, crop_id){
    //删除方案
    $("#delete_plant"+plot_id+"_"+crop_id).click(function(e){
        e.stopPropagation();//阻止点击事件向上冒泡
        var mix = $(this).attr("id").slice(12).split("_");
        var plot_id = mix[0];
        var crop_id = mix[1];
        myAjax("plant_info/delete_plant.php", "POST", {"plot_id":plot_id,"crop_id":crop_id}, function(data){
            // console.log(data);
        });
        for(var i=0; i<plant.length; i++){
            if(plant[i].plot_id==plot_id&&plant[i].crop_id==crop_id){
                plant.splice(i,1);
                mapping("plant");
                break;
            }
        }
        $("#progress"+plot_id+"_"+crop_id).remove();//删除进度条
        $(this).parents("tr").remove();//删除此行
        check_flow(plot_id);
        re_key(plot_id);
        $("#total_profit"+plot_id).html(precsion(getTotalProfit(plot_id)));
    });
    //修改方案
    $("#update_plant"+plot_id+"_"+crop_id).click(function(){
        var mix = $(this).attr("id").slice(12).split("_");
        var plot_id = mix[0];
        var crop_id = mix[1];
        var header = $("#myModal .modal-header h4");
        var body = $("#myModal .modal-body");
        
        header.html(plot_map[plot_id].name+": 更改");//header
        header.attr({"plot_id":plot_id,"crop_id":crop_id});//将plot_id,crop_id放到header中
        $("#myModal .modal-body .dropdown button").html(crop_map[crop_id].name+" <span class='caret'></span>");//初始化选择框
        $("#after_dropdown").slideDown("fast");
        $("#myModal #decide").removeAttr("disabled");

        var menu = getRemain();//获取剩余可分配额
        var menu_str = "";
        
        for(var i=0; i<plant_map[plot_id].length; i++){
            menu[plant_map[plot_id][i].id] += parseInt(plant_map[plot_id][i].num);//加上原来有的数量为可分配数量
        }
        
        //console.log(menu);
        for(var i=0; i<menu.length; i++){
            if(!crop_map[i]) continue;
            if(alreadyHave(plot_id, i)&&crop_id != i) continue;
            if(!menu[i]) menu_str += "<li class='disabled'><a>"+ crop_map[i].name +"</a></li>";
            else menu_str += "<li id='set"+ i +"'><a>"+ crop_map[i].name +"</a></li>";
        }
        //插入DOM
        body.find(".dropdown-menu").empty()
            .append(menu_str);

        //绑定模态框 *模态框部分
        for(var i=0; i<menu.length; i++){
            if(!crop_map[i]) continue;
            //下拉菜单每项绑定
            body.find("#set"+i).click(function(){
                //绑定事件中，失去上级变量，变量需重新获取
                var rem = getRemain();
                var crop_id = $(this).attr("id").slice(3);
                var after_dropdown = $("#after_dropdown");//选择作物后展开的部分
                //预输入
                var now = after_dropdown.find("input").val();//目前值
                var plot_id = $("#myModal .modal-header h4").attr("plot_id");
                var area = precsion(now * crop_map[crop_id].area);
                var percent = precsion(area / plot_map[plot_id].area * 100);
                var profit = precsion(now * crop_map[crop_id].profit);

                for(var i=0; i<plant_map[plot_id].length; i++){
                    rem[plant_map[plot_id][i].id] += parseInt(plant_map[plot_id][i].num);//加上原来有的数量为可分配数量
                }

                
                $("#myModal .modal-body .dropdown button").html($(this).html()+" <span class='caret'></span>");//选择框切换到选择的值

                after_dropdown.find("input").attr({"max":rem[crop_id],"id":"shift_num"+crop_id})//滑条设定ID和最大值
                    .next().html(" "+rem[crop_id])//右侧最大值的文本
                
                
                //插入值
                $("#dd_id").html("ID："+crop_id);
                $("#dd_num").html("数量："+now);
                $("#dd_area").html("面积："+ area +"㎡ ("+ percent +"%)");
                $("#dd_cycle").html("周期："+crop_map[crop_id].cycle+"年");
                $("#dd_profit").html("净收益：￥"+profit);
                after_dropdown.find("input").unbind().change(function(){//滑动变化绑定
                    var now = $(this).val();//当前值
                    var crop_id = $(this).attr("id").slice(9);
                    var plot_id = $("#myModal .modal-header h4").attr("plot_id");
                    var area = precsion(now * crop_map[crop_id].area);
                    var percent = precsion(area / plot_map[plot_id].area * 100);
                    var profit = precsion(now * crop_map[crop_id].profit);
                    //变动值
                    $("#dd_num").html("数量："+now);
                    $("#dd_area").html("面积："+area+"㎡ ("+ percent +"%)");
                    $("#dd_profit").html("净收益：￥"+profit);
                });


                //确认按钮
                $("#myModal #decide").unbind().click(function(){
                    var set = $("#myModal .modal-body .dropdown button").html();
                    if(set == "选择作物 <span class='caret'></span>") return false;
                    var plot_id = $("#myModal .modal-header h4").attr("plot_id");
                    var crop_id = $("#dd_id").text().slice(3);
                    var plant_num = $("#dd_num").text().slice(3);

                    //先删除旧的
                    if($("#myModal .modal-header h4").html()==plot_map[plot_id].name+": 更改"){
                        var crop_id_old = $("#myModal .modal-header h4").attr("crop_id");
                        //如果相同 Update
                        if(crop_id_old==crop_id){ 
                            console.log(2);
                            //删除段
                            for(var i=0; i<plant.length; i++){
                                if(plant[i].plot_id==plot_id&&plant[i].crop_id==crop_id){
                                    plant.splice(i,1);
                                    mapping("plant");
                                    break;
                                }
                            }
                            $("#progress"+plot_id+"_"+crop_id).remove();//删除进度条
                            $("#delete_plant"+plot_id+"_"+crop_id).parents("tr").remove();//删除此行
                            //删除段
                            //Update
                            myAjax("plant_info/update_plant.php", "POST", {"plot_id":plot_id,"crop_id":crop_id,"plant_num":plant_num}, function(data){});
                        }
                        //如果不同 Delete&Insert
                        else {
                            console.log(3);
                            $("#delete_plant"+plot_id+"_"+crop_id_old).trigger("click");
                            myAjax("plant_info/insert_plant.php", "POST", {"plot_id":plot_id,"crop_id":crop_id,"plant_num":plant_num}, function(data){});
                        }
                    }
                    else{
                        console.log("wrong");
                    }
                    
                    //更新对象和界面
                    plant.push({"plot_id":plot_id,"crop_id":crop_id,"plant_num":plant_num});
                    plant.sort(cmp_plant);
                    mapping("plant");

                    var percent = ((plant_num * crop_map[crop_id].area / plot_map[plot_id].area)*100);//所占百分比
                    var total_percent = getTotalPercent(plot_id);
                    var chunk = '';
                    var chunk2 = '';
                    if(total_percent > 100) chunk += "<tr id='update_plant"+ plot_id +"_"+ crop_id +"' data-toggle='modal' data-target='#myModal' class='danger'>";//溢出则变红
                    else chunk += "<tr id='update_plant"+ plot_id +"_"+ crop_id +"' data-toggle='modal' data-target='#myModal'>";
                    chunk += "<td><span id='delete_plant"+ plot_id +"_"+ crop_id +"' class='glyphicon glyphicon-remove'></span></td>"
                        +"<td>"+ crop_map[crop_id].name +"</td>"
                        +"<td>"+ plant_num +"</td>"
                        +"<td class='percent'>"+ precsion(plant_num * crop_map[crop_id].area) +"㎡ ("+ precsion(percent) +"%)</td>"
                        +"<td>"+ crop_map[crop_id].cycle +"年</td>"
                        +"<td>￥"+ precsion(plant_num * crop_map[crop_id].profit) +"</td>"
                        +"</tr>";
                    $("#plant_table"+plot_id+" #insert_plant"+plot_id).before(chunk);//插入行
                    chunk2 += "<div id='progress"+ plot_id +"_"+ crop_id +"' class='progress-bar "+ classRepeat[plant_map[plot_id].length%4-1] +" progress-bar-striped' style='width: "+ precsion(percent) +"%'>"
                        +"<span>"+ precsion(percent) +"% "+ crop_map[crop_id].name +"</span>"
                        +"</div>";
                    $("#progress"+plot_id).append(chunk2);//插入进度条
                    $("#total_profit"+plot_id).html(precsion(getTotalProfit(plot_id)));
                    delete_and_update_plant(plot_id,crop_id);

                    re_key(plot_id);
                    check_flow(plot_id);
                });

            });
        }

        $("#set"+crop_id).trigger("click");
    });
}

//插入菜地（单次绑定）
$("#insert_plot").click(function(){
    var plot_name = $("#plot_name").val();
    var plot_area = $("#plot_area").val();
    var plot_description = $("#plot_description").val();
    //检查输入
    if(plot_name==''||plot_area==''||isNaN(plot_area)||plot_area<=0) {
        alert("输入错误");
        return false;
    }
    //访问数据库
    myAjax("plot_info/insert_plot.php", "POST", 
        {"plot_name":plot_name,"plot_area":plot_area,"plot_description":plot_description}, 
        function(data){
            // console.log(data);
            mapping("plant");
            select_plot();//更新
            $("#plot_name").val('');$("#plot_area").val('');$("#plot_description").val('');//清空框中输入
    });
});

//插入作物（单次绑定）
$("#insert_crop").click(function(){
    var crop_name = $("#crop_name").val();
    var crop_num = $("#crop_num").val();
    var crop_area = $("#crop_area").val();
    var crop_cycle = $("#crop_cycle").val();
    var crop_profit = $("#crop_profit").val();
    var crop_description = $("#crop_description").val();
    //检查输入
    function checknum(num){
        if(num==''||isNaN(num)||num<=0) return true;
    }
    if(crop_name==''||checknum(crop_num)||checknum(crop_area)||checknum(crop_cycle)||checknum(crop_profit)) {
        alert("输入错误");
        return false;
    }
    //访问数据库
    myAjax("crop_info/insert_crop.php", "POST", 
        {"crop_name":crop_name,"crop_num":crop_num,"crop_area":crop_area,"crop_cycle":crop_cycle,"crop_profit":crop_profit,"crop_description":crop_description}, 
        function(data){
            // console.log(data);
            mapping("plant");
            select_crop();//更新
            $("#crop_name").val('');$("#crop_num").val('');$("#crop_area").val('');$("#crop_cycle").val('');$("#crop_profit").val('');$("#crop_description").val('');//清空框中输入
    });
});

//页面查找菜地（单次绑定）
$("#find_plot").change(function(){
    var rows = $("#plot_info").find("tr");
    var val = $(this).val()
    if(val=='') {
        rows.removeClass("hidden");
    } else {
        rows.removeClass("hidden");
        rows.not(":contains('"+val+"')").addClass("hidden");
    }
})
//页面查找作物（单次绑定）
$("#find_crop").change(function(){
    var rows = $("#crop_info").find("tr");
    var val = $(this).val()
    if(val=='') {
        rows.removeClass("hidden");
    } else {
        rows.removeClass("hidden");
        rows.not(":contains('"+val+"')").addClass("hidden");
    }
})
//页面查找方案（单次绑定）
$("#find_plant").change(function(){
    var rows = $("#plant_info").children("div");
    var val = $(this).val()
    if(val=='') {
        rows.removeClass("hidden");
    } else {
        rows.removeClass("hidden");
        rows.not(":contains('"+val+"')").addClass("hidden");
    }
})



//首次加载
$(function(){
    select_plot();
    select_crop();
    $.when(dtd1, dtd2)//事件注册，前两个函数结束后执行plant
        .done(function(){ select_plant(); });//巨TM爽
});

//滑动
$(".sidebar li").click(function(){
    $(".active").removeClass("active");
    $(this).addClass("active");
    var text = $.trim($(this).text());
    var pos = 0;
    for(var i=0; i<5; i++){
        if($.trim($("h1:eq("+ i +")").text()) == text) {
            pos = $("h1:eq("+ i +")").offset().top - $("h1:eq("+ i +")").outerHeight();
        }
    }
    $("html,body").animate({scrollTop: pos},300);
});




