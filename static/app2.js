var workspace_data = [];
var totaldata = [];
var area2;
var x2;
var y2;
var reset;


function init2(){
	console.log("init2");
	var margin2 = {top: 20, right: 20, bottom: 30, left: 40}
	    height2 = 350 - margin.top - margin.bottom;;

	var maxX = d3.max(dataset, function(d){return d.x});
	var maxY = d3.max(dataset, function(d){return d.y});
	var maxZ = d3.max(dataset, function(d){return d.z});
	var minX = d3.min(dataset, function(d){return d.x});
	var minY = d3.min(dataset, function(d){return d.y});
	var minZ = d3.min(dataset, function(d){return d.z});

	var yMaxDomain = Math.max(maxX, maxY, maxZ) + 1;
	var yMinDomain = Math.min(minX, minY, minZ) - 1;

	x2 = d3.scale.linear().domain([0, dataset.length]).range([0, width]);

	y2 = d3.scale.linear()
	    .domain([yMinDomain,yMaxDomain])
	    .range([height2, 0]);

	var zoom = d3.behavior.zoom()
    .x(x2)
    .y(y2)
    .scaleExtent([-1, 10])
    .on("zoom", zoomed);

	var xAxis2 = d3.svg.axis().scale(x2).tickSize(-height2).tickSubdivide(true);

	var yAxis2 = d3.svg.axis()
	    .scale(y2)
	    .orient("left")
	    .ticks(5)
	    .tickSize(-width);

	var svg2 = d3.select("#visualisation").append("svg")
	    .attr("width", width + margin2.left + margin2.right)
	    .attr("height", height2 + margin2.top + margin2.bottom)
	  .append("g")
	    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")")
	    .call(zoom);

	svg2.append("rect")
	    .attr("width", width)
	    .attr("height", height2);

	svg2.append("g")
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + height2 + ")")
	    .call(xAxis2);

	d3.select("button").on("click", reset);

	svg2.append("g")
	    .attr("class", "y axis")
	    .call(yAxis2);

	area2 = svg2.append("svg")
	    .attr("width", width)
	    .attr("height", height2)
	    .append("g")
	    .attr("class","path-area");


	function zoomed() {
  		area2.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  		svg2.select(".x.axis").call(xAxis2);
  		svg2.select(".y.axis").call(yAxis2);
	}

	reset = function() {
  		d3.transition().duration(150).tween("zoom", function() {
    	var ix = d3.interpolate(x2.domain(), [0, dataset.length]),
        iy = d3.interpolate(y2.domain(), [yMinDomain,yMaxDomain]);
    	return function(t) {
      		zoom.x(x2.domain(ix(t))).y(y2.domain(iy(t)));
      		svg2.select(".x.axis").call(xAxis2);
      		svg2.select(".y.axis").call(yAxis2);
      		area2.attr("transform", "translate(0,0)scale(1)");
    	};
  	});
	}
}

	 var lineFuncX = d3.svg.line()
    .x(function(d, i) {
      return x2(d.index);
    })
    .y(function(d) {
      return y2(d.x);
    })
    .interpolate('linear');

	var lineFuncY = d3.svg.line()
	    .x(function(d, i) {
	    return x2(d.index);
	})
	    .y(function(d) {
	    return y2(d.y);
	}).interpolate('linear');


  var lineFuncZ = d3.svg.line()
    .x(function(d, i) {
    return x2(d.index);
  })
    .y(function(d) {
    return y2(d.z);
  })
    .interpolate('linear');

var draw_workspace = function(line, color){
	 area2.append('svg:path')
	.attr('d', line(workspace_data))
	.attr('stroke', color)
	.attr("opacity","0.6")
	.attr('stroke-width', 0.5)
	.attr('fill', 'none');
  }

function paste_on_workspace(j, label, color){
	reset();
	workspace_data = j;
	// add slection to total data
	totaldata.push.apply(totaldata, j);
	setTimeout(function(){
		draw_workspace(lineFuncX, '#2980b9');
 		draw_workspace(lineFuncY, '#e74c3c');
		draw_workspace(lineFuncZ, '#2ecc71');
		area2.append("text")
			.text(label)
			.attr("x", x2(import_value.current + (j.length / 2)))
			.attr("fill", color)
			.attr("y", height2 - 20);
		import_value.current += import_value.length;
	}, 200);
}

$("#reset").click(function(){
	reset();
});

$("#step-back").click(function(){
	var last_step = import_value.steps[import_value.steps.length - 1];
	import_value.current -= last_step;
	import_value.steps.pop();
	$(".path-area text:last-child").remove();
	$(".path-area").find("path:nth-last-child(-n+3)").remove();
});

 function ConvertToCSV(objArray) {
            var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
            var str = '';

            for (var i = 0; i < array.length; i++) {
                var line = '';
                for (var index in array[i]) {
                    if (line != '') line += ','

                    line += array[i][index];
                }

                str += line + '\r\n';
            }

            return str;
        }


$("#export").click(function(){

	var csvContent = "data:text/csv;charset=utf-8,time,x,y,z\n";
	for(var i = 0 ; i < totaldata.length ; i++){
		var time = totaldata[i].time;
		csvContent += time.getFullYear() + '-' 
		+ ("0" + (time.getMonth() + 1)).slice(-2) + '-'
		+ ("0" + time.getDate()).slice(-2) + ' ' 
		+ time.getHours() + ':'
		+ time.getMinutes() + ':'
		+ time.getSeconds() + '.'
		+ time.getMilliseconds()+ ', ';
		csvContent += totaldata[i].x + ', ';
		csvContent += totaldata[i].y + ', ';
		csvContent += totaldata[i].z;
		csvContent += '\n';
	}
	console.log(csvContent);
	var encodedUri = encodeURI(csvContent);
	var link = document.createElement("a");
	link.setAttribute("href", encodedUri);
	link.setAttribute("download", "my_data.csv");
	document.body.appendChild(link);
	link.click();
// 	console.log(totaldata);
// 	console.log(totaldata);
// 	$.ajax({
//     type: 'POST',
//     // Provide correct Content-Type, so that Flask will know how to process it.
//     contentType: 'application/json',
//     // Encode data as JSON.
//     data: JSON.stringify(totaldata),
//     dataType: 'json',
//     url: '/savedata',
//     complete: function (res) {
//     	console.log(res);
//         if(res.responseText){
//         	alert("Save succesfull");
//         } else {
//         	alert("Something went wrong :/");
//         }
//     }
// });
});









