function makeResponsive() {
  //SET SVG Width - but conder changing it to responsive
  var svgArea = d3.select("body").select("#scatter").select("svg");

  // clear svg is not empty
  if (!svgArea.empty()) {
    svgArea.remove();
  }

  var containerWidth = +d3.select('.container').style('width').slice(0, -2)
  var svgWidth = containerWidth;
  var svgHeight = containerWidth*0.52;

  // var svgWidth = 960;
  // var svgHeight = 500;

  var margin = {
      top: 20,
      right: 40,
      bottom: 60,
      left: 100
    };

  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;

  // Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
  var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);


  // Import Data
  d3.csv("assets/data/data.csv").then(function(healthData) {

      // Step 1: Parse Data/Cast as numbers
          //Question: can a loop parse each column?
      // ==============================
      healthData.forEach(function(data) {
          data.income = parseInt(data.income);
          data.healthcare = parseFloat(data.healthcare);
        });

        // Step 2: Create scale functions
      // ==============================
      var xLinearScale = d3.scaleLinear()
        //starting with 0 to max - but consider d3.extent(xxx) if think it needs later
        //"d" = row (ie check each row and provide the max)
        //.domain(d3.extent(healthData, d => d.income))    
        .domain([d3.min(healthData, d => d.income)*0.95, d3.max(healthData, d => d.income)*1.05])
        .range([0, width]);

      var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(healthData, d => d.healthcare)*1.1])
        .range([height, 0]);

        // Step 3: Create axis functions
      // ==============================
      var bottomAxis = d3.axisBottom(xLinearScale);
      var leftAxis = d3.axisLeft(yLinearScale);

      // Step 4: Append Axes to the chart
      // ==============================
      chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

        chartGroup.append("g")
        .call(leftAxis);
      
      // Step 5: Create Circles
      // ==============================
      var circlesGroup = chartGroup.selectAll("circle")
      .data(healthData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d.income))
      .attr("cy", d => yLinearScale(d.healthcare))
      .attr("r", "10")
      .attr("class", "stateCircle")
      // .attr("fill", "#8bbcd5")
      // .attr("opacity", "1")
      .on("mouseover", function(d) {
        toolTip.show(d, this)
      })
      .on("mousemove", function(d) {
        toolTip.show(d, this)
      })
      .on("mouseout", function(d) {
        toolTip.hide(d);
      });

        // Create country code labels for circles
          //https://stackoverflow.com/questions/26576050/d3-enter-append-not-appending-all-elements-of-my-array
      var labels = chartGroup.selectAll("text.clabels")
      .data(healthData)
      .enter()
      .append("text")
      .classed("stateText", true)
      .classed("clabels", true)
      // .attr("text-anchor", "middle")
      // .attr("class", "clabels")
      .attr("x", d => xLinearScale(d.income))
      .attr("y", d => yLinearScale(d.healthcare)+4)
      // .attr("fill", "white")
      .attr("font-weight", "bold")
      .attr("font-size", 10)
      .text(function(d) {
        return d.abbr;
      });
    
      // Step 1: Initialize Tooltip
      var toolTip = d3.tip()
      // .classed("tooltip", true)
      // .classed("d3-tip", true)
      .attr("class", "tooltip")
      .attr("class", "d3-tip")
      .offset([-8, 0])
      .html(function(d) {
        return (`${d.state}
        <br>
        Income: ${d.income}<br>
        Healthcare: ${d.healthcare}`);
      });

      // Step 2: Create the tooltip in chartGroup.
      chartGroup.call(toolTip);

      // // Step 3: Create "mouseover" event listener to display tooltip
      // circlesGroup.on("mouseover", function(d) {
      //   toolTip.show(d, this);
      // })
      // // Step 4: Create "mouseout" event listener to hide tooltip
      // .on("mouseout", function(d) {
      //   toolTip.hide(d);
      // });


      
      // Create axes labels
      chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 40)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .classed("aText", true)
        // .attr("class", "axisText")
        .text("Lacks Healthcare (%)");

        chartGroup.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
        .classed("aText", true)
        // .attr("class", "axisText")
        .text("Household Income (Median)");


  });
}

// When the browser loads, makeResponsive() is called.
makeResponsive();

// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);