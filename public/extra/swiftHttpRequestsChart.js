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

// Line chart for displaying http requests with time and duration
var swift_http_xScale = d3.time.scale().range([0, httpGraphWidth]);
var swift_http_yScale = d3.scale.linear().range([tallerGraphHeight, 0]);
var swift_httpData = [];

var swift_http_xAxis = d3.svg.axis()
    .scale(swift_http_xScale)
    .orient('bottom')
    .ticks(3)
    .tickFormat(getTimeFormat());

var swift_http_yAxis = d3.svg.axis()
    .scale(swift_http_yScale)
    .orient('left')
    .ticks(5)
    .tickFormat(function(d) {
      return d + 'ms';
    });

var mouseOverSwiftHttpGraph = false;

// Define the HTTP request time line
var swift_httpline = d3.svg.line()
    .x(function(d) {
      return swift_http_xScale(d.time);
    })
    .y(function(d) {
      return swift_http_yScale(d.longest);
    });

var swift_httpSVG = d3.select('#httpDiv2')
    .append('svg')
    .attr('width', httpCanvasWidth)
    .attr('height', canvasHeight)
    .attr('class', 'swift_httpChart')
    .on('mouseover', function() {
      mouseOverSwiftHttpGraph = true;
    })
    .on('mouseout', function() {
      mouseOverSwiftHttpGraph = false;
    });

var swift_httpTitleBox = swift_httpSVG.append('rect')
    .attr('width', httpCanvasWidth)
    .attr('height', 30)
    .attr('class', 'titlebox');

var swift_httpChart = swift_httpSVG.append('g')
    .attr('transform',
      'translate(' + margin.left + ',' + margin.top + ')');

// Create the line
swift_httpChart.append('path')
    .attr('class', 'swift_httpline')
    .attr('d', swift_httpline(swift_httpData));

// Define the axes
swift_httpChart.append('g')
    .attr('class', 'xAxis')
    .attr('transform', 'translate(0,' + tallerGraphHeight + ')')
    .call(swift_http_xAxis);

swift_httpChart.append('g')
    .attr('class', 'yAxis')
    .call(swift_http_yAxis);

// Add the title
swift_httpChart.append('text')
    .attr('x', 7 - margin.left)
    .attr('y', 15 - margin.top)
    .attr('dominant-baseline', 'central')
    .style('font-size', '18px')
    .text("Swift Incoming HTTP Requests");

// Add the placeholder text
var swift_httpChartPlaceholder = swift_httpChart.append('text')
    .attr('x', httpGraphWidth / 2)
    .attr('y', tallerGraphHeight / 2)
    .attr('text-anchor', 'middle')
    .style('font-size', '18px')
    .text(localizedStrings.NoDataMsg);

function updateSwiftHttpData(httpRequest) {
  var httpRequestData = JSON.parse(httpRequest);
  if (!httpRequestData) return;
  var httpLength = swift_httpData.length;
  httpRequestData.longest = parseFloat(httpRequestData.longest);
  httpRequestData.average = parseFloat(httpRequestData.average);
  httpRequestData.time = parseInt(httpRequestData.time, 10);
  httpRequestData.total = parseInt(httpRequestData.total, 10);
  if (httpRequestData.total > 0) {
    if (httpLength === 0) {
      // first data - remove "No Data Available" label
      swift_httpChartPlaceholder.attr('visibility', 'hidden');
    }
    // Check to see if the request started before previous request(s)
    if (httpLength > 0 && (httpRequestData.time < swift_httpData[httpLength - 1].time)) {
      var i = httpLength - 1;
      while (i >= 0 && httpRequestData.time < swift_httpData[i].time) {
        i--;
      }
      // Insert the data into the right place
      swift_httpData.splice(i + 1, 0, httpRequestData);
    } else {
      swift_httpData.push(httpRequestData);
    }
  }
  if (swift_httpData.length === 0) return;
  // Only keep 'maxTimeWindow' amount of data
  let currentTime = Date.now();
  var startTime = monitoringStartTime.getTime();
  if (startTime + maxTimeWindow < currentTime) {
    startTime = currentTime - maxTimeWindow;
  }
  if (swift_httpData.length > 1) {
    var d0 = swift_httpData[0];
    while (d0.hasOwnProperty('time') && d0.time < startTime) {
      swift_httpData.shift();
      d0 = swift_httpData[0];
    }
  }
  // Don't redraw graph if mouse is over it (keeps it still for tooltips)
  if (!mouseOverSwiftHttpGraph) {
    // Set the input domain for x and y axes
    swift_http_xScale.domain([startTime, currentTime]);
    swift_http_yScale.domain([0, d3.max(swift_httpData, function(d) {
      return d.longest;
    })]);
    swift_http_xAxis.tickFormat(getTimeFormat());

    var selection = d3.select('.swift_httpChart');
    selection.select('.swift_httpline')
      .attr('d', swift_httpline(swift_httpData));
    selection.select('.xAxis')
      .call(swift_http_xAxis);
    selection.select('.yAxis')
      .call(swift_http_yAxis);

    // Re-adjust the points
    var points = selection.selectAll('.point').data(swift_httpData)
      .attr('cx', function(d) { return swift_http_xScale(d.time); })
      .attr('cy', function(d) { return swift_http_yScale(d.longest); });
    points.exit().remove();
    points.enter().append('circle')
      .attr('class', 'point')
      .attr('r', 4)
      .style('fill', '#5aaafa')
      .style('stroke', 'white')
      .attr('transform',
        'translate(' + margin.left + ',' + margin.top + ')')
      .attr('cx', function(d) { return swift_http_xScale(d.time); })
      .attr('cy', function(d) { return swift_http_yScale(d.longest); })
      .append('svg:title').text(function(d) { // tooltip
        if (d.total === 1) {
          return d.url;
        } else {
          return d.total
          + ' requests\n average duration = '
          + d3.format('.2s')(d.average / 1000)
          + 's\n longest duration = '
          + d3.format('.2s')(d.longest / 1000)
          + 's for URL: ' + d.url;
        }
      });
  }
}

