
//SVG area dimensions:
var svgWidth = 960;
var svgHeight = 660;

//chart's margins:
var chartMargin = {
    top: 30,
    right: 30,
    bottom: 30,
    left: 30
  };

//dimensions of chart area
var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;

//body, svg area, dimension setting
var svg = d3
  .select("body")
  .append("svg")
  .attr("height", svgHeight)
  .attr("width", svgWidth);
//Appending group to SVG area
var chartGroup = svg.append("g")
  .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);
//parameters
var chosenXAxis= "Poverty";
var chosenYAxis= "Heathcare";

//update x scale upon clicking
function xScale(bureauData, chosenXAxis){
  var xLinearScale=d3.scaleLinear()
    .domain([d3.min(bureauData, d=>d[chosenXAxis])*.9,
    d3.max(bureauData, d=>d[chosenXAxis])*1.2
  ])
  .range([0,chartWidth]);
  return xLinearScale;
}
function yScale(bureauData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(bureauData, d => d[chosenYAxis]) * 0.7,
      d3.max(bureauData, d => d[chosenYAxis]) * 1.3
    ])
    .range([chartHeight, 0]);

  return yLinearScale;
}
//update x-axis on clicking
function renderXAxes(newXScale,xAxis){
  var bottomAxis =d3.axisBottom(newXScale);
  xAxis.transition()
    .duration (1000)
    .call(bottomAxis);
  return xAxis;
}
//update y-axis
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}
//new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}
function renderCirclesTextGroup(circlesTextGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  circlesTextGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]))
  
  return circlesTextGroup;
}
//update circles with tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  if (chosenXAxis === "poverty") {
    var xlabel = "Poverty(%)";
  }
  else if (chosenXAxis === "age") {
    var xlabel = "Median Age";
  } 
  else {
    var xlabel = "Income($)";
  }

  if (chosenYAxis === "healthcare") {
    var ylabel = "Lacks Healthcare(%)";
  }
  else if (chosenYAxis === "smokes") {
    var ylabel = "Smoking(%)";  } 
  else {
    var ylabel = "Obesity(%)";
  }
  var toolTip = d3.tip()
  .attr("class", "tooltip")
  .offset([80, -60])
  .html(function(d) {
    return (`${d.state}<br>${xlabel}: ${d[chosenXAxis]}<br>${ylabel}: ${d[chosenYAxis]}`);
  });

circlesGroup.call(toolTip);

circlesGroup.on("mouseover", function(data) {
  toolTip.show(data);
})
  // onmouseout event
  .on("mouseout", function(data, index) {
    toolTip.hide(data);
  });

return circlesGroup;
}

//Loading csv data
d3.csv("assets/data/data.csv")
  .then(function(bureauData) {
    bureauData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.income = +data.income;
      data.healthcare = +data.healthcare;
      data.obesity = +data.obesity;
      data.smokes = +data.smokes;
    });



//xLinear scale function and yLinear scale function
var xLinearScale = xScale(bureauData, chosenXAxis);
var yLinearScale = yScale(bureauData, chosenYAxis);
//axis functions
var bottomAxis = d3.axisBottom(xLinearScale);
var leftAxis = d3.axisLeft(yLinearScale);
//append axes to chart
var xAxis = chartGroup.append("g")
  .classed("x-axis", true)
  .attr("transform", `translate(0, ${chartHeight})`)
  .call(bottomAxis);

chartGroup.append("g")
  .call(leftAxis);

//create circles
var circlesGroup = chartGroup.selectAll("circle")
.data(bureauData)
.enter()
.append("circle")
.attr("cx", d => xLinearScale(d[chosenXAxis]))
.attr("cy", d => yLinearScale(d[chosenYAxis]))
.attr("r", "10")
.classed("stateCircle", true);

