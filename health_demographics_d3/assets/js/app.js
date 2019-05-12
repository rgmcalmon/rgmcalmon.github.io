// @TODO: YOUR CODE HERE!

const svgWidth = 900;
const svgHeight = 600;

const margin = {
	top: 20,
	right: 40,
	bottom: 100,
	left: 100
};

const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

// Create SVG wrapper, append group to hold chart
// Shift by left/top margins
const svg = d3.select("#scatter")
	.append("svg")
	.attr("width", svgWidth)
	.attr("height", svgHeight);

// Append SVG group
const chartGroup = svg.append("g")
	.attr("transform", `translate(${margin.left}, ${margin.top})`)
	.classed("chart", true);

// Initial parameters
let chosenXAxis = 0;
let chosenYAxis = 0;
const xAxes = ["poverty", "age", "income"];
const yAxes = ["healthcare", "smokes", "obesity"];
let cRadius = 13;


// Functions for creating/updating x/y-scales
// Input: data --- object array read from the CSV data
// 		  axis --- the name of the column from the data set to set the axis to
function xScale(data, axis) {
	let xLinearScale = d3.scaleLinear()
		.domain([d3.min(data, d => d[axis]*.8), d3.max(data, d => d[axis]*1.2)])
		.range([0, width]);
	return xLinearScale;
}

function yScale(data, axis) {
	let yLinearScale = d3.scaleLinear()
		.domain([d3.min(data, d => d[axis]*.8), d3.max(data, d => d[axis]*1.2)])
		.range([height, 0]);
	return yLinearScale;
}

// Functions for updating x/y axes
// Args: newScale: the x/y linear scale to be implemented
//		 axis: the xAxis or yAxis variable
function renderXAxis(newXScale, xAxis) {
	const bottomAxis = d3.axisBottom(newXScale);

	xAxis.transition()
		.duration(1000)
		.call(bottomAxis);

	return xAxis;
}

function renderYAxis(newYScale, yAxis) {
	const leftAxis = d3.axisLeft(newYScale);

	yAxis.transition()
		.duration(1000)
		.call(leftAxis);

	return yAxis;
}



// Functions for transitioning circle group on update
// Args: 	circlesGroup --- the circlesGroup variable
// 			xScale / yScale --- the variable of the same name
//			xName / yName --- the name of the data column to be transitioned to
// 
function renderCirclesX(circlesGroup, xScale, xName) {
	circlesGroup.transition()
		.duration(1000)
		.attr("cx", d => xScale(d[xName]));

	return circlesGroup;
}

function renderCirclesY(circlesGroup, yScale, yName) {
	circlesGroup.transition()
		.duration(1000)
		.attr("cy", d => yScale(d[yName]));

	return circlesGroup;
}



// Functions for transitioning text labels on update
function renderTextX(textGroup, xScale, xName) {
	textGroup.transition()
		.duration(1000)
		.attr("x", d => xScale(d[xName]));

	return textGroup;
}

function renderTextY(textGroup, yScale, yName) {
	textGroup.transition()
		.duration(1000)
		.attr("y", d => yScale(d[yName])+3);

	return textGroup;
}


// Function for creating and updating tooltip
function updateToolTip(chosenXAxis, chosenYAxis, textGroup) {
	const toolTip = d3.tip()
		.attr("class", "d3-tip")
		.offset([100,-80])
		.html(d => {
			let labelX = "";
			let labelY = "";
			switch (chosenXAxis) {
				case 0:
					labelX = `Poverty: ${d.poverty}%`;
					break;
				case 1:
					labelX = `Median Age: ${d.age}`;
					break;
				case 2:
					labelX = `Median Household Income: ${d.income}`;
					break;
			};
			switch(chosenYAxis) {
				case 0:
					labelY = `Lacks Healthcare: ${d.healthcare}%`;
					break;
				case 1:
					labelY = `Smokes: ${d.smokes}%`;
					break;
				case 2:
					labelY = `Obesity: ${d.obesity}%`;
					break;
			};
			return (`${d.state}<br />${labelX}<br />${labelY}`);
		});

	textGroup.call(toolTip);

	textGroup.on("mouseover", function(data) {
		toolTip.show(data, this);
	})
	.on("mouseout", function(data, index) {
		toolTip.hide(data, this);
	});

	return textGroup;
}


