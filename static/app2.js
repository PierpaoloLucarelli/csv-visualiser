var workspace_data = [];
var area2;
var x2;
var y2;
var reset;


function init2(){
	console.log("init2");
	var margin2 = {top: 20, right: 20, bottom: 30, left: 40}
	    height2 = 200 - margin.top - margin.bottom;;

	var maxX = d3.max(dataset, function(d){return d.x});
	var maxY = d3.max(dataset, function(d){return d.y});
	var maxZ = d3.max(dataset, function(d){return d.z});
	var minX = d3.min(dataset, function(d){return d.x});
	var minY = d3.min(dataset, function(d){return d.y});
	var minZ = d3.min(dataset, function(d){return d.z});

	var yMaxDomain = Math.max(maxX, maxY, maxZ) + 1;
	var yMinDomain = Math.min(minX, minY, minZ) - 1;

	x2 = d3.time.scale()
	    .domain(d3.extent(dataset, function(d) { return d.time;}))
	    .range([0, width]);

	y2 = d3.scale.linear()
	    .domain([yMinDomain * scale ,yMaxDomain * scale])
	    .range([height2, 0]);

	var zoom = d3.behavior.zoom()
    .x(x2)
    .y(y2)
    .scaleExtent([-1, 10])
    .on("zoom", zoomed);

	var xAxis2 = d3.svg.axis()
	    .scale(x2)
	    .orient("bottom")
	    .tickSize(1)
	    .ticks(d3.time.minutes, 1)
	    .tickFormat(d3.time.format('%M : %S'));

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
	    .append("g");


	function zoomed() {
  		area2.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  		console.log("translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  		xAxis2.ticks(5 * d3.event.scale);
  		svg2.select(".x.axis").call(xAxis2);
  		svg2.select(".y.axis").call(yAxis2);
	}

	reset = function() {
  		d3.transition().duration(150).tween("zoom", function() {
    	var ix = d3.interpolate(x2.domain(), d3.extent(dataset, function(d) { return d.time;})),
        iy = d3.interpolate(y2.domain(), [yMinDomain * scale,yMaxDomain * scale]);
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
      return x2(d.time);
    })
    .y(function(d) {
      return y2(d.x);
    })
    .interpolate('linear');

	var lineFuncY = d3.svg.line()
	    .x(function(d, i) {
	    return x2(d.time);
	})
	    .y(function(d) {
	    return y2(d.y);
	}).interpolate('linear');


  var lineFuncZ = d3.svg.line()
    .x(function(d, i) {
    return x2(d.time);
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

function paste_on_workspace(j){
	reset();
	setTimeout(function(){
		workspace_data = j;
		draw_workspace(lineFuncX, '#2980b9');
 		draw_workspace(lineFuncY, '#e74c3c');
		draw_workspace(lineFuncZ, '#2ecc71');
	}, 200);
}

$("#reset").click(function(){
	reset();
});









