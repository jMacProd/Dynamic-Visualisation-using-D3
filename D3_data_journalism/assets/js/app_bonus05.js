function makeResponsive() {
  
  var svgArea = d3.select("body").select("#scatter").select("svg");

  // clear svg is not empty
  if (!svgArea.empty()) {
    svgArea.remove();
  }
  
  //SET SVG Width - but consider changing it to responsive
    //http://bl.ocks.org/eesur/909c6a83a1d969918a5389966c5f431a
  var containerWidth = +d3.select('.container').style('width').slice(0, -2)
  var svgWidth = containerWidth;
  var svgHeight = containerWidth*0.52;

  var margin = {
      top: 20,
      right: 40,
      bottom: 90,
      left: 100
    };  

  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;

  // Create an SVG wrapper, append an SVG group that will hold our chart,
      //and shift the latter by left and top margins.
  var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Initial Params
  var chosenXAxis = "income";
  var chosenYAxis = "healthcare";
  var tiplabelx = "Income"
  var tiplabely = "Healthcare"
  // console.log(chosenXAxis);
  // console.log(chosenYAxis);

  // function used for updating x-scale var upon click on axis label
  function xScale(healthData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d => d[chosenXAxis]*0.95),
        d3.max(healthData, d => d[chosenXAxis]*1.05)
      ])
      .range([0, width]);

    return xLinearScale;

  }

  // function used for updating y-scale var upon click on y label
  function yScale(healthData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(healthData, d => d[chosenYAxis]*1.1)])
      .range([height, 0]);

    return yLinearScale;

  }

  // function used for updating xAxis var upon click on axis label
  function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);

    return xAxis;
  }

  // function used for updating yAxis var upon click on axis label
  function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
      .duration(1000)
      .call(leftAxis);

    return yAxis;
  }

  // function used for updating circles group with a transition to
  // new circles
  function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
  }

  // function used for updating circle LABELS group with a transition to
  // labels
  function rendercirclelabels(labels, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    labels.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", d => newYScale(d[chosenYAxis])+4);

    return labels;
  }

  // Import Data
  d3.csv("assets/data/data.csv").then(function(healthData, err) {
    if (err) throw err;

    // Step 1: Parse Data/Cast as numbers
      //Question: can a loop parse each column?
    // ==============================
    healthData.forEach(function(data) {
      //X axis - consider dividing income by 1000 if teansition too jarring
      data.income = parseInt(data.income);
      data.poverty = parseFloat(data.poverty);
      data.age = parseFloat(data.age);
      //Y Axis
      data.healthcare = parseFloat(data.healthcare);
      data.obesity = parseFloat(data.obesity);
      data.smokes = parseFloat(data.smokes);
      });

    

        // Step 2: Create scale functions
      // ==============================
      // var xLinearScale = d3.scaleLinear()
      //   //starting with 0 to max - but consider d3.extent(xxx) if think it needs later
      //   //"d" = row (ie check each row and provide the max)
      //   .domain(d3.extent(healthData, d => d.income))    
      //   //.domain([0, d3.max(healthData, d => d.income)])
      //   .range([0, width]);

      // var yLinearScale = d3.scaleLinear()
      //   .domain([0, d3.max(healthData, d => d.healthcare)])
      //   .range([height, 0]);

    // xLinearScale function above csv import
    var xLinearScale = xScale(healthData, chosenXAxis);

    // Create y scale function
    // var yLinearScale = d3.scaleLinear()
    // .domain([0, d3.max(healthData, d => d.healthcare)*1.1])
    // .range([height, 0]);
    var yLinearScale = yScale(healthData, chosenYAxis);

        // Step 3: Create axis functions
      // ==============================
      // var bottomAxis = d3.axisBottom(xLinearScale);
      // var leftAxis = d3.axisLeft(yLinearScale);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

      // Step 4: Append Axes to the chart
      // ==============================
      // chartGroup.append("g")
      //   .attr("transform", `translate(0, ${height})`)
      //   .call(bottomAxis);

      //   chartGroup.append("g")
      //   .call(leftAxis);

    // append x axis
    var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
    .call(leftAxis);
      
      // Step 5: Create Circles
      // ==============================
      // var circlesGroup = chartGroup.selectAll("circle")
      // .data(healthData)
      // .enter()
      // .append("circle")
      // .attr("cx", d => xLinearScale(d.income))
      // .attr("cy", d => yLinearScale(d.healthcare))
      // .attr("r", "15")
      // .attr("fill", "pink")
      // .attr("opacity", ".5");

    var circlesGroup = chartGroup.selectAll("circle")
    .data(healthData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", "10")
    .attr("class", "stateCircle")
    //.attr("fill", "#8bbcd5")
    //.attr("opacity", "1")
    .on("mouseover", function(d) {
      toolTip.show(d, this);
    })
    // .on("mousemove", function(d) {
    //   toolTip.show(d, this)
    // })
    .on("mouseout", function(d) {
      toolTip.hide(d);
    });


    //Create country code labels for circles
    var labels = chartGroup.selectAll("text.clabels")
      .data(healthData)
      .enter()
      .append("text")
      .classed("stateText", true)
      .classed("clabels", true)
      //.attr("text-anchor", "middle")
      //.attr("class", "clabels")
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d[chosenYAxis])+4)
      //.attr("fill", "white")
      .attr("font-weight", "bold")
      .attr("font-size", 10)
      .text(function(d) {
        return d.abbr;
      });


      // Step 1: Initialize Tooltip
      var toolTip = d3.tip()
      .attr("class", "tooltip")
      .attr("class", "d3-tip")
      .offset([-8, 0])
      .html(function(d) {
        return (`${d.state}
        <br>
        ${tiplabelx}: ${d[chosenXAxis]}<br>
        ${tiplabely}: ${d[chosenYAxis]}`);
      });

      // Step 2: Create the tooltip in chartGroup.
      chartGroup.call(toolTip);





      
      // Create axes labels
      // chartGroup.append("text")
      //   .attr("transform", "rotate(-90)")
      //   .attr("y", 0 - margin.left + 40)
      //   .attr("x", 0 - (height / 2))
      //   .attr("dy", "1em")
      //   .attr("class", "axisText")
      //   .text("Health Care");

    // Create group for two x-axis labels
    var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

    //First X Label
    var incomelabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "income") // value to grab for event listener
    .classed("aText", true)
    .classed("active", true)
    .text("Household Income (Median)");

    //Second X Lable
    var povertylabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "poverty") // value to grab for event listener
    .classed("aText", true)
    .classed("inactive", true)
    .text("Poverty (%)");

    //Third X Lable
    var agelabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "age") // value to grab for event listener
    .classed("aText", true)
    .classed("inactive", true)
    .text("Age (Median)");

    
    // Create group for two y-axis labels
    var YlabelsGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)");
    
    // First y axis
    var healthcarelabel = YlabelsGroup.append("text")
    .attr("y", -30)
    .attr("x", 0 - (height / 2))
    //.attr("dy", "1em")
    .attr("value", "healthcare") // value to grab for event listener
    .classed("aText", true)
    .classed("active", true)
    .text("Lacks Healthcare (%)");

    // Second y axis
    var obesitylabel = YlabelsGroup.append("text")
    .attr("y", 0 - 50)
    .attr("x", 0 - (height / 2))
    //.attr("dy", "1em")
    .attr("value", "obesity") // value to grab for event listener
    .classed("aText", true)
    .classed("inactive", true)
    .text("Obesity (%)");

    // Third y axis
    var smokeslabel = YlabelsGroup.append("text")
    .attr("y", 0 - 70)
    .attr("x", 0 - (height / 2))
    //.attr("dy", "1em")
    .attr("value", "smokes") // value to grab for event listener
    .classed("aText", true)
    .classed("inactive", true)
    .text("Smokers (%)");






    // x axis labels event listener
    labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;
        //console.log(chosenXAxis) //Confirmed selecting poverty

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(healthData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        labels = rendercirclelabels(labels, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        //circlesGroup = updateToolTip(chosenXAxis, circlesGroup);


        //Update tip label - this works
        tiplabelx = chosenXAxis[0].toUpperCase() + 
        chosenXAxis.slice(1);



        // changes classes to change bold text
        if (chosenXAxis === "income") {
          incomelabel
            .classed("active", true)
            .classed("inactive", false);
          povertylabel
            .classed("active", false)
            .classed("inactive", true);
          agelabel
          .classed("active", false)
          .classed("inactive", true);
        }
        else if (chosenXAxis === "poverty") {
          povertylabel
            .classed("active", true)
            .classed("inactive", false);
          incomelabel
            .classed("active", false)
            .classed("inactive", true);
          agelabel
          .classed("active", false)
          .classed("inactive", true);
        }
        else {
          agelabel
            .classed("active", true)
            .classed("inactive", false);
          povertylabel
            .classed("active", false)
            .classed("inactive", true);
          incomelabel
            .classed("active", false)
            .classed("inactive", true);
        }
      }
    });

    // y axis labels event listener
    YlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        // replaces chosenYAxis with value
        chosenYAxis = value;
        //console.log(chosenYAxis) //Confirmed selecting poverty

        // functions here found above csv import
        // updates y scale for new data
        yLinearScale = yScale(healthData, chosenYAxis);

        // updates y axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        labels = rendercirclelabels(labels, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        //circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        //Update tip label
        tiplabely = chosenYAxis[0].toUpperCase() + 
        chosenYAxis.slice(1);

        
        // changes classes to change bold text
        if (chosenYAxis === "healthcare") {
          healthcarelabel
            .classed("active", true)
            .classed("inactive", false);
          obesitylabel
            .classed("active", false)
            .classed("inactive", true);
          smokeslabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "obesity") {
          obesitylabel
            .classed("active", true)
            .classed("inactive", false);
          healthcarelabel
            .classed("active", false)
            .classed("inactive", true);
          smokeslabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          smokeslabel
            .classed("active", true)
            .classed("inactive", false);
          healthcarelabel
            .classed("active", false)
            .classed("inactive", true);
          obesitylabel
            .classed("active", false)
            .classed("inactive", true);
        }
      }
    });


      // chartGroup.append("text")
      // .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
      // .attr("class", "axisText")
      // .text("Income");


  });
}
// When the browser loads, makeResponsive() is called.
makeResponsive();

// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);