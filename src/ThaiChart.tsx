import * as d3 from 'd3';
import { useEffect, useReducer, useRef, useState } from 'react';
import * as topoclient from "topojson-client";
import * as th from './assets/thailand-provinces.topojson.json'
import * as topo_simplify from 'topojson-simplify'
// import * as th from './assets/geoBoundaries-THA-ADM0.topojson.json'

export const ThaiChart = () => {
  const rendered = useRef(false);
  useEffect(() => {
    console.log(rendered.current)
    if (!rendered.current) {
      rendered.current = true;
    }
  //   const width = 1000;
  // const height = 800;

  const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on("zoom", zoomed);

  const container = d3.select('div#thai-map')
  container.selectAll('*').remove()
  
  const height = container.node().clientHeight;
  const width = container.node().clientWidth;
  // console.log({x, y})

  const svg = container.append("svg")
      .attr("viewBox", [0, 0, width, height])
       .attr("width", width)
      .attr("height", height)
      .attr("style", "max-width: 100%; height: auto;")
      .on("click", reset);
  
  const quantized_topo = topo_simplify.simplify(topo_simplify.presimplify(th), 1e-4)
  console.log({
    th, quantized_topo
  })

  const geojson = topoclient.feature(quantized_topo, quantized_topo.objects.province);
  const projection = d3.geoIdentity()
    .reflectY(true)
    .fitSize([width,height],geojson)
  const path = d3.geoPath().projection(projection);

  const g = svg.append("g");

  const states = g.append("g")
      .attr("fill", "#444")
      .attr("cursor", "pointer")
    .selectAll("path")
    .data(geojson.features, d => d.properties.ID_1)
    .join("path")
      .on("click", clicked)
      .attr('id', d => `path-${d.properties.ID_1}`)
      .attr("d", path);

  // console.log(path)
  states.append("title")
      .text(d => {
        // console.log(d)
        return d.properties.NAME_1
      });

  const xMap = {}
  
  geojson.features.forEach(d => {
    const selection = d3.select('path#path-' + d.properties.ID_1)
    var element = selection.node();
    // use the native SVG interface to get the bounding box
    var bbox = element.getBBox();
    // return the center of the bounding box
    const x = [bbox.x + bbox.width/2, bbox.y + bbox.height/2];
    // console.log(d.properties.NAME_1, x)
    xMap[d.properties.ID_1] = x
    g.append('text')
    .attr('x', x[0])
    .attr('y', x[1])
    .text(d.properties.NAME_1)
    .style("color", "white")
    .style("font-size", "2px")
    .style("text-anchor", "middle")
  })

  

  // const pathMap = {};

  // // console.log(geojson.features)
  // geojson.features.forEach(f => {
  //   pathMap[f.properties.ID_1] = 1
  // })

  // g.append('text')
      
  //     .text('what')

  g.append("path")
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-linejoin", "round")
      .attr("d", path(topoclient.mesh(quantized_topo, quantized_topo.objects.province, (a, b) => a !== b)));

  svg.call(zoom);

  function reset() {
    states.transition().style("fill", null);
    svg.transition().duration(750).call(
      zoom.transform,
      d3.zoomIdentity,
      d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
    );
  }

  function clicked(event, d) {
    const [[x0, y0], [x1, y1]] = path.bounds(d);
    event.stopPropagation();
    states.transition().style("fill", null);
    d3.select(this).transition().style("fill", "red");
    svg.transition().duration(750).call(
      zoom.transform,
      d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
        .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
      d3.pointer(event, svg.node())
    );
  }

  function zoomed(event) {
    const {transform} = event;
    g.attr("transform", transform);
    g.attr("stroke-width", 1 / transform.k);
  }

    svg.node();
  }, [])

  return (
    <></>
  )
}