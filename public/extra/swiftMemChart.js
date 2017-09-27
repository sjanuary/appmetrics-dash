/*******************************************************************************
 * Copyright 2017 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License'); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 ******************************************************************************/

// Line chart for showing memory data
// Process and system data displayed

// Define graph axes
var swift_mem_xScale = d3.time.scale().range([0, graphWidth]);
var swift_mem_yScale = d3.scale.linear().range([graphHeight, 0]);

var swift_mem_xAxis = d3.svg.axis()
    .scale(swift_mem_xScale)
    .orient('bottom')
    .ticks(3)
    .tickFormat(getTimeFormat());

var swift_mem_yAxis = d3.svg.axis()
    .scale(swift_mem_yScale)
    .orient('left')
    .ticks(8)
    .tickFormat(function(d) {
      return d3.format('.2s')(d * 1024 * 1024);
    });

// Memory data storage
var swift_memData = [];

// Set input domain for both x and y scales
swift_mem_xScale.domain(d3.extent(swift_memData, function(d) {
  return d.date;
}));

swift_mem_yScale.domain([0, Math.ceil(d3.extent(swift_memData, function(d) {
  return d.system;
})[1] / 100) * 100]);


// Define the process memory line
var swift_mem_processLine = d3.svg.line()
    .x(function(d) {
      return swift_mem_xScale(d.date);
    })
    .y(function(d) {
      return swift_mem_yScale(d.process);
    });

// Define the system swift_memory line
var swift_mem_systemLine = d3.svg.line()
    .x(function(d) {
      return swift_mem_xScale(d.date);
    })
    .y(function(d) {
      return swift_mem_yScale(d.system);
    });

var swift_memProcessLineVisible = true;
var swift_memSystemLineVisible = true;

// Define the memory SVG
var swift_memSVG = d3.select('#memDiv2')
    .append('svg')
    .attr('width', canvasWidth)
    .attr('height', canvasHeight)
    .attr('class', 'swift_memChart');

var swift_memTitleBox = swift_memSVG.append('rect')
    .attr('width', canvasWidth)
    .attr('height', 30)
    .attr('class', 'titlebox');

// Define the swift_memory Chart
var swift_memChart = swift_memSVG.append('g')
    .attr('class', 'swift_memGroup')
    .attr('transform',
      'translate(' + margin.left + ',' + margin.top + ')');

// Add the system line path.
swift_memChart.append('path')
    .attr('class', 'systemLine')
    .attr('d', swift_mem_systemLine(swift_memData));

// Add the process line path.
swift_memChart.append('path')
    .attr('class', 'processLine')
    .attr('d', swift_mem_processLine(swift_memData));

// Add the X Axis
swift_memChart.append('g')
    .attr('class', 'xAxis')
    .attr('transform', 'translate(0,' + graphHeight + ')')
    .call(swift_mem_xAxis);

// Add the Y Axis
swift_memChart.append('g')
    .attr('class', 'yAxis')
    .call(swift_mem_yAxis);

// Add the title
swift_memChart.append('text')
    .attr('x', 7 - margin.left)
    .attr('y', 15 - margin.top)
    .attr('dominant-baseline', 'central')
    .style('font-size', '18px')
    .text("Swift Memory");

// Add the placeholder text
var swift_memChartPlaceholder = swift_memChart.append('text')
    .attr('x', graphWidth / 2)
    .attr('y', graphHeight / 2)
    .attr('text-anchor', 'middle')
    .style('font-size', '18px')
    .text(localizedStrings.NoDataMsg);

// Add the system colour box
swift_memChart.append('rect')
    .attr('x', 0)
    .attr('y', graphHeight + margin.bottom - 15)
    .attr('class', 'colourbox1')
    .attr('width', 10)
    .attr('height', 10);

// Add the system checkbox
swift_memChart.append('foreignObject')
   .attr('class', 'checkboxHolder')
   .attr('x', 15)
   .attr('y', graphHeight + margin.bottom - 25)
   .attr('width', 30)
   .attr('height', 25)
   .append('xhtml:tree')
   .html('<label class=\'inline\'><input type=\'checkbox\' id=swift_memChartSystemCheckbox checked>' +
     '<span class=\'lbl\'></span></label>')
   .on('click', function(){
      swift_memSystemLineVisible = swift_memSVG.select('#swift_memChartSystemCheckbox').node().checked;
      resizeSwiftMemChart();
   });

