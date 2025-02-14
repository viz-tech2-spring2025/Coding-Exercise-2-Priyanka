import * as d3 from "d3";
import { useEffect, useRef } from "react";

export function Chart({ data }) {
  const svgRef = useRef();

  const margin = { top: 40, right: 30, bottom: 80, left: 100 };
  const width = 900 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const parameters = ["TempMean", "DOMean", "PHMean", "BODMean"];
  const colors = ["#03045e", "#0077b6", "#48cae4", "#ade8f4"];

  useEffect(() => {
    if (!data || data.length === 0) return;

    const aggregatedData = Array.from(
      d3.group(data, (d) => d.STATE),
      ([state, values]) => ({
        STATE: state,
        ...Object.fromEntries(
          parameters.map((param) => [param, d3.mean(values, (d) => d[param])]) 
        ),
      })
    );

  
    const xScale = d3.scaleBand()
      .domain(aggregatedData.map(d => d.STATE))
      .range([0, width])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(aggregatedData, d => d3.max(parameters, param => d[param]))])
      .nice()
      .range([height, 0]);

    const barWidth = xScale.bandwidth() / parameters.length;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

    g.append("g")
      .attr("transform", `translate(30, ${height})`)
      .call(d3.axisBottom(xScale).tickSize(0))
      .selectAll("text")
      .attr("fill", "black")
      .style("text-anchor", "end");


    g.append("g")
      .call(d3.axisLeft(yScale).tickSize(-width))
      .selectAll("text")
      .attr("fill", "black");

    g.selectAll(".grid-line")
      .data(yScale.ticks())
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", d => yScale(d))
      .attr("y2", d => yScale(d))
      .attr("stroke", "#ddd");
      
    
      const tooltip = g.append("foreignObject")
      .attr("width", 100)
      .attr("height", 40)
      .attr("visibility", "hidden");

      const tooltipDiv = tooltip.append("xhtml:div")
      .style("background", "rgba(0, 0, 0, 0.7)")
      .style("color", "white")
      .style("padding", "5px")
      .style("border-radius", "5px")
      .style("font-size", "12px")
      .style("text-align", "center");
  
    parameters.forEach((param, i) => {
      g.selectAll(`.bar-${param}`)
        .data(aggregatedData)
        .enter()
        .append("rect")
        .attr("x", (d) => xScale(d.STATE) + i * barWidth)
        .attr("y", (d) => yScale(d[param]))
        .attr("width", barWidth - 2)
        .attr("height", (d) => height - yScale(d[param]))
        .attr("fill", colors[i])
        .attr("class", `bar-${param}`)
        .style("cursor", "pointer")
        g.selectAll(`.bar-${param}`)
          .on("mouseenter", function (event, d) {
            tooltip.raise()  
              .attr("visibility", "visible")
              .attr("x", xScale(d.STATE) + i * barWidth)
              .attr("y", yScale(d[param]) - 20);

            tooltipDiv.html(`<strong>${param}:</strong> ${d[param] ? d[param].toFixed(2) : "N/A"}`);
    })
    .on("mousemove", function (event, d) {
        tooltip
            .attr("x", xScale(d.STATE) + i * barWidth)
            .attr("y", yScale(d[param]) - 20);
    })
    .on("mouseleave", function () {
        tooltip.attr("visibility", "hidden");
    });

              
    });


    const legend = svg.append("g").attr("transform", `translate(${width - 5}, 10)`);
    parameters.forEach((param, i) => {
      legend.append("rect")
        .attr("x", 0)
        .attr("y", i * 20)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", colors[i]);

      legend.append("text")
        .attr("x", 20)
        .attr("y", i * 20 + 12)
        .text(param)
        .attr("font-size", "12px")
        .attr("fill", "black");
    });

  }, [data]);

  return (
    <div>
      <h1>River Pollution Parameters Across States Where Ganga River Flows</h1>
      <svg ref={svgRef} width={900} height={500}></svg>
    </div>
  );
}
