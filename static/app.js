// load data
var dataset = [];
var scale = 2;
var yMaxDomain = 0;
var yMinDomain = 0;

var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 1100  - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

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
      init();
      init2();
  });
  });

});

// initialize the svg
var init = function(){

var x = d3.time.scale()
    .domain(d3.extent(dataset, function(d) { return d.time;}))
    .range([0, width]);

var maxX = d3.max(dataset, function(d){return d.x});
var maxY = d3.max(dataset, function(d){return d.y});
var maxZ = d3.max(dataset, function(d){return d.z});
var minX = d3.min(dataset, function(d){return d.x});
var minY = d3.min(dataset, function(d){return d.y});
var minZ = d3.min(dataset, function(d){return d.z});

var yMaxDomain = Math.max(maxX, maxY, maxZ) + 1;
var yMinDomain = Math.min(minX, minY, minZ) - 1;

var y = d3.scale.linear()
    .domain([yMinDomain * scale ,yMaxDomain * scale])
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickSize(1)
    .ticks(d3.time.minutes, 1)
    .tickFormat(d3.time.format('%M : %S'));

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(5)
    .tickSize(-width);

var svg = d3.select("#visualisation").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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

  var focus = area.append("g");

  var selectArea = d3.svg.area()
          .interpolate("basis")
          .x(function(d){ return x(d.time); })
          .y1(function(d){ return height })
          .y0(function(d){ return y(y.domain()[1]); });

  var drawLines = function(line, color){
     area.append('svg:path')
    .attr('d', line(dataset))
    .attr('stroke', color)
    .attr("opacity","0.6")
    .attr('stroke-width', 0.5)
    .attr('fill', 'none');
  }

  drawLines(lineFuncX, '#2980b9');
  drawLines(lineFuncY, '#e74c3c');
  drawLines(lineFuncZ, '#2ecc71');

  var brush = d3.svg.brush().x(x);

  focus.append("path")
        .attr("class", "area")
        .datum(dataset)
        .attr("d", selectArea)
        .attr('fill', 'none');

  focus.append("g")
        .attr("class","x brush")
        .call(brush)
        .selectAll("rect")
        .attr("height", height)
        .style({
            "fill": "#F64747",
            "fill-opacity": "0.3"
  });

  brush.on('brushend', function(d){  
    k = brush.extent();

console.log(k[0].getTime());

    j = dataset.filter(function(d){
        return k[0] <= d.time && k[1] >=d.time;
    });
    paste_on_workspace(j);
});

}