// Retrieve data from CSV file and initialize chart
(async function(){
	let data = await d3.csv("assets/data/data.csv");

	// Parse data
	data.forEach(d => {
		d.poverty = +d.poverty;
		d.age = +d.age;
		d.income = +d.income;
		d.healthcare = +d.healthcare;
		d.obesity = +d.obesity;
		d.smokes = +d.smokes;
	});

	// Create linear scale functions
	let xLinearScale = xScale(data, xAxes[chosenXAxis]);
	let yLinearScale = yScale(data, yAxes[chosenYAxis]);

	// Create initial axis functions
	let bottomAxis = d3.axisBottom(xLinearScale);
	let leftAxis = d3.axisLeft(yLinearScale);

	// append axes
	let xAxis = chartGroup.append("g")
		.attr("transform", `translate(0, ${height})`)
		.call(bottomAxis);
	let yAxis = chartGroup.append("g")
		.call(leftAxis);

	// Append initial circles
	let circlesGroup = chartGroup.selectAll("circle.stateCircle")
		.data(data)
		.enter()
		.append("circle")
		.classed("stateCircle", true)
		.attr("cx", d => xLinearScale(d[xAxes[chosenXAxis]]))
		.attr("cy", d => yLinearScale(d[yAxes[chosenYAxis]]))
		.attr("r", cRadius);

	// Add state abbreviations to the circles
	let textGroup = chartGroup.selectAll("text.stateText")
		.data(data)
		.enter()
		.append("text")
		.classed("stateText", true)
		.text(d => d.abbr)
		.attr('font-size', cRadius-3)
		.attr("x", d => xLinearScale(d[xAxes[chosenXAxis]]))
		.attr("y", d => yLinearScale(d[yAxes[chosenYAxis]])+3);

	// Create group for x axis labels
	const labelsGroupX = chartGroup.append("g")
		.attr("transform", `translate(${width/2}, ${height + 20})`);

	let xLabel = Array(3);

	xLabel[0] = labelsGroupX.append("text")
		.attr("x", 0)
		.attr("y", 20)
		.attr("value", 0)	// value to grab for event listener
		.classed("active", true)
		.text("In Poverty (%)");

	xLabel[1] = labelsGroupX.append("text")
		.attr("x", 0)
		.attr("y", 40)
		.attr("value", 1)	// for event listener
		.classed("inactive", true)
		.text("Age (Median)");

	xLabel[2] = labelsGroupX.append("text")
		.attr("x", 0)
		.attr("y", 60)
		.attr("value", 2)	// for event listener
		.classed("inactive", true)
		.text("Household Income (Median)");

	// Create group for y axis labels
	const labelsGroupY = chartGroup.append("g")
		.attr("transform", "rotate(-90)");

	let yLabel = Array(3);

	yLabel[0] = labelsGroupY.append("text")
		.attr("y", 50-margin.left)
		.attr("x", -height/2)
		.attr("dy", "1em")
		.attr("value", 0)	// for event listener
		.classed("active", true)
		.text("Lacks Healthcare (%)");

	yLabel[1] = labelsGroupY.append("text")
		.attr("y", 30-margin.left)
		.attr("x", -height/2)
		.attr("dy", "1em")
		.attr("value", 1)	// for event listener
		.classed("inactive", true)
		.text("Smokes (%)");

	yLabel[2] = labelsGroupY.append("text")
		.attr("y", 10-margin.left)
		.attr("x", -height/2)
		.attr("dy", "1em")
		.attr("value", 2)	// for event listener
		.classed("inactive", true)
		.text("Obese (%)");



	// Add tool tip
	textGroup = updateToolTip(chosenXAxis, chosenYAxis, textGroup);



	// X axis labels event listener
	labelsGroupX.selectAll("text")
		.on("click", function () {
			// get value of selection
			const value = +d3.select(this).attr("value");

			// If an inactive label is selected, change things
			if (value !== chosenXAxis) {
				// Update tracking variable
				chosenXAxis = value;

				// Update scale
				xLinearScale = xScale(data, xAxes[chosenXAxis]);

				// Update x axis
				xAxis = renderXAxis(xLinearScale, xAxis);
				
				// Update circles
				circlesGroup = renderCirclesX(circlesGroup, xLinearScale, xAxes[chosenXAxis]);

				// Update tool tip
				textGroup = updateToolTip(chosenXAxis, chosenYAxis, textGroup);

				// Update text
				textGroup = renderTextX(textGroup, xLinearScale, xAxes[chosenXAxis]);

				// Toggle active/inactive classes
				xLabel.forEach((xl, i) => {
					xl.classed("active", i===value);
					xl.classed("inactive", i!==value);
				})
			}
		});


	// Y axis labels event listener
	// X axis labels event listener
	labelsGroupY.selectAll("text")
		.on("click", function () {
			// get value of selection
			const value = +d3.select(this).attr("value");

			// If an inactive label is selected, change things
			if (value !== chosenYAxis) {
				// Update tracking variable
				chosenYAxis = value;

				// Update scale
				yLinearScale = yScale(data, yAxes[chosenYAxis]);

				// Update y axis
				yAxis = renderYAxis(yLinearScale, yAxis);
				
				// Update circles
				circlesGroup = renderCirclesY(circlesGroup, yLinearScale, yAxes[chosenYAxis]);

				// Update tool tip
				textGroup = updateToolTip(chosenXAxis, chosenYAxis, textGroup);

				// Update text
				textGroup = renderTextY(textGroup, yLinearScale, yAxes[chosenYAxis]);

				// Toggle active/inactive classes
				yLabel.forEach((yl, i) => {
					yl.classed("active", i===value);
					yl.classed("inactive", i!==value);
				})
			}
		});
})();