// Add the SYSTEM label
var swift_memSystemLabel = swift_memChart.append('text')
    .attr('x', 35)
    .attr('y', graphHeight + margin.bottom - 5)
    .attr('text-anchor', 'start')
    .attr('class', 'lineLabel')
    .text(localizedStrings.SystemMsg);

// Add the process colour box
swift_memChart.append('rect')
    .attr('x', swift_memSystemLabel.node().getBBox().width + 45)
    .attr('y', graphHeight + margin.bottom - 15)
    .attr('width', 10)
    .attr('height', 10)
    .attr('class', 'colourbox2');


// Add the process checkbox
swift_memChart.append('foreignObject')
   .attr('class', 'checkboxHolder')
   .attr('x', swift_memSystemLabel.node().getBBox().width + 60)
   .attr('y', graphHeight + margin.bottom - 25)
   .attr('width', 30)
   .attr('height', 25)
   .append('xhtml:tree')
   .html('<label class=\'inline\'><input type=\'checkbox\' id=swift_memChartProcessCheckbox checked>' +
     '<span class=\'lbl\'></span></label>')
   .on('click', function(){
      swift_memProcessLineVisible = swift_memSVG.select('#swift_memChartProcessCheckbox').node().checked;
      resizeSwiftMemChart();
   });

// Add the PROCESS label
swift_memChart.append('text')
    .attr('x', swift_memSystemLabel.node().getBBox().width + 80)
    .attr('y', graphHeight + margin.bottom - 5)
    .attr('class', 'lineLabel2')
    .text(localizedStrings.ApplicationProcessMsg);

var swift_memChartIsFullScreen = false;

// Add the maximise button
var swift_memResize = swift_memSVG.append('image')
    .attr('x', canvasWidth - 30)
    .attr('y', 4)
    .attr('width', 24)
    .attr('height', 24)
    .attr('xlink:href', 'graphmetrics/images/maximize_24_grey.png')
    .attr('class', 'maximize')
    .on('click', function(){
      swift_memChartIsFullScreen = !swift_memChartIsFullScreen;
      d3.selectAll('.hideable')
        .classed('invisible', swift_memChartIsFullScreen);
      d3.select('#memDiv2')
        .classed('fullscreen', swift_memChartIsFullScreen)
        .classed('invisible', false); // remove invisible from this chart
      if (swift_memChartIsFullScreen) {
        d3.select('.swift_memChart .maximize')
          .attr('xlink:href', 'graphmetrics/images/minimize_24_grey.png');
        // Redraw this chart only
        resizeSwiftMemChart();
      } else {
        canvasWidth = $('#memDiv2').width() - 8; // -8 for margins and borders
        graphWidth = canvasWidth - margin.left - margin.right;
        d3.select('.swift_memChart .maximize')
          .attr('xlink:href', 'graphmetrics/images/maximize_24_grey.png');
        canvasHeight = 250;
        graphHeight = canvasHeight - margin.top - margin.bottom;
        // Redraw all
        resize();
      }
    })
    .on('mouseover', function() {
      if (swift_memChartIsFullScreen) {
        d3.select('.swift_memChart .maximize')
          .attr('xlink:href', 'graphmetrics/images/minimize_24.png');
      } else {
        d3.select('.swift_memChart .maximize')
          .attr('xlink:href', 'graphmetrics/images/maximize_24.png');
      }
    })
    .on('mouseout', function() {
      if (swift_memChartIsFullScreen) {
        d3.select('.swift_memChart .maximize')
          .attr('xlink:href', 'graphmetrics/images/minimize_24_grey.png');
      } else {
        d3.select('.swift_memChart .maximize')
          .attr('xlink:href', 'graphmetrics/images/maximize_24_grey.png');
      }
    });

