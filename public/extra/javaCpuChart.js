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
var java_cpu_xScale = d3.time.scale().range([0, graphWidth]);
var java_cpu_yScale = d3.scale.linear().range([graphHeight, 0]);

var java_cpu_yTicks = [0, 25, 50, 75, 100];

var java_cpu_xAxis = d3.svg.axis()
    .scale(java_cpu_xScale)
    .orient('bottom')
    .ticks(3)
    .tickFormat(getTimeFormat());

var java_cpu_yAxis = d3.svg.axis()
    .scale(java_cpu_yScale)
    .orient('left')
    .tickValues(java_cpu_yTicks)
    .tickSize(-graphWidth, 0, 0)
    .tickFormat(function(d) {
      return d + '%';
    });

// CPU Data storage
var java_cpuData = [];

// Define the system CPU usage line
var java_cpuSystemline = d3.svg.line().interpolate('basis')
    .x(function(d) {
      return java_cpu_xScale(d.date);
    })
    .y(function(d) {
      return java_cpu_yScale(d.system);
    });

// Define the process CPU usage line
var java_cpuProcessline = d3.svg.line().interpolate('basis')
    .x(function(d) {
      return java_cpu_xScale(d.date);
    })
    .y(function(d) {
      return java_cpu_yScale(d.process);
    });

// Define the cpuChart
var java_cpuSVG = d3.select('#cpuDiv3')
    .append('svg')
    .attr('width', canvasWidth)
    .attr('height', canvasHeight)
    .attr('class', 'java_cpuChart');

var java_cpuTitleBox = java_cpuSVG.append('rect')
    .attr('width', canvasWidth)
    .attr('height', 30)
    .attr('class', 'titlebox');

var java_cpuChart = java_cpuSVG.append('g')
    .attr('class', 'java_cpuGroup')
    .attr('transform',
      'translate(' + margin.left + ',' + margin.top + ')');

// Set the input domain for the y axis (fixed)
java_cpu_yScale.domain([0, 100]);

// Add the systemline path.
java_cpuChart.append('path')
    .attr('class', 'systemLine')
    .attr('d', java_cpuSystemline(java_cpuData));

// Add the processline path.
java_cpuChart.append('path')
    .attr('class', 'processLine')
    .attr('d', java_cpuProcessline(java_cpuData));

// Add the X Axis
java_cpuChart.append('g')
    .attr('class', 'xAxis')
    .attr('transform', 'translate(0,' + graphHeight + ')')
    .call(java_cpu_xAxis);

// Add the Y Axis
java_cpuChart.append('g')
    .attr('class', 'yAxis')
    .call(java_cpu_yAxis);

// Add the title
java_cpuChart.append('text')
    .attr('x', 7 - margin.left)
    .attr('y', 15 - margin.top)
    .attr('dominant-baseline', 'central')
    .style('font-size', '18px')
    .text("Java CPU");

// Add the placeholder text
var java_cpuChartPlaceholder = java_cpuChart.append('text')
    .attr('x', graphWidth / 2)
    .attr('y', graphHeight / 2 - 2)
    .attr('text-anchor', 'middle')
    .style('font-size', '18px')
    .text(localizedStrings.NoDataMsg);

// Add the system colour box
java_cpuChart.append('rect')
    .attr('x', 0)
    .attr('y', graphHeight + margin.bottom - 15)
    .attr('class', 'colourbox1')
    .attr('width', 10)
    .attr('height', 10);

// Add the SYSTEM label
var java_cpuSystemLabel = java_cpuChart.append('text')
    .attr('x', 15)
    .attr('y', graphHeight + margin.bottom - 5)
    .attr('text-anchor', 'start')
    .attr('class', 'lineLabel')
    .text(localizedStrings.SystemMsg);

// Add the process colour box
java_cpuChart.append('rect')
    .attr('x', java_cpuSystemLabel.node().getBBox().width + 25)
    .attr('y', graphHeight + margin.bottom - 15)
    .attr('width', 10)
    .attr('height', 10)
    .attr('class', 'colourbox2');

// Add the PROCESS label
java_cpuChart.append('text')
    .attr('x', java_cpuSystemLabel.node().getBBox().width + 40)
    .attr('y', graphHeight + margin.bottom - 5)
    .attr('class', 'lineLabel2')
    .text(localizedStrings.ApplicationProcessMsg);

var java_cpuChartIsFullScreen = false;

