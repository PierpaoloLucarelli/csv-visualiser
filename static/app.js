// load data
var dataset = [];
var scale = 1.2;
var yMaxDomain = 0;
var yMinDomain = 0;
var import_value = {
  current: 0,
  length: 0,
  steps: []
};
// change for more or less number of ticks
var ticks = 10;

// set margins
var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 1100  - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

$(document).ready(function(){
    // date format is for example 2016-07-02 13:45:40.123
    var parseDate = d3.time.format("%Y-%m-%d %H:%M:%S.%L").parse;
    $('.commands-container').show();

    // load the .csv from the server
    d3.csv("static/data.csv", function(data) {
      data.forEach(function(d){
        d.time = parseDate(d.time)
        d.x = +d.x;
        d.y = +d.y;
        d.z = +d.z;
      });
      dataset = data;
      console.log(dataset);
      // draw preview area
      init();
      // draw workspace area
      init2();
  });
  });

// draw preview area
var init = function(){

var x = d3.time.scale()
    .domain(d3.extent(dataset, function(d) { return d.time;}))
    .range([0, width]);

// get domain for the Y axis
var maxX = d3.max(dataset, function(d){return d.x});
var maxY = d3.max(dataset, function(d){return d.y});
var maxZ = d3.max(dataset, function(d){return d.z});
var minX = d3.min(dataset, function(d){return d.x});
var minY = d3.min(dataset, function(d){return d.y});
var minZ = d3.min(dataset, function(d){return d.z});

var yMaxDomain = Math.max(maxX, maxY, maxZ);
var yMinDomain = Math.min(minX, minY, minZ);

var y = d3.scale.linear()
    .domain([yMinDomain * scale ,yMaxDomain * scale])
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickSize(10)
    .ticks(d3.time.seconds, ticks)
    .tickFormat(d3.time.format('%M:%S'));

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(5)
    .tickSize(-width);

// create the svg
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

var focus = svg.append("g");

var selectArea = d3.svg.area()
        .interpolate("basis")
        .x(function(d){ return x(d.time); })
        .y1(function(d){ return height })
        .y0(function(d){ return y(y.domain()[1]); });

var drawLines = function(line, color){
   svg.append('svg:path')
  .attr('d', line(dataset))
  .attr('stroke', color)
  .attr("opacity","0.6")
  .attr('stroke-width', 0.5)
  .attr('fill', 'none');
}

// draw the lines x,y,z

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

  area = svg.append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("class","path-area");

// if .csv contains activity label, then draw the labels in the preview area
var lastActivity = "";
for(var i = 0 ; i < dataset.length ; i ++){
  currActivity = dataset[i].activity;
  // console.log(dataset[i].activity);
  if(currActivity!=lastActivity){
    area.append("text")
      .text(dataset[i].activity)
      .attr("x", x(dataset[i].time) + 20)
      .attr("fill", "black")
      .attr("y", height - 20);
    lastActivity = currActivity;
    svg.append("line")
      .attr("x1", x(dataset[i].time))
      .attr("y1", 0)
      .attr("x2", x(dataset[i].time)) 
      .attr("y2", height)
      .style("stroke-width", 0.5)
      .style("stroke", "grey")
      .style("fill", "none");
  }
}

// show selection: starte date - end date selected
brush.on('brushend', function(){
  var ext = brush.extent();

  $('#extent').text("SELECTED: " + ext[0].getHours() + ":" + ext[0].getMinutes() + ":" + ext[0].getSeconds() + 
                      ", TO: " + ext[1].getHours() + ":" + ext[1].getMinutes() + ":" + ext[1].getSeconds());
  $('#extent').show();
  $('#activity-lbl, #label-input').show();
});

    // code for copying the selected portion of csv into the workspace area
  $("#import").click(function(d){
    j = 0; // points selected
    k = brush.extent(); // dates selected
    j = dataset.filter(function(d){
        return k[0] <= d.time && k[1] >=d.time;
    });

    import_value.length = j.length;
    import_value.steps.push(j.length);
    var label = $("#label-input").val();
    console.log(label);
    if(label != ""){
          // get color for label 
          var color = $("#label-input option:selected").attr("color");
          console.log(color);
          console.log("not empty");
          for(var i = 0 ; i < import_value.length ; i++){
            j[i].index = import_value.current + i;
            j[i].activity = label;
          }      
    } else {
          console.log("empty");
          for(var i = 0 ; i < import_value.length ; i++){
            j[i].index = import_value.current + i;
          }
    }
    console.log(j);
    paste_on_workspace(j, label, color);
  });

  // add ticks to the x axis
  $("#plus").click(function(){
    ticks++;
    xAxis.ticks(d3.time.seconds, ticks);
    svg.select(".x.axis").call(xAxis);
  });

  // remove ticks from the x axis
  $('#minus').click(function(){
      ticks--;
      xAxis.ticks(d3.time.seconds, ticks);
      svg.select(".x.axis").call(xAxis);
  });

}





