'use strict';
/*
1. make a filterByYear function

*/

(function () {

  let data = "no data";
  let allYearsData = "no data";
  let svgScatterPlot = ""; // keep SVG reference in global scope
  let svgLineGraph = "";
  let div = "";

  // load data and make scatter plot after window loads
  window.onload = function () {
    svgLineGraph = d3.select('body')
      .append('svg')
      .attr('width', 500)
      .attr('height', 500);

    div = d3
      .select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    svgScatterPlot = div
      .append('svg')
      .attr('width', 500)
      .attr('height', 500);
    // d3.csv is basically fetch but it can be be passed a csv file as a parameter
    d3.csv("./data/dataEveryYear.csv")
      .then((csvData) => {
        data = csvData
        allYearsData = csvData;
        makeLineGraph("AUS");
      });
    /*
    .then(() => {
      let timeExtent = d3.extent(allYearsData.map((row) => row["time"]));
      console.log(timeExtent);
      for (let i = timeExtent[0]; i <= timeExtent[1]; i++) {
        setTimeout(() => {
          console.log(i);
          svgScatterPlot.html("");
          makeScatterPlot(i);
        }, (i - timeExtent[0]) * 200);
      }
      
    });*/
  }

  // make scatter plot with trend line
  function makeScatterPlot() {

    // get arrays of fertility rate data and life Expectancy data
    let fertility_rate_data = data.map((row) => parseFloat(row["fertility_rate"]));
    let life_expectancy_data = data.map((row) => parseFloat(row["life_expectancy"]));

    // find data limits
    let axesLimits = findMinMax(fertility_rate_data, life_expectancy_data);

    // draw axes and return scaling + mapping functions
    let mapFunctions = drawAxes(axesLimits, "fertility_rate", "life_expectancy", svgScatterPlot, { min: 50, max: 450 }, { min: 50, max: 450 });

    // plot data as points and add tooltip functionality
    plotData(mapFunctions);

    // draw title and axes labels
    makeLabels();
  }

  // make title and axes labels
  function makeLabels() {
    svgScatterPlot.append('text')
      .attr('x', 50)
      .attr('y', 30)
      .style('font-size', '14pt')
      .text("Life Expectancy vs. Fertility Rate");

    svgScatterPlot.append('text')
      .attr('x', 130)
      .attr('y', 490)
      .style('font-size', '10pt')
      .text('Fertility Rates (Avg Children per Woman)');

    svgScatterPlot.append('text')
      .attr('transform', 'translate(15, 300)rotate(-90)')
      .style('font-size', '10pt')
      .text('Life Expectancy (years)');
  }

  // plot all the data points on the SVG
  // and add tooltip functionality
  function plotData(map) {
    // get population data as array
    let pop_data = data.map((row) => +row["pop_mlns"]);
    let pop_limits = d3.extent(pop_data);
    // make size scaling function for population
    let pop_map_func = d3.scaleLinear()
      .domain([pop_limits[0], pop_limits[1]])
      .range([3, 20]);

    // mapping functions
    let xMap = map.x;
    let yMap = map.y;


    // function onlyUnique(value, index, self) {
    //   return self.indexOf(value) === index;
    // }

    // make tooltip
    // let div = d3.select("body").append("div")
    // .attr("class", "tooltip")
    // .style("opacity", 0);

        
    // append data to SVG and plot as points
    svgScatterPlot.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', xMap)
      .attr('cy', yMap)
      .attr('r', 2)
      .attr('fill', "#4286f4")

  }
  

  function makeLineGraph(country) {
    svgLineGraph.html("");
    let countryData = allYearsData.filter((row) => row["location"] == country);
    let timeData = countryData.map((row) => row["time"]);
    let lifeExpectancyData = countryData.map((row) => row["pop_mlns"]);

    let minMax = findMinMax(timeData, lifeExpectancyData);
      //svgLineGraph.selectAll('g').remove();
    svgLineGraph.selectAll('g').remove()
    let funcs = drawAxes(minMax, "time", "pop_mlns", svgLineGraph, { min: 50, max: 450 }, { min: 50, max: 450 });
    plotLineGraph(funcs, countryData, country);

    
    console.log(data)

      let locations = data.map((row) => row["location"]);

      function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
      }

      let unlocations = locations.filter(onlyUnique)
  
      let dropdown = d3.select("body").append("select").on('change', function () {
        var selected = this.value;
        //console.log(selected);
        var thisObject = allYearsData.filter(country => country.location == selected);
        console.log(thisObject.location)
        svgLineGraph.selectAll('g').remove();
        svgLineGraph.selectAll('path').remove();
        svgLineGraph.selectAll('text').remove();
        let minMax = findMinMax(thisObject.map((row) => row["time"]), thisObject.map((row) => row["pop_mlns"]));
        let funcs = drawAxes(minMax, "time", "pop_mlns", svgLineGraph, { min: 50, max: 450 }, { min: 50, max: 450 });
        plotLineGraph(funcs, thisObject, selected);
      });
  
  
      dropdown.selectAll("option")
        .data(unlocations)
        .enter()
        .append("option")
        .text((d) => {
          return d;
        })
        .attr("value", (d) => d)

  }

  function plotLineGraph(funcs, countryData, country) {
    //let xMap = funcs.
    console.log(funcs)

    let line = d3.line()
      .x((d) => funcs.x(d))
      .y((d) => funcs.y(d));
    svgLineGraph.append('path')
      .datum(countryData)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5)
      .attr("d", line)
          .on("mouseover", (d) => {
          div.transition()
            .duration(200)
            .style("opacity", .9);
          div
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");

          makeScatterPlot(2000);


        })
        .on("mouseout", (d) => {
          div.transition()
            .duration(500)
            .style("opacity", 0);
        });

    svgLineGraph.append('text')
      .attr('x', 230)
      .attr('y', 490)
      .style('font-size', '10pt')
      .text('Year');

    svgLineGraph.append('text')
      .attr('x', 230)
      .attr('y', 30)
      .style('font-size', '14pt')
      .text(country);

    svgLineGraph.append('text')
      .attr('transform', 'translate(15, 300)rotate(-90)')
      .style('font-size', '10pt')
      .text('Population Size (mil)');

  }

  // draw the axes and ticks
  function drawAxes(limits, x, y, svg, rangeX, rangeY) {
    // return x value from a row of data
    let xValue = function (d) { return +d[x]; }

    // function to scale x value
    let xScale = d3.scaleLinear()
      .domain([limits.xMin, limits.xMax]) // give domain buffer room
      .range([rangeX.min, rangeX.max]);

    // xMap returns a scaled x value from a row of data
    let xMap = function (d) { return xScale(xValue(d)); };

    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale);
    svg.append("g")
      .attr('transform', 'translate(0, ' + rangeY.max + ')')
      .call(xAxis);

    // return y value from a row of data
    let yValue = function (d) { return +d[y] }

    // function to scale y
    let yScale = d3.scaleLinear()
      .domain([limits.yMax, limits.yMin]) // give domain buffer
      .range([rangeY.min, rangeY.max]);

    // yMap returns a scaled y value from a row of data
    let yMap = function (d) { return yScale(yValue(d)); };

    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale);
    svg.append('g')
      .attr('transform', 'translate(' + rangeX.min + ', 0)')
      .call(yAxis);

    // return mapping and scaling functions
    return {
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale
    };
  }

  // find min and max for arrays of x and y
  function findMinMax(x, y) {

    // get min/max x values
    let xMin = d3.min(x);
    let xMax = d3.max(x);

    // get min/max y values
    let yMin = d3.min(y);
    let yMax = d3.max(y);

    // return formatted min/max data as an object
    return {
      xMin: xMin,
      xMax: xMax,
      yMin: yMin,
      yMax: yMax
    }
  }

  // format numbers
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

})();