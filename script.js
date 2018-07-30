function setState(state) {
	d3.selectAll("svg").remove();
	d3.selectAll("tooltip").remove();
	d3.selectAll(".notebox").remove();


	if(state == 0) {
		document.getElementById("essay").style.display = "block";
	} else {
		document.getElementById("essay").style.display = "none";
	}

if (state >= 1 && state <= 3) {
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
	      color = d3.scale.linear().domain([0.1, 16745843]).range([d3.rgb("#FFCA94"), d3.rgb('#FF8100')]);

	  // add the graph canvas to the body of the webpage
	  var svg = d3.select("body").append("svg")
	      .attr("width", width + margin.left + margin.right)
	      .attr("height", height + margin.top + margin.bottom)
	    .append("g")
	      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	  // add the tooltip area to the webpage
	  var tooltip = d3.select("body").append("tooltip")
	      .attr("class", "tooltip")
	      .style("opacity", 0);

		let note = "";
		if (state == 1) {
				note = "<div class='note'>For the most part, states with higher GDP have higher public transportation use.</div>";
		}
		if(state == 2) {
				note = "<div class='note'>However, there are some anomalies like Texas, which has abnormally low PT use considering its high GDP, or...</div>";
		}
		if(state == 3) {
				note = "<div class='note'>... Hawaii, which has great PT use for is lower GDP</div>";
		}
		var thing = d3.select("body").append("div")
		.attr("class", "notebox")
			.html(note);


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
	      .attr("r", 5)
	      .attr("cx", xMap)
	      .attr("cy", yMap)
	      .style("fill", function(d) {
					if ((state == 2 && d.State === "Texas") || (state == 3 && d.State === "Hawaii")) {
						return "green";
					}
					return color(cValue(d));
				})
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
	  var legend = svg.append("g")
	  .attr("class", "legend")
		.attr("width", 140)
		.attr("height", 200)
		.selectAll("g")
		.data([10, 1e5, 1.7e7])
		.enter()
		.append("g")
		.attr("transform", function(d, i) { return "translate("+ (width-100) +"," +(0 + i * 20) + ")"; });


	  // draw legend colored rectangles
	  legend.append("rect")
	      .attr("x", 0)
	      .attr("width", 18)
	      .attr("height", 18)
	      .style("fill", function(d) { return color(d);})

	  // draw legend text
	  legend.append("text")
				.data(["Less Workers","","More Workers"])
	      .attr("x", 30)
	      .attr("y", 9)
	      .attr("dy", ".35em")
	      .style("text-anchor", "start")
	      .text(function(d, i) { return d})
	});


}
if (state == 4) {

// Load in my states data!
d3.csv("data.csv", function(data) {

	// Load GeoJSON data and merge with states data
	d3.json("us-states.json", function(json) {

	  d3.json("center.json", function(center) {


			//Width and height of map
			var width = 960;
			var height = 500;

			// D3 Projection
			var projection = d3.geo.albersUsa()
							   .translate([width/2, height/2])    // translate to center of screen
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
			var svg = d3.select("body").append("svg")
						.attr("width", width)
						.attr("height", height);

			// Append Div for tooltip to SVG
			var div = d3.select("body")
					    .append("div")
			    		.attr("class", "tooltip")
			    		.style("opacity", 0);

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
	  svg.selectAll("path")
	  	.data(json.features)
	  	.enter()
	  	.append("path")
	  	.attr("d", path)
	  	.style("stroke", "#fff")
	  	.style("stroke-width", "1")
	  	.style("fill", d3.rgb("#EDEDED"));
	  // Map the cities I have lived in!
	  svg.selectAll("circle")
	  	.data(json.features)
	  	.enter()
	  	.append("circle")
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
	        		.attr("class", "legendB")
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

	  var legend2 = d3.select("body").append("svg")
	        		.attr("class", "legendB")
	       			.attr("width", 140)
	      			.attr("height", 200)
	     				.selectAll("g")
	     				.data([3e4,4e4,6e4])
	     				.enter()
	     				.append("g")
	       			.attr("transform", function(d, i) { return "translate(10," + i * 20 + ")"; });

	    	legend2.append("circle")
	     		  .attr("cx", 9)
	     		  .attr("cy", 9)
	          .attr("r",gdpScale)
	     		  .style("fill", color(0.4));

	    	legend2.append("text")
	    		  .data(["Low GDP", "", "High GDP"])
	        	  .attr("x", 24)
	        	  .attr("y", 9)
	        	  .attr("dy", ".35em")
	        	  .text(function(d) { return d; });

	});

	});

});
}
}
