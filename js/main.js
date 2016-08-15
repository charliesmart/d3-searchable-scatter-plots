/**
 * Searchable scatter plot for TrendCT
 * By Charlie Smart
 **/

var margin, svg, wrap, x, y, dot, xAxis, yAxis, points, data, width, height;

// Style configuration
var defaultColor = 'green',
    defaultStroke = 'black';

// Data configuration
var yVar = 'average.test.score..math.ela.pooled..in.grade.equiv', // y var
    xVar = 'grade.slope.pooled..grade.equivalent.std..gs.',       // x var
    dotSizeVar = 'se.mean_poolgs.',                               // Dot size var
    searchKey = 'education.agency.name';                          // Key to search on


// Path to CSV
d3.csv('ct-district.csv', init)

// Initialize chart
function init(csv) {

    data = csv;
    margin = {top: 10, right: 10, bottom: 30, left: 40};

    // Set up chart area
    svg = d3.select('body')
	.append('svg');
    wrap = svg.append('g')
	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Create groups for axes
    wrap.append('g').classed('x axis', true);
    wrap.append('g').classed('y axis', true);

    // Create axes
    xAxis = d3.axisBottom();
    yAxis = d3.axisLeft()
	.ticks(6)
	.tickFormat(function(d) { return d + ' g'});

    // Get extent of all variables
    var xExtent = d3.extent(data, function(d, i) {return +d[xVar]}),
	yExtent = d3.extent(data, function(d, i) {return +d[yVar]}),
	dotExtent = d3.extent(data, function(d, i) {return +d[dotSizeVar]});

    // Initialize scales
    x = d3.scaleLinear().domain(xExtent);
    y = d3.scaleLinear().domain(yExtent);
    dot = d3.scaleLinear().domain(dotExtent).range([6, 20]); // Range = min/max dot size

    // Create points
    points = wrap.selectAll('.point')
	.data(data)
	.enter()
	.append('circle')
	.attr('fill', defaultFill)
	.attr('stroke', defaultStroke) 
	.attr('stroke-width', 1) // Default stroke width
	.attr('r', function(d) {
	    return dot(+d[dotSizeVar]); 
	}).on('mouseenter', function() {

	    // Hover effects

	    var radius = parseInt(d3.select(this).attr('r'));
	    console.log(radius);
	    d3.select(this).attr('r', radius + 2);
	}).on('mouseout', function() {
	    var radius = parseInt(d3.select(this).attr('r'));
	    console.log(radius);
	    d3.select(this).attr('r', radius + -2);
	});

    // Initialize the search functionality
    searchInit();
    
    // Render the chart
    render();
}

// This is called on chart init and on window resize
function render() {

    // Get window dimensions
    updateDim(window.innerWidth);

    // Creat gridlines
    yAxis.tickSizeInner(-width);

    // Update scales based on dimensions
    x.range([0, width]);
    y.range([height, 0]);

    // Resive svg based on dimensions
    svg.attr('width', width + margin.left + margin.right)
	.attr('height', height + margin.top + margin.bottom);

    // Position the points
    points.attr('cx', function(d) {
	return x(+d[xVar]);
    })
	.attr('cy', function(d) {
	    return y(+d[yVar]);
	})
    
    // Update axes based on new scales
    xAxis.scale(x);
    yAxis.scale(y);

    wrap.select('.x.axis')
	.attr('transform', 'translate(0, ' + height + ')')
	.call(xAxis);

    wrap.select('.y.axis')
	.call(yAxis);

    wrap.select('.y.axis')
}

// Sets chart width and height dynamically based on window width
function updateDim(winWidth) {
    width = winWidth - margin.left - margin.right;
    height = 400 - margin.top - margin.bottom;
}


$(window).on('resize', function(){
    render();
});

// Initializes search
function searchInit() {

    // Empty array to contain search values
    var searchValues = [];

    // Fills search values based on data
    for (var i = 0; i < data.length; i++) {
	searchValues.push(data[i][searchKey]);
    }

    // Sets up bloodhound
    var searchItems = new Bloodhound({
	local: searchValues,
	queryTokenizer: Bloodhound.tokenizers.whitespace,
	datumTokenizer: Bloodhound.tokenizers.whitespace
    });

    // Starts typeahead
    $('.search').typeahead({
	highLight: true,
    }, {
	name: 'school-districts',
	source: searchItems,
    });
}

// Event listener for search bar type
$(document).ready(function(){
    
    // Listens for enter in textbox
    $('.search').keyup(function(e) {
	if (e.keyCode == 13) {
	    searchGraph();
	}
    });

    // Listens for click on search button
    $('.searchButton').on('click', function(){
	searchGraph();
	
    });  
});



    //////////////////////////////////////////////////
    //    THIS IS THE CRUX OF THIS WHOLE THING      //
    //////////////////////////////////////////////////


// Does the actual searching
function searchGraph() {

    // Get contents of search box
    var searchVal = $('#search').val();

    // Sets all points to default style (overrides previous search)
    points.style('fill', defaultFill);
    
    // Selects all points with D3 and then filters them
    points.filter(function(d) {
	return d[searchKey] === searchVal;
    }).style('fill', 'red'); // DO SOMETHING

    /**
     * Once you've selected all the points and filtered them based
     * on your search, you can do whatever you want with them. Here,
     * I've colored selected points red, but the possibilities are
     * based only on what D3 is capable of. For example, you can
     * position a tooltip at the point and populate it with that point's
     * data or something else entirely -- up to you.
     **/
}


