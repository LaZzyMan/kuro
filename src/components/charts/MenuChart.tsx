import * as d3 from "d3";
import { datasets } from "../../lib/util";
import _ from "lodash";
import React, { useCallback, FC } from "react";

export interface Props {
  size: number;
  onClick: (i: number) => void;
}

const MenuChart: FC<Props> = ({ size, onClick }) => {
  const create = useCallback(() => {
    const innerRadius = (size / 3) * 0.9;
    const outerRadius = (size / 2) * 0.9;
    const labelRadius = (innerRadius + outerRadius) / 2;

    const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);
    const arcLabel = d3.arc().innerRadius(labelRadius).outerRadius(labelRadius);

    let sum = 0;
    const arcData = datasets.map((d: any) => {
      const duration = 500 * (d.index / 4);
      sum += duration;
      d.delaytime = sum;
      d.duration = 500 * (d.index / 4);
      const r = _.cloneDeep(d);

      r._endAngle = d.endAngle;
      r.endAngle = d.startAngle;
      return r;
    });

    const svg = d3
      .create("svg")
      .attr("width", size)
      .attr("height", size)
      .attr("viewBox", [-size / 2, -size / 2, size, size])
      .attr("style", "max-width: 100%; height: auto;");

    const arcs = svg
      .append("g")
      .attr("stroke", "none")
      .attr("stroke-linejoin", "round")
      .selectAll("path")
      .data(arcData)
      .join("path")
      .attr("fill", (d: any) => d.color)
      .attr("d", arc as any)
      .style("cursor", "pointer");

    arcs
      .transition()
      .duration((d: any) => d.duration)
      .ease((t) => t)
      .delay((d: any) => d.delaytime)
      .attrTween("d", (d: any, i: number): any => {
        const ipl = d3.interpolate(d, {
          startAngle: d.startAngle,
          endAngle: d._endAngle,
          padAngle: 0.05,
        });
        return (t: number) => arc(ipl(t) as any);
      });

    const labels = svg
      .append("g")
      .attr("font-family", "sans-serif")
      .attr("stroke", "white")
      .attr("fill", "white")
      .attr("font-size", size * 0.05)
      .attr("text-anchor", "middle")
      .selectAll("text")
      .data(datasets)
      .join("text")
      .attr("stroke-opacity", 0)
      .attr("fill-opacity", 0)
      .attr("writing-mode", (_, i) => (i % 2 === 0 ? "unset" : "tb"))
      .attr("transform", (d: any) => `translate(${arcLabel.centroid(d)})`)
      .style("cursor", "pointer");

    labels
      .transition()
      .duration((d: any) => d.duration)
      .ease((t) => t)
      .delay((d: any) => d.delaytime)
      .attrTween("fill-opacity", (): any => {
        return (t: number) => t;
      });

    labels
      .selectAll("tspan")
      .data((d: any) => `${d.name}`.split(/\n/))
      .join("tspan")
      .attr("x", 0)
      .attr("y", (_, i) => `${i * 1.1}em`)
      .attr("font-weight", "bold")
      .text((d) => d);

    function onMouseover(_: any, i: any) {
      const arc = (arcs.selectAll("path") as any)._parents[i.index] as any;
      const label = (labels.selectAll("text") as any)._parents[i.index] as any;
      d3.select(arc)
        .transition()
        .duration(100)
        .ease((t: any) => t)
        .attr("transform", function (d: any) {
          var midAngle = (d.startAngle + d._endAngle) / 2;
          return (
            "translate(" +
            size * 0.04 * Math.sin(midAngle) +
            "," +
            -size * 0.04 * Math.cos(midAngle) +
            ")"
          );
        });
      d3.select(label)
        .transition()
        .duration(100)
        .ease((t: any) => t)
        .attr("transform", function (d: any) {
          const origin = arcLabel.centroid(d);
          var midAngle = (d.startAngle + d.endAngle) / 2;
          return (
            "translate(" +
            (size * 0.04 * Math.sin(midAngle) + origin[0]) +
            "," +
            (-size * 0.04 * Math.cos(midAngle) + origin[1]) +
            ")"
          );
        });
    }

    function onMouseout(_: any, i: any) {
      const arc = (arcs.selectAll("path") as any)._parents[i.index] as any;
      const label = (labels.selectAll("text") as any)._parents[i.index] as any;

      d3.select(arc)
        .transition()
        .duration(100)
        .ease((t: any) => t)
        .attr("transform", function (d: any, i) {
          var midAngle = (d.startAngle + d._endAngle) / 2;
          return (
            "translate(" +
            1 * Math.sin(midAngle) +
            "," +
            -1 * Math.cos(midAngle) +
            ")"
          );
        });
      d3.select(label)
        .transition()
        .duration(100)
        .ease((t: any) => t)
        .attr("transform", function (d: any) {
          const origin = arcLabel.centroid(d);
          var midAngle = (d.startAngle + d.endAngle) / 2;
          return (
            "translate(" +
            (Math.sin(midAngle) + origin[0]) +
            "," +
            (-Math.cos(midAngle) + origin[1]) +
            ")"
          );
        });
    }

    function clickHandler(_: any, i: any) {
      onClick(i.index);
    }

    arcs.on("mouseover", onMouseover).on("mouseout", onMouseout);
    labels.on("mouseover", onMouseover).on("mouseout", onMouseout);
    arcs.on("click", clickHandler);
    labels.on("click", clickHandler);

    return svg.node();
  }, [size, onClick]);

  const ref = useCallback(
    (node) => {
      if (node) {
        const chart = create();
        node.innerHTML = "";
        node.append(chart as any);
      }
    },
    [create]
  );
  return <div ref={ref} />;
};

export default MenuChart;
