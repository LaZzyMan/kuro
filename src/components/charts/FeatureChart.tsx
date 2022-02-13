import * as d3 from "d3";
import _ from "lodash";
import { lcTypes, poiTypes, datasets } from "../../lib/util";
import React, { useCallback, FC, useMemo } from "react";

export interface Props {
  size: number;
  data: number[];
  type: "lc" | "poi";
}

const FeatureChart: FC<Props> = ({ size, data, type }) => {
  const displayData = useMemo(() => {
    let d = data.map((v, i) => {
      return { name: type === "lc" ? lcTypes[i] : poiTypes[i], value: v };
    });
    d = d.filter((v) => v.value !== 0);
    d.sort((a, b) => b.value - a.value);
    return d;
  }, [data, type]);

  const color = useMemo(
    () => (type === "lc" ? datasets[0].color : datasets[1].color),
    [type]
  );

  const create = useCallback(() => {
    const innerRadius = (size * 0.9) / 3;
    const minOuterRadius = size * 0.9 * 0.35;
    const maxOuterRadius = (size * 0.9) / 2;

    const colors = d3.interpolateRgb(d3.rgb("#ffffff"), d3.rgb(color));
    const maxValue = displayData[0].value;

    const pie = d3.pie().value((d: any) => d.value);
    const rawData = pie(displayData as any);
    let sum = 0;
    const arcData = rawData.map((d: any) => {
      const duration = 500 * d.value;
      sum += duration;
      d.delaytime = sum;
      d.duration = duration;
      const r = _.cloneDeep(d);

      r._endAngle = d.endAngle;
      r.endAngle = d.startAngle;
      return r;
    });

    const lableArc = d3
      .arc()
      .innerRadius(innerRadius)
      .outerRadius(size * 0.6);

    const arc = d3
      .arc()
      .innerRadius(innerRadius)
      .outerRadius(
        (d: any) =>
          ((maxOuterRadius - minOuterRadius) * d.value) / maxValue + innerRadius
      );

    const svg = d3
      .create("svg")
      .attr("width", size * 1.5)
      .attr("height", size)
      .attr("viewBox", [(-size * 3) / 4, -size / 2, (size * 3) / 2, size])
      .attr("style", "max-width: 100%; height: auto;");

    const arcs = svg
      .append("g")
      .attr("stroke", "none")
      .attr("stroke-width", 1)
      .attr("stroke-linejoin", "round")
      .selectAll("path")
      .data(arcData)
      .join("path")
      .attr("fill", (d: any) => colors(d.value / maxValue))
      .attr("d", arc as any)
      .style("cursor", "pointer");

    arcs.append("title").text((d: any) => `${d.data.name}`);

    arcs
      .transition()
      .duration((d: any) => d.duration)
      .ease((t) => t)
      .delay((d: any) => d.delaytime)
      .attrTween("d", (d: any, i: number): any => {
        const ipl = d3.interpolate(d, {
          startAngle: d.startAngle,
          endAngle: d._endAngle,
          padAngle: 0.005,
        });
        return (t: number) => arc(Object.assign({}, d, ipl(t)) as any);
      });

    const labelData = rawData.filter(
      (v) => v.endAngle - v.startAngle > Math.PI / 20
    );

    const polylines = svg
      .append("g")
      .attr("stroke-width", 2)
      .attr("stroke", "black")
      .attr("fill", "none")
      .attr("stroke-linejoin", "round")
      .selectAll("polyline")
      .data(labelData)
      .join("polyline")
      .attr("points", (d: any): any => {
        const posA = arc.centroid(d);
        return [posA, posA];
      });

    polylines
      .transition()
      .duration((d: any) => d.duration)
      .ease((t) => t)
      .delay((d: any) => d.delaytime)
      .attrTween("points", (d: any): any => {
        return (t: number) => {
          const posA = arc.centroid(d);
          const posB = lableArc.centroid(d);
          const posC = lableArc.centroid(d);
          const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
          posC[0] += size * 0.1 * (midangle < Math.PI ? 1 : -1);
          const mixB = [posB[0] - posA[0], posB[1] - posA[1]];
          const mixC = [posC[0] - posB[0], posC[1] - posB[1]];
          if (t < 0.5) {
            return [
              posA,
              [posA[0] + (mixB[0] * t) / 0.5, posA[1] + (mixB[1] * t) / 0.5],
            ];
          } else {
            return [
              posA,
              posB,
              [
                posB[0] + (mixC[0] * (t - 0.5)) / 0.5,
                posB[1] + (mixC[1] * (t - 0.5)) / 0.5,
              ],
            ];
          }
        };
      });

    const labels = svg
      .append("g")
      .attr("font-family", "sans-serif")
      .attr("stroke-width", 1)
      .attr("stroke-opacity", 0)
      .attr("stroke", "none")
      .attr("fill", "black")
      .attr("font-size", size * 0.03)
      .selectAll("text")
      .data(labelData)
      .join("text")
      .text((d: any) => `${d.data.name}`)
      .attr("transform", (d: any) => {
        const pos = lableArc.centroid(d);
        pos[1] += 20;
        return `translate(${pos})`;
      })
      .style("text-anchor", (d: any) => {
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        return midangle < Math.PI ? "start" : "end";
      });

    labels
      .transition()
      .duration((d: any) => d.duration)
      .ease((t) => t)
      .delay((d: any) => d.delaytime)
      .attrTween("stroke-opacity", (): any => {
        return (t: number) => t;
      });

    return svg.node();
  }, [color, displayData, size]);

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

export default FeatureChart;