//updateToolTip above csv import
var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
//add state labels
var circlesTextGroup = chartGroup.append("text").classed("stateText",true)
.selectAll("tspan")
.data(bureauData)
.enter()
.append("tspan")
.attr("x", d => xLinearScale(d[chosenXAxis]))
.attr("y", d => yLinearScale(d[chosenYAxis]))
.text(d => d.abbr);
//group for multiple x and y labels
var xLabelsGroup = chartGroup.append("g")
.attr("transform", `translate(${width / 2}, ${height + margin.top})`);
var yLabelsGroup = chartGroup.append("g")
.attr("transform", `translate(0, 0)`);

var povertyLabel = xLabelsGroup.append("text")
.attr("x", 0)
.attr("y", 20)
.attr("value", "poverty") // value to grab for event listener
.classed("aText", true)
.classed("active", true)
.text("In Poverty(%)");

var ageLabel = xLabelsGroup.append("text")
.attr("x", 0)
.attr("y", 40)
.attr("value", "age") // value to grab for event listener
.classed("aText", true)
.classed("inactive", true)
.text("Age (Median)");

var smokesLabel = yLabelsGroup.append("text")
.attr("transform", "rotate(-90)")
.attr("y", 0 - margin.left + 20)
.attr("x", 0 - (height / 2))
.attr("dy", "1em")
.attr("value", "smokes")
.classed("aText", true)
.classed("inactive", true)
.text("Smokes(%)");

var obesityLabel = yLabelsGroup.append("text")
.attr("transform", "rotate(-90)")
.attr("y", 0 - margin.left)
.attr("x", 0 - (height / 2))
.attr("dy", "1em")
.attr("value", "obesity")
.classed("aText", true)
.classed("inactive", true)
.text("Obese(%)");

//x-axis labels event listener
xLabelsGroup.selectAll("text")
  .on("click", function() {
  // get value of selection
  var value = d3.select(this).attr("value");
  if (value !== chosenXAxis) {
      // replaces chosenXAxis with value
      chosenXAxis = value;
      // console.log(chosenXAxis)

      // functions here found above csv import
      // updates x scale for new data
      xLinearScale = xScale(bureauData, chosenXAxis);

      // updates x axis with transition
      xAxis = renderXAxes(xLinearScale, xAxis);
      // updates circles with new x values
      circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
      circlesTextGroup = renderCirclesTextGroup(circlesTextGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

      // updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
      // changes classes to change bold text
      if (chosenXAxis === "poverty") {
        povertyLabel
          .classed("active", true)
          .classed("inactive", false);
        ageLabel
          .classed("active", false)
          .classed("inactive", true);
        incomeLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else if (chosenXAxis === "age") {
        povertyLabel
          .classed("active", false)
          .classed("inactive", true);
        ageLabel
          .classed("active", true)
          .classed("inactive", false);
        incomeLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else {
        povertyLabel
          .classed("active", false)
          .classed("inactive", true);
        ageLabel
          .classed("active", false)
          .classed("inactive", true);
        incomeLabel
          .classed("active", true)
          .classed("inactive", false);
      }
    }
  });
  
  yLabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        // replaces chosenYaxis with value
        chosenYAxis = value;
          //console.log(chosenYAxis)

        // functions here found above csv import
        // updates y scale for new data
        yLinearScale = yScale(bureauData, chosenYAxis);

        // updates y axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);
        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        circlesTextGroup = renderCirclesTextGroup(circlesTextGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
               // changes classes to change bold text
               if (chosenYAxis === "healthcare") {
                healthLabel
                  .classed("active", true)
                  .classed("inactive", false);
                smokesLabel
                  .classed("active", false)
                  .classed("inactive", true);
                obesityLabel
                  .classed("active", false)
                  .classed("inactive", true);
              }
              else if (chosenYAxis === "smokes") {
                healthLabel
                  .classed("active", false)
                  .classed("inactive", true);
                smokesLabel
                  .classed("active", true)
                  .classed("inactive", false);
                obesityLabel
                  .classed("active", false)
                  .classed("inactive", true);
              }
              else {
                healthLabel
                  .classed("active", false)
                  .classed("inactive", true);
                smokesLabel
                  .classed("active", false)
                  .classed("inactive", true);
                obesityLabel
                  .classed("active", true)
                  .classed("inactive", false);
              }
      }
  });
});   
       

 