var swift_httpChartIsFullScreen = false;

// Add the maximise/minimise button
var swift_httpResize = swift_httpSVG.append('image')
    .attr('x', httpCanvasWidth - 30)
    .attr('y', 4)
    .attr('width', 24)
    .attr('height', 24)
    .attr('xlink:href', 'graphmetrics/images/maximize_24_grey.png')
    .attr('class', 'maximize')
    .on('click', function(){
      swift_httpChartIsFullScreen = !swift_httpChartIsFullScreen;
      d3.selectAll('.hideable')
        .classed('invisible', swift_httpChartIsFullScreen);
      d3.select('#httpDiv2')
        .classed('fullscreen', swift_httpChartIsFullScreen)
        .classed('invisible', false); // remove invisible from this chart
      if (swift_httpChartIsFullScreen) {
        d3.select('.swift_httpChart .maximize')
          .attr('xlink:href', 'graphmetrics/images/minimize_24_grey.png');
        // Redraw this chart only
        resizeSwiftHttpChart();
      } else {
        d3.select('.swift_httpChart .maximize')
          .attr('xlink:href', 'graphmetrics/images/maximize_24_grey.png');
        canvasHeight = 250;
        tallerGraphHeight = canvasHeight - margin.top - margin.shortBottom;
        // Redraw all
        resize();
      }
    })
    .on('mouseover', function() {
      if (swift_httpChartIsFullScreen) {
        d3.select('.swift_httpChart .maximize')
          .attr('xlink:href', 'graphmetrics/images/minimize_24.png');
      } else {
        d3.select('.swift_httpChart .maximize')
          .attr('xlink:href', 'graphmetrics/images/maximize_24.png');
      }
    })
    .on('mouseout', function() {
      if (swift_httpChartIsFullScreen) {
        d3.select('.swift_httpChart .maximize')
          .attr('xlink:href', 'graphmetrics/images/minimize_24_grey.png');
      } else {
        d3.select('.swift_httpChart .maximize')
          .attr('xlink:href', 'graphmetrics/images/maximize_24_grey.png');
      }
    });

function resizeSwiftHttpChart() {
  httpCanvasWidth = $('#httpDiv2').width() - 8; // -8 for margins and borders
  httpGraphWidth = httpCanvasWidth - margin.left - margin.right;
  if (swift_httpChartIsFullScreen) {
    canvasHeight = $('#httpDiv2').height() - 100;
    tallerGraphHeight = canvasHeight - margin.top - margin.shortBottom;
  }
  // Redraw placeholder
  swift_httpChartPlaceholder
    .attr('x', httpGraphWidth / 2)
    .attr('y', tallerGraphHeight / 2);
  swift_httpResize
    .attr('x', httpCanvasWidth - 30)
    .attr('y', 4);
  var chart = d3.select('.swift_httpChart');
  chart
    .attr('width', httpCanvasWidth)
    .attr('height', canvasHeight);
  swift_http_xScale = d3.time.scale()
    .range([0, httpGraphWidth]);
  swift_http_xAxis = d3.svg.axis()
    .scale(swift_http_xScale)
    .orient('bottom')
    .ticks(3)
    .tickFormat(getTimeFormat());
  swift_http_yScale = d3.scale.linear().range([tallerGraphHeight, 0]);
  swift_http_yAxis = d3.svg.axis()
    .scale(swift_http_yScale)
    .orient('left')
    .ticks(5)
    .tickFormat(function(d) {
      return d + 'ms';
    });
  swift_httpTitleBox.attr('width', httpCanvasWidth);
  let currentTime = Date.now();
  var startTime = monitoringStartTime.getTime();
  if (startTime + maxTimeWindow < currentTime) {
    startTime = currentTime - maxTimeWindow;
  }
  swift_http_xScale.domain([startTime, currentTime]);
  swift_http_yScale.domain([0, d3.max(swift_httpData, function(d) {
    return d.longest;
  })]);
  chart.selectAll('circle').remove();
  chart.select('.swift_httpline')
    .attr('d', swift_httpline(swift_httpData));
  chart.select('.xAxis')
    .attr('transform', 'translate(0,' + tallerGraphHeight + ')')
    .call(swift_http_xAxis);
  chart.select('.yAxis')
    .call(swift_http_yAxis);
  chart.selectAll('point')
    .data(swift_httpData)
    .enter().append('circle')
    .attr('class', 'point')
    .attr('r', 4)
    .style('fill', '#5aaafa')
    .style('stroke', 'white')
    .attr('transform',
      'translate(' + margin.left + ',' + margin.top + ')')
    .attr('cx', function(d) { return swift_http_xScale(d.time); })
    .attr('cy', function(d) { return swift_http_yScale(d.longest); })
    .append('svg:title').text(function(d) { // tooltip
      if (d.total === 1) {
        return d.url;
      } else {
        return d.total
        + ' requests\n average duration = '
        + d3.format('.2s')(d.average / 1000)
        + 's\n longest duration = '
        + d3.format('.2s')(d.longest / 1000)
        + 's for URL: ' + d.url;
      }
    });
}
