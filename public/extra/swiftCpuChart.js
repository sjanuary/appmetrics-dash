/*******************************************************************************
 * Copyright 2017 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 ******************************************************************************/
/* exported updateCPUData */
// Line chart for displaying cpu data
// System and process data displayed


// Define graph axes
var swift_cpu_xScale = d3.time.scale().range([0, graphWidth]);
var swift_cpu_yScale = d3.scale.linear().range([graphHeight, 0]);

var swift_cpu_yTicks = [0, 25, 50, 75, 100];

var swift_cpu_xAxis = d3.svg.axis()
    .scale(swift_cpu_xScale)
    .orient('bottom')
    .ticks(3)
    .tickFormat(getTimeFormat());

var swift_cpu_yAxis = d3.svg.axis()
    .scale(swift_cpu_yScale)
    .orient('left')
    .tickValues(swift_cpu_yTicks)
    .tickSize(-graphWidth, 0, 0)
    .tickFormat(function(d) {
      return d + '%';
    });

// CPU Data storage
var swift_cpuData = [];

// Define the system CPU usage line
var swift_cpuSystemline = d3.svg.line().interpolate('basis')
    .x(function(d) {
      return swift_cpu_xScale(d.date);
    })
    .y(function(d) {
      return swift_cpu_yScale(d.system);
    });

// Define the process CPU usage line
var swift_cpuProcessline = d3.svg.line().interpolate('basis')
    .x(function(d) {
      return swift_cpu_xScale(d.date);
    })
    .y(function(d) {
      return swift_cpu_yScale(d.process);
    });

// Define the cpuChart
var swift_cpuSVG = d3.select('#cpuDiv2')
    .append('svg')
    .attr('width', canvasWidth)
    .attr('height', canvasHeight)
    .attr('class', 'swift_cpuChart');

var swift_cpuTitleBox = swift_cpuSVG.append('rect')
    .attr('width', canvasWidth)
    .attr('height', 30)
    .attr('class', 'titlebox');

var swift_cpuChart = swift_cpuSVG.append('g')
    .attr('class', 'swift_cpuGroup')
    .attr('transform',
      'translate(' + margin.left + ',' + margin.top + ')');

// Set the input domain for the y axis (fixed)
swift_cpu_yScale.domain([0, 100]);

// Add the systemline path.
swift_cpuChart.append('path')
    .attr('class', 'systemLine')
    .attr('d', swift_cpuSystemline(swift_cpuData));

// Add the processline path.
swift_cpuChart.append('path')
    .attr('class', 'processLine')
    .attr('d', swift_cpuProcessline(swift_cpuData));

// Add the X Axis
swift_cpuChart.append('g')
    .attr('class', 'xAxis')
    .attr('transform', 'translate(0,' + graphHeight + ')')
    .call(swift_cpu_xAxis);

// Add the Y Axis
swift_cpuChart.append('g')
    .attr('class', 'yAxis')
    .call(swift_cpu_yAxis);

// Add the title
swift_cpuChart.append('text')
    .attr('x', 7 - margin.left)
    .attr('y', 15 - margin.top)
    .attr('dominant-baseline', 'central')
    .style('font-size', '18px')
    .text("Swift CPU");

// Add the placeholder text
var swift_cpuChartPlaceholder = swift_cpuChart.append('text')
    .attr('x', graphWidth / 2)
    .attr('y', graphHeight / 2 - 2)
    .attr('text-anchor', 'middle')
    .style('font-size', '18px')
    .text(localizedStrings.NoDataMsg);

// Add the system colour box
swift_cpuChart.append('rect')
    .attr('x', 0)
    .attr('y', graphHeight + margin.bottom - 15)
    .attr('class', 'colourbox1')
    .attr('width', 10)
    .attr('height', 10);

// Add the SYSTEM label
var swift_cpuSystemLabel = swift_cpuChart.append('text')
    .attr('x', 15)
    .attr('y', graphHeight + margin.bottom - 5)
    .attr('text-anchor', 'start')
    .attr('class', 'lineLabel')
    .text(localizedStrings.SystemMsg);

// Add the process colour box
swift_cpuChart.append('rect')
    .attr('x', swift_cpuSystemLabel.node().getBBox().width + 25)
    .attr('y', graphHeight + margin.bottom - 15)
    .attr('width', 10)
    .attr('height', 10)
    .attr('class', 'colourbox2');

// Add the PROCESS label
swift_cpuChart.append('text')
    .attr('x', swift_cpuSystemLabel.node().getBBox().width + 40)
    .attr('y', graphHeight + margin.bottom - 5)
    .attr('class', 'lineLabel2')
    .text(localizedStrings.ApplicationProcessMsg);

var swift_cpuChartIsFullScreen = false;

