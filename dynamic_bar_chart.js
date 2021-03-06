var height = 500, width = 800, data = [];
//Margins on bottom and left are larger to provide room for axes.
var margin = {top: Math.round(0.05 * height),
							right: Math.round(0.05 * width),
							bottom: Math.round(0.1 * height),
							left: Math.round(0.1 * width)};
var innerHeight = height - margin.top - margin.bottom;
var innerWidth = width - margin.left - margin.right;
//Add SVG element to body.
var svg = d3.select('body').append('svg')
	.attr('height', height)
	.attr('width', width);
//Provide a visible frame around the SVG element.
//In the code below the rect elements forming the bars are members of class 'bar'; in this way they are distinguished from the rect forming the frame.
svg.append('rect')
	.attr('height', height)
	.attr('width', width)
	.style('fill', 'none')
	.style('stroke', 'gray')
	.style('stroke-width', '1px');
//Generate an SVG grouping element shifted with respect to the left and top margins.
var inner = svg.append('g')
	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

function update_data(action) {
	if (action == 'push') {
		data.push(Math.random());
	} else
	if (action == 'unshift') {
		data.unshift(Math.random());
	} else
	if (action == 'pop') {
		data.pop();
	} else
	if (action == 'shift') {
		data.shift();
	} else
	if (action == 'slideLeft') {
		update_data('push');
		update_data('shift');
	} else
	if (action == 'slideRight') {
		update_data('unshift');
		update_data('pop');
	}
}
function randomize(lolim) {
	//Select a random number of bars between lolim and 32. Beyond 32 bars, the chart becomes too crowded for good readability.
	//In the present function we avoid generating fewer than 2 bars (unless lolim is explicitly set below 2) as the user might view the absence of bars, or even just 1 bar, as a bug if produced by randomize().
	//On the other hand, if the user is manually removing bars through actions that call update_data() then it is natural for 1 and then 0 bars to eventually be reached. In that context I conjecture the user is unlikely to view 1 or 0 bars as a bug. 
	if (lolim == undefined) lolim = 2;
	var nb = Math.round(lolim + Math.random() * (32 - lolim));
	data = Array(nb);
	//Select bar heights in the range [0, 1).
	for (var ii = 0; ii < nb; ++ii) data[ii] = Math.random();
}
d3.select('#push').on('click', function() {
	update_data('push');
	update_chart(data);
});
d3.select('#pop').on('click', function() {
	update_data('pop');
	update_chart(data);
});
d3.select('#unshift').on('click', function() {
	update_data('unshift');
	update_chart(data);
});
d3.select('#shift').on('click', function() {
	update_data('shift');
	update_chart(data);
});
d3.select('#randomize').on('click', function() {
	randomize();
	update_chart(data);
});
d3.select('#slideLeft').on('click', function() {
	update_data('slideLeft');
	update_chart(data);
});
d3.select('#slideRight').on('click', function() {
	update_data('slideRight');
	update_chart(data);
});
//Generate scales. Domains are set in the update_chart function.
xScale = d3.scaleBand().range([0, innerWidth]).padding(0.1);
//For the y-axis to display properly the range must go from high to low.
yScale = d3.scaleLinear().range([innerHeight, 0]);

function update_chart(data) {
	//Set scale domains. The bars are numbered beginning with 1.
	xScale.domain(d3.range(data.length + 1).slice(1));
	yScale.domain([0, d3.max(data)]);

	//Generate axes.
	//First remove any prior axes.
	svg.selectAll('.axis').remove();
	svg.append('g').attr('class', 'axis')
	.attr('transform', 'translate(' + margin.left + ',' + (margin.top + innerHeight) + ')')
	//NOTE: If a call to ticks(<n>) is included below it has no effect.
	//This makes sense as scaleBand is designed to accomodate categorical data.
	.call(d3.axisBottom(xScale).tickSizeOuter(0));
	svg.append('g').attr('class', 'axis')
	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
	.call(d3.axisLeft(yScale).tickSizeOuter(0));

	//Add, remove, update bars as appropriate.
	var bars = inner.selectAll('.bar').data(data);
	bars.enter().append('rect')
			.attr('class', 'bar')
			.style('fill', 'rgba(0, 128, 128, 0.75)')
			.style('opacity', 0.5)
		.merge(bars)
			.attr('x', function(d, i) { return xScale(i + 1); })
			.attr('y', function(d, i) { return yScale(d); })
			.attr('width', xScale.bandwidth())
			.attr('height', function(d, i) { return innerHeight - yScale(d); });
	bars.exit().remove();
}

//Begin by generating a chart.
randomize(5);
update_chart(data);
