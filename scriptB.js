//Width and height of map
var width = 960;
var height = 500;

// D3 Projection
var projection = d3.geo.albersUsa()
				   //.translate([width/2, height/2])    // translate to center of screen
				   .scale([1000]);          // scale things down so see entire US

// Define path generator
var path = d3.geo.path()               // path generator that will convert GeoJSON to SVG paths
		  	 .projection(projection);  // tell path generator to use albersUsa projection


// Define linear scale for output
//var color = d3.scale.linear()
//			  .range(["rgb(213,222,217)","rgb(69,173,168)","rgb(84,36,55)","rgb(217,91,67)"]);
var color = d3.scale.log().base(Math.E).domain([0.01, 0.4]).range([d3.rgb("#B1DEF3"),d3.rgb("#185887")]);
var gdpScale = d3.scale.log().base(Math.E).domain([3.2e4,3e6]).range([5,25]);


var legendText = ["Low % Public Trans.","", "High % Public Trans."];

//Create SVG element and append map to the SVG
var svg = d3.select("#svg2")
			.attr("width", width)
			.attr("height", height);

// Append Div for tooltip to SVG
var div = d3.select("body")
		    .append("div")
    		.attr("class", "tooltip")
    		.style("opacity", 0);

// Load in my states data!
d3.csv("data.csv", function(data) {

// Load GeoJSON data and merge with states data
d3.json("us-states.json", function(json) {
  d3.json("center.json", function(center) {
    for (var i = 0; i < data.length; i++) {
    	// Grab State Name
    	var dataState = center[i].state;
    	// Find the corresponding state inside the GeoJSON
    	for (var j = 0; j < json.features.length; j++)  {
    		var jsonState = json.features[j].properties.name;
    		if (dataState == jsonState) {
      		json.features[j].properties.long = center[i]["longitude"];
          json.features[j].properties.lat = center[i]["latitude"];
      		break;
    		}
    	}
    }

  // Loop through each state data value in the .csv file
  for (var i = 0; i < data.length; i++) {
  	// Grab State Name
  	var dataState = data[i].State;
  	// Grab data value
  	var dataValue = data[i].visited;

  	// Find the corresponding state inside the GeoJSON
  	for (var j = 0; j < json.features.length; j++)  {
  		var jsonState = json.features[j].properties.name;
  		if (dataState == jsonState) {
    		json.features[j].properties.pct = data[i]["% Public Transportation"];
        json.features[j].properties.gdp = data[i]["GDP"];
    		break;
  		}
  	}
  }

  // Bind the data to the SVG and create one path per GeoJSON feature
  svg.selectAll("pathB")
  	.data(json.features)
  	.enter()
  	.append("path")
    .attr("class", "pathB")
  	.attr("d", path)
  	.style("stroke", "#fff")
  	.style("stroke-width", "1")
  	.style("fill", d3.rgb("#EDEDED"));
  // Map the cities I have lived in!
  svg.selectAll("circleB")
  	.data(json.features)
  	.enter()
  	.append("circle")
    .attr("class", "circleB")
  	.attr("cx", function(d) {
      if(!d.properties.lat) {return projection([0,0])}
  		return projection([d.properties.long, d.properties.lat])[0];
  	})
  	.attr("cy", function(d) {
      if(!d.properties.lat) {return projection([0,0])}
  		return projection([d.properties.long, d.properties.lat])[1];
  	})
  	.attr("r", function(d) {
      if(!gdpScale(d.properties.gdp)) {return 0;}
  		return gdpScale(d.properties.gdp);
  	})
  		.style("fill", function(d) {
        return color(d.properties.pct);
      })
  		.style("opacity", 0.85)

  	// Modification of custom tooltip code provided by Malcolm Maclean, "D3 Tips and Tricks"
  	// http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
  	.on("mouseover", function(d) {
      	div.transition()
        	   .duration(200)
             .style("opacity", .9);
             div.text(d.properties.name)
             .style("left", (d3.event.pageX) + "px")
             .style("top", (d3.event.pageY - 28) + "px");
  	})

      // fade out tooltip on mouse out
      .on("mouseout", function(d) {
          div.transition()
             .duration(500)
             .style("opacity", 0);
      });


  // Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
  var legend = d3.select("body").append("svg")
        		.attr("class", "legendA")
       			.attr("width", 140)
      			.attr("height", 200)
     				.selectAll("g")
     				.data([0.01, 0.07, 0.4])
     				.enter()
     				.append("g")
       			.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    	legend.append("rect")
     		  .attr("width", 18)
     		  .attr("height", 18)
     		  .style("fill", color);

    	legend.append("text")
    		  .data(legendText)
        	  .attr("x", 24)
        	  .attr("y", 9)
        	  .attr("dy", ".35em")
        	  .text(function(d) { return d; });

  var legend = d3.select("body").append("svg")
        		.attr("class", "legendB")
       			.attr("width", 140)
      			.attr("height", 200)
     				.selectAll("g")
     				.data([3e4,4e4,6e4])
     				.enter()
     				.append("g")
       			.attr("transform", function(d, i) { return "translate(10," + i * 20 + ")"; });

    	legend.append("circle")
     		  .attr("cx", 9)
     		  .attr("cy", 9)
          .attr("r",gdpScale)
     		  .style("fill", color(0.4));

    	legend.append("text")
    		  .data(["Low GDP", "", "High GDP"])
        	  .attr("x", 24)
        	  .attr("y", 9)
        	  .attr("dy", ".35em")
        	  .text(function(d) { return d; });

});

});

});
