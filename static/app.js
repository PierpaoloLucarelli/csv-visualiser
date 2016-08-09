// load data
var dataset = [];
$(document).ready(function(){
  $("#file").change(function(){

    var parseDate = d3.time.format("%Y-%m-%d %H:%M:%S.%L").parse;
    var filename = $(this).val().split('\\').pop(); 

    d3.csv("static/" + filename, function(data) {
      data.forEach(function(d){
        d.time = parseDate(d.time)
        d.x = +d.x;
        d.y = +d.y;
        d.z = +d.z;
      });
      dataset = data;
      datalength = dataset.length * 10;
      init();
  });
  });

});

// initialize the svg
var init = function(){

var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 1100  - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.time.scale()
    .domain(d3.extent(dataset, function(d) { return d.time;}))
    .range([0, width * 2]);

var maxX = d3.max(dataset, function(d){return d.x});
var maxY = d3.max(dataset, function(d){return d.y});
var maxZ = d3.max(dataset, function(d){return d.z});
var minX = d3.min(dataset, function(d){return d.x});
var minY = d3.min(dataset, function(d){return d.y});
var minZ = d3.min(dataset, function(d){return d.z});

var yMaxDomain = Math.max(maxX, maxY, maxZ) + 1;
var yMinDomain = Math.min(minX, minY, minZ) - 1;


var y = d3.scale.linear()
    .domain([yMinDomain,yMaxDomain])
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickSize(1)
    .ticks(d3.time.seconds, 3)
    .tickFormat(d3.time.format('%M : %S'));

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(5)
    .tickSize(-width);

var zoom = d3.behavior.zoom()
    .x(x)
    .y(y)
    .scaleExtent([-1, 10])
    .on("zoom", zoomed);

var svg = d3.select("#visualisation").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .call(zoom);

svg.append("rect")
    .attr("width", width)
    .attr("height", height);

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);

var area = svg.append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g");

var lineFuncX = d3.svg.line()
    .x(function(d, i) {
      return x(d.time);
    })
    .y(function(d) {
      return y(d.x);
    })
    .interpolate('linear');

  var lineFuncY = d3.svg.line()
    .x(function(d, i) {
    return x(d.time);
  })
    .y(function(d) {
    return y(d.y);
  })
    .interpolate('linear');


  var lineFuncZ = d3.svg.line()
    .x(function(d, i) {
    return x(d.time);
  })
    .y(function(d) {
    return y(d.z);
  })
    .interpolate('linear');

// var areaLimit = 0;
// var activity_area = d3.svg.area()
//     .x(function(d, i) { 
//       return x(10 * i); 
//     })
//     .y0(height)
//     .y1(function(d) { return y(y.domain()[1]); });

//   area.append("path")
//       .datum(dataset)
//       .attr("class", "area")
//       .attr("d", activity_area);

  var drawLines = function(line, color){
     area.append('svg:path')
    .attr('d', line(dataset))
    .attr('stroke', color)
    .attr("opacity","0.6")
    .attr('stroke-width', 2)
    .attr('fill', 'none');
  }

  drawLines(lineFuncX, '#2980b9');
  drawLines(lineFuncY, '#e74c3c');
  drawLines(lineFuncZ, '#2ecc71');

d3.select("button").on("click", reset);


function zoomed() {
  area.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  xAxis.ticks(5 * d3.event.scale);
  svg.select(".x.axis").call(xAxis);
  svg.select(".y.axis").call(yAxis);
}

function reset() {
  d3.transition().duration(750).tween("zoom", function() {
    var ix = d3.interpolate(x.domain(), d3.extent(dataset, function(d) { return d.time;})),
        iy = d3.interpolate(y.domain(), [yMinDomain,yMaxDomain]);
    return function(t) {
      zoom.x(x.domain(ix(t))).y(y.domain(iy(t)));
      svg.select(".x.axis").call(xAxis);
      svg.select(".y.axis").call(yAxis);
      area.attr("transform", "translate([0][0])scale(1)");
    };
  });
}

}