function resizeSwiftMemChart() {
  if (swift_memChartIsFullScreen) {
    canvasWidth = $('#memDiv2').width() - 8; // -8 for margins and borders
    graphWidth = canvasWidth - margin.left - margin.right;
    canvasHeight = $('#memDiv2').height() - 100;
    graphHeight = canvasHeight - margin.top - margin.bottom;
  }
  // Redraw placeholder
  swift_memChartPlaceholder
    .attr('x', graphWidth / 2)
    .attr('y', graphHeight / 2);
  var chart = d3.select('.swift_memChart');
  chart
    .attr('width', canvasWidth)
    .attr('height', canvasHeight);
  swift_mem_xScale = d3.time.scale().range([0, graphWidth]);
  swift_mem_xAxis = d3.svg.axis()
    .scale(swift_mem_xScale)
    .orient('bottom')
    .ticks(3)
    .tickFormat(getTimeFormat());
  swift_memTitleBox
    .attr('width', canvasWidth);
  swift_memResize
    .attr('x', canvasWidth - 30)
    .attr('y', 4);
  // Redraw lines and axes
  swift_mem_xScale.domain(d3.extent(swift_memData, function(d) {
    return d.date;
  }));
  swift_mem_yScale = d3.scale.linear().range([graphHeight, 0]);
  swift_mem_yAxis = d3.svg.axis()
    .scale(swift_mem_yScale)
    .orient('left')
    .ticks(8)
    .tickFormat(function(d) {
      return d3.format('.2s')(d * 1024 * 1024);
    });
  swift_mem_yScale.domain([0, Math.ceil(d3.extent(swift_memData, function(d) {
    if (swift_memSystemLineVisible) {
      return d.system;
    } else {
      return d.process;
    }
  })[1] / 100) * 100]);
  chart.select('.systemLine')
    .attr('d', swift_mem_systemLine(swift_memData))
    .attr('visibility', swift_memSystemLineVisible ? 'visible' : 'hidden');
  chart.select('.processLine')
    .attr('d', swift_mem_processLine(swift_memData))
    .attr('visibility', swift_memProcessLineVisible ? 'visible' : 'hidden');
  chart.select('.xAxis')
    .attr('transform', 'translate(0,' + graphHeight + ')')
    .call(swift_mem_xAxis);
  chart.select('.yAxis')
    .call(swift_mem_yAxis);
  // Move labels
  chart.select('.colourbox1')
    .attr('y', graphHeight + margin.bottom - 15);
  chart.select('.lineLabel')
    .attr('y', graphHeight + margin.bottom - 5);
  chart.selectAll('.checkboxHolder')
    .attr('y', graphHeight + margin.bottom - 25);
  chart.select('.colourbox2')
    .attr('y', graphHeight + margin.bottom - 15);
  chart.select('.lineLabel2')
    .attr('y', graphHeight + margin.bottom - 5);
}

function updateSwiftMemData(memRequest) {
	// Get the data again
  var data = JSON.parse(memRequest);  // parses the data into a JSON array
  if (!data) return;
  var d = data;
  d.date = new Date(+d.time);
  d.system = +d.physical_used / (1024 * 1024);
  d.process = +d.physical / (1024 * 1024);
  swift_memData.push(d);
  if (swift_memData.length === 2) {
    // second data point - remove 'No Data Available' label
    swift_memChartPlaceholder.attr('visibility', 'hidden');
  }
  // Only keep 30 minutes of data
  var currentTime = Date.now();
  var d0 = swift_memData[0];
  if (d0 === null) return;
  while (d0.hasOwnProperty('date') && d0.date.valueOf() + maxTimeWindow < currentTime) {
    swift_memData.shift();
    d0 = swift_memData[0];
  }
  // Set the input domain for the axes
  swift_mem_xScale.domain(d3.extent(swift_memData, function(d) {
    return d.date;
  }));
  swift_mem_yScale.domain([0, Math.ceil(d3.extent(swift_memData, function(d) {
    if (swift_memSystemLineVisible) {
      return d.system;
    } else {
      return d.process;
    }
  })[1] / 100) * 100]);
  swift_mem_xAxis.tickFormat(getTimeFormat());
  // Select the section we want to apply our changes to
  var selection = d3.select('.swift_memChart');
  // Make the changes
  selection.select('.systemLine')
    .attr('d', swift_mem_systemLine(swift_memData));
  selection.select('.processLine')
    .attr('d', swift_mem_processLine(swift_memData));
  selection.select('.xAxis')
    .call(swift_mem_xAxis);
  selection.select('.yAxis')
    .call(swift_mem_yAxis);
//  selection.select('.processLatest')
//    .text(memProcessLatest + 'MB');
//  selection.select('.systemLatest')
//    .text(memSystemLatest + 'MB');
}