// Add the maximise button
var swift_cpuResize = swift_cpuSVG.append('image')
    .attr('x', canvasWidth - 30)
    .attr('y', 4)
    .attr('width', 24)
    .attr('height', 24)
    .attr('xlink:href', 'graphmetrics/images/maximize_24_grey.png')
    .attr('class', 'maximize')
    .on('click', function(){
      swift_cpuChartIsFullScreen = !swift_cpuChartIsFullScreen;
      d3.selectAll('.hideable')
        .classed('invisible', swift_cpuChartIsFullScreen);
      d3.select('#cpuDiv2')
        .classed('fullscreen', swift_cpuChartIsFullScreen)
        .classed('invisible', false); // remove invisible from this chart
      if (swift_cpuChartIsFullScreen) {
        d3.select('.swift_cpuChart .maximize')
          .attr('xlink:href', 'graphmetrics/images/minimize_24_grey.png');
        // Redraw this chart only
        resizeSwiftCpuChart();
      } else {
        canvasWidth = $('#cpuDiv2').width() - 8; // -8 for margins and borders
        graphWidth = canvasWidth - margin.left - margin.right;
        d3.select('.swift_cpuChart .maximize')
          .attr('xlink:href', 'graphmetrics/images/maximize_24_grey.png');
        canvasHeight = 250;
        graphHeight = canvasHeight - margin.top - margin.bottom;
        // Redraw all
        resize();
      }
    })
    .on('mouseover', function() {
      if (swift_cpuChartIsFullScreen) {
        d3.select('.swift_cpuChart .maximize')
          .attr('xlink:href', 'graphmetrics/images/minimize_24.png');
      } else {
        d3.select('.swift_cpuChart .maximize')
          .attr('xlink:href', 'graphmetrics/images/maximize_24.png');
      }
    })
    .on('mouseout', function() {
      if (swift_cpuChartIsFullScreen) {
        d3.select('.swift_cpuChart .maximize')
          .attr('xlink:href', 'graphmetrics/images/minimize_24_grey.png');
      } else {
        d3.select('.swift_cpuChart .maximize')
          .attr('xlink:href', 'graphmetrics/images/maximize_24_grey.png');
      }
    });

function resizeSwiftCpuChart() {
  if (swift_cpuChartIsFullScreen) {
    canvasWidth = $('#cpuDiv2').width() - 8; // -8 for margins and borders
    graphWidth = canvasWidth - margin.left - margin.right;
    canvasHeight = $('#cpuDiv2').height() - 100;
    graphHeight = canvasHeight - margin.top - margin.bottom;
  }
  // Redraw placeholder
  swift_cpuChartPlaceholder
    .attr('x', graphWidth / 2)
    .attr('y', graphHeight / 2);

  var chart = d3.select('.swift_cpuChart');
  chart
    .attr('width', canvasWidth)
    .attr('height', canvasHeight);
  swift_cpu_xScale = d3.time.scale().range([0, graphWidth]);
  swift_cpu_yScale = d3.scale.linear().range([graphHeight, 0]);
  swift_cpu_xAxis = d3.svg.axis()
    .scale(swift_cpu_xScale)
    .orient('bottom')
    .ticks(3)
    .tickFormat(getTimeFormat());
  swift_cpu_yAxis = d3.svg.axis()
    .scale(swift_cpu_yScale)
    .orient('left')
    .tickValues(swift_cpu_yTicks)
    .tickSize(-graphWidth, 0, 0)
    .tickFormat(function(d) {
      return d + '%';
    });
  swift_cpuTitleBox.attr('width', canvasWidth);
  swift_cpuResize
    .attr('x', canvasWidth - 30)
    .attr('y', 4);

  // Redraw lines and axes
  swift_cpu_xScale.domain(d3.extent(swift_cpuData, function(d) {
    return d.date;
  }));
  swift_cpu_yScale.domain([0, 100]);
  chart.select('.systemLine')
    .attr('d', swift_cpuSystemline(swift_cpuData));
  chart.select('.processLine')
    .attr('d', swift_cpuProcessline(swift_cpuData));
  chart.select('.xAxis')
    .attr('transform', 'translate(0,' + graphHeight + ')')
    .call(swift_cpu_xAxis);
  chart.select('.yAxis')
    .call(swift_cpu_yAxis);
  chart.select('.colourbox1')
    .attr('y', graphHeight + margin.bottom - 15);
  chart.select('.lineLabel')
    .attr('y', graphHeight + margin.bottom - 5);
  chart.select('.colourbox2')
    .attr('y', graphHeight + margin.bottom - 15);
  chart.select('.lineLabel2')
    .attr('y', graphHeight + margin.bottom - 5);
}

function updateSwiftCPUData(cpuRequest) {
  var cpuRequestData = JSON.parse(cpuRequest);  // parses the data into a JSON array
  if (!cpuRequestData) return;
  var d = cpuRequestData;
  if (d != null && d.hasOwnProperty('time')) {
    d.date = new Date(+d.time);
    d.system = +d.system * 100;
    d.process = +d.process * 100;
    swift_cpuData.push(d);
  }
  if (swift_cpuData.length === 2) {
    // second data point - remove "No Data Available" label
    swift_cpuChartPlaceholder.attr('visibility', 'hidden');
  }
  // Throw away expired data
  var currentTime = Date.now();
  var first = swift_cpuData[0];
  if (first === null) return;
  while (first.hasOwnProperty('date') && first.date.valueOf() + maxTimeWindow < currentTime) {
    swift_cpuData.shift();
    first = swift_cpuData[0];
  }
  // Set the input domain for the x axis
  swift_cpu_xScale.domain(d3.extent(swift_cpuData, function(d) {
    return d.date;
  }));
  swift_cpu_xAxis.tickFormat(getTimeFormat());
  // Select the CPU chart svg element to apply changes
  var selection = d3.select('.swift_cpuChart');
  selection.select('.systemLine')
    .attr('d', swift_cpuSystemline(swift_cpuData));
  selection.select('.processLine')
    .attr('d', swift_cpuProcessline(swift_cpuData));
  selection.select('.xAxis')
    .call(swift_cpu_xAxis);
  selection.select('.yAxis')
    .call(swift_cpu_yAxis);
}
