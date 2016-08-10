// load data
var dataset = [];
var scale = 2;
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
  });
  });

});

// initialize the svg
var init = function(){

var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 1100  - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// var margin2 = {top: 450, right: 10, bottom: 20, left: 40},
//     height2 = 500 - margin2.top - margin2.bottom;

var x = d3.time.scale()
    .domain(d3.extent(dataset, function(d) { return d.time;}))
    .range([0, width]);

// var x2 = d3.time.scale()
//     .domain(d3.extent(dataset, function(d) { return d.time;}))
//     .range([0, width]);

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

var zoom = d3.behavior.zoom()
    .x(x)
    .y(y)
    .scaleExtent([-1, 10])
    .on("zoom", zoomed);

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
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    svg.call(zoom);

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

  // area.attr("transform", "translate(71,89)scale(" + 0.4 + ")");

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

  svg.on("contextmenu", function(d,i){
    console.log("mousedown");
    d3.event.preventDefault();
    zoom.on("zoom", null);
    focused();
  });

  d3.select("button").on("click", reset);

  brush.on('brushend', function(){
    zoom.on("zoom", zoomed);
  });

  brush.on('brush', function(d){  
    k = brush.extent();
    j = dataset.filter(function(d){
        return k[0] <= d.time && k[1] >=d.time;
    });
  // console.log(j)
});


function zoomed() {
  area.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  focus.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  xAxis.ticks(5 * d3.event.scale);
  svg.select(".x.axis").call(xAxis);
  svg.select(".y.axis").call(yAxis);
}

function focused() {
  focus.append("g")
        .attr("class","x brush")
        .call(brush)
        .selectAll("rect")
        .attr("height", height)
        .style({
            "fill": "#F64747",
            "fill-opacity": "0.3"
        });
  console.log("focus");
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