// Add the maximise button
var java_cpuResize = java_cpuSVG.append('image')
    .attr('x', canvasWidth - 30)
    .attr('y', 4)
    .attr('width', 24)
    .attr('height', 24)
    .attr('xlink:href', 'graphmetrics/images/maximize_24_grey.png')
    .attr('class', 'maximize')
    .on('click', function(){
      java_cpuChartIsFullScreen = !java_cpuChartIsFullScreen;
      d3.selectAll('.hideable')
        .classed('invisible', java_cpuChartIsFullScreen);
      d3.select('#cpuDiv3')
        .classed('fullscreen', java_cpuChartIsFullScreen)
        .classed('invisible', false); // remove invisible from this chart
      if (java_cpuChartIsFullScreen) {
        d3.select('.java_cpuChart .maximize')
          .attr('xlink:href', 'graphmetrics/images/minimize_24_grey.png');
        // Redraw this chart only
        resizejavaCpuChart();
      } else {
        canvasWidth = $('#cpuDiv3').width() - 8; // -8 for margins and borders
        graphWidth = canvasWidth - margin.left - margin.right;
        d3.select('.java_cpuChart .maximize')
          .attr('xlink:href', 'graphmetrics/images/maximize_24_grey.png');
        canvasHeight = 250;
        graphHeight = canvasHeight - margin.top - margin.bottom;
        // Redraw all
        resize();
      }
    })
    .on('mouseover', function() {
      if (java_cpuChartIsFullScreen) {
        d3.select('.java_cpuChart .maximize')
          .attr('xlink:href', 'graphmetrics/images/minimize_24.png');
      } else {
        d3.select('.java_cpuChart .maximize')
          .attr('xlink:href', 'graphmetrics/images/maximize_24.png');
      }
    })
    .on('mouseout', function() {
      if (java_cpuChartIsFullScreen) {
        d3.select('.java_cpuChart .maximize')
          .attr('xlink:href', 'graphmetrics/images/minimize_24_grey.png');
      } else {
        d3.select('.java_cpuChart .maximize')
          .attr('xlink:href', 'graphmetrics/images/maximize_24_grey.png');
      }
    });

function resizeJavaCpuChart() {
  if (java_cpuChartIsFullScreen) {
    canvasWidth = $('#cpuDiv3').width() - 8; // -8 for margins and borders
    graphWidth = canvasWidth - margin.left - margin.right;
    canvasHeight = $('#cpuDiv3').height() - 100;
    graphHeight = canvasHeight - margin.top - margin.bottom;
  }
  // Redraw placeholder
  java_cpuChartPlaceholder
    .attr('x', graphWidth / 2)
    .attr('y', graphHeight / 2);

  var chart = d3.select('.java_cpuChart');
  chart
    .attr('width', canvasWidth)
    .attr('height', canvasHeight);
  java_cpu_xScale = d3.time.scale().range([0, graphWidth]);
  java_cpu_yScale = d3.scale.linear().range([graphHeight, 0]);
  java_cpu_xAxis = d3.svg.axis()
    .scale(java_cpu_xScale)
    .orient('bottom')
    .ticks(3)
    .tickFormat(getTimeFormat());
  java_cpu_yAxis = d3.svg.axis()
    .scale(java_cpu_yScale)
    .orient('left')
    .tickValues(java_cpu_yTicks)
    .tickSize(-graphWidth, 0, 0)
    .tickFormat(function(d) {
      return d + '%';
    });
  java_cpuTitleBox.attr('width', canvasWidth);
  java_cpuResize
    .attr('x', canvasWidth - 30)
    .attr('y', 4);

  // Redraw lines and axes
  java_cpu_xScale.domain(d3.extent(java_cpuData, function(d) {
    return d.date;
  }));
  java_cpu_yScale.domain([0, 100]);
  chart.select('.systemLine')
    .attr('d', java_cpuSystemline(java_cpuData));
  chart.select('.processLine')
    .attr('d', java_cpuProcessline(java_cpuData));
  chart.select('.xAxis')
    .attr('transform', 'translate(0,' + graphHeight + ')')
    .call(java_cpu_xAxis);
  chart.select('.yAxis')
    .call(java_cpu_yAxis);
  chart.select('.colourbox1')
    .attr('y', graphHeight + margin.bottom - 15);
  chart.select('.lineLabel')
    .attr('y', graphHeight + margin.bottom - 5);
  chart.select('.colourbox2')
    .attr('y', graphHeight + margin.bottom - 15);
  chart.select('.lineLabel2')
    .attr('y', graphHeight + margin.bottom - 5);
}

function updateJavaCPUData(cpuRequest) {
  var cpuRequestData = JSON.parse(cpuRequest);  // parses the data into a JSON array
  if (!cpuRequestData) return;
  var d = cpuRequestData;
  if (d != null && d.hasOwnProperty('time')) {
    d.date = new Date(+d.time);
    d.system = +d.system * 100;
    d.process = +d.process * 100;
    java_cpuData.push(d);
  }
  if (java_cpuData.length === 2) {
    // second data point - remove "No Data Available" label
    java_cpuChartPlaceholder.attr('visibility', 'hidden');
  }
  // Throw away expired data
  var currentTime = Date.now();
  var first = java_cpuData[0];
  if (first === null) return;
  while (first.hasOwnProperty('date') && first.date.valueOf() + maxTimeWindow < currentTime) {
    java_cpuData.shift();
    first = java_cpuData[0];
  }
  // Set the input domain for the x axis
  java_cpu_xScale.domain(d3.extent(java_cpuData, function(d) {
    return d.date;
  }));
  java_cpu_xAxis.tickFormat(getTimeFormat());
  // Select the CPU chart svg element to apply changes
  var selection = d3.select('.java_cpuChart');
  selection.select('.systemLine')
    .attr('d', java_cpuSystemline(java_cpuData));
  selection.select('.processLine')
    .attr('d', java_cpuProcessline(java_cpuData));
  selection.select('.xAxis')
    .call(java_cpu_xAxis);
  selection.select('.yAxis')
    .call(java_cpu_yAxis);
}
