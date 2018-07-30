

// load data
d3.csv("data.csv", function(error, data) {

  var margin = {top: 20, right: 20, bottom: 30, left: 80},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  // setup x
  var xValue = function(d) { return d["% Public Transportation"];}, // data -> value
      xScale = d3.scale.log().range([0, width]), // value -> display
      xMap = function(d) { return xScale(xValue(d));}, // data -> display
      xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickValues([.4, .6, .8, 1, 2, 4, 6, 8, 10, 20]).tickFormat(function(n) { return n + "%"});

  // setup y
  var yValue = function(d) { return d["GDP"];}, // data -> value
      yScale = d3.scale.log().range([height, 0]), // value -> display
      yMap = function(d) { return yScale(yValue(d));}, // data -> display
      yAxis = d3.svg.axis().scale(yScale).orient("left").tickFormat(function(n) { return n});

  // setup fill color
  var cValue = function(d) { return d["NumWorkers"];},
  //TODO COLOR
      cScale = d3.scale.log().base(Math.E).domain([0.1, 16745843]).interpolate(d3.interpolateHcl).range([d3.rgb("#FFCA94"), d3.rgb('#FF8100')]),
      color = function(d) {return cScale(d)};

  // add the graph canvas to the body of the webpage
  var svg = d3.select("#svg1")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // add the tooltip area to the webpage
  var tooltip = d3.selectAll("tooltipA")
      .attr("class", "tooltipA")
      .style("opacity", 0);



  // change string (from CSV) into number format
  data.forEach(function(d) {
    d["GDP"] = +d["GDP"]/1000;
    d["% Public Transportation"] = +d["% Public Transportation"]*100;
    d["NumWorkers"] = +d["NumWorkers"];
  });

  // don't want dots overlapping axis, so add in buffer to data domain
  xScale.domain([d3.min(data, xValue)*0.8, d3.max(data, xValue)*1.2]);
  yScale.domain([d3.min(data, yValue)*0.8, d3.max(data, yValue)*1.2]);

  // x-axis
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("% Workers Using Public Transporation");

  // y-axis
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("State GDP (billions)");

  // draw dots
  svg.selectAll(".dotA")
      .data(data)
    .enter().append("circle")
      .attr("class", "dotA")
      .attr("r", 3.5)
      .attr("cx", xMap)
      .attr("cy", yMap)
      .style("fill", function(d) {return color(cValue(d));})
      .on("mouseover", function(d) {
          tooltip.transition()
               .duration(200)
               .style("opacity", .9);
          tooltip.html(d["State"] + "<br/> " + d3.format("(.1f")(xValue(d))
	        + "% use PT<br/>$" + d3.format("(,.0f")(yValue(d)) + "B GDP<br/>"+d3.format(",")(d["NumWorkers"])+" workers")
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
          tooltip.transition()
               .duration(500)
               .style("opacity", 0);
      });

  // draw legend
  var legend = d3.select("body").append("svg")

  .attr("class", "legendA")
      .data([10, 16745843])
      .enter()
        .append("g")
          .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  // draw legend colored rectangles
  legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", function(d) { return color(d);})

  // draw legend text
  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d;})
});
