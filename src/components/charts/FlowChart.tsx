import React, { useCallback, FC, useMemo, useState, useEffect } from "react";
import * as d3 from "d3";
import { inColor, outColor } from "../../lib/util";

export interface Props {
  size: number;
  data?: {
    inLineSeqs: number[][];
    outLineSeqs: number[][];
  };
  time: number;
}

const interval = 1000;

const line = d3
  .lineRadial()
  .curve(d3.curveCatmullRomClosed)
  .angle((d: any) => d.degree);
const area = d3
  .areaRadial()
  .curve(d3.curveCatmullRomClosed)
  .angle((d: any) => d.degree);

const lineArc = d3
  .arc()
  .innerRadius((d: any) => d.radius)
  .outerRadius((d: any) => d.radius);

const prevLineArc = d3
  .arc()
  .innerRadius((d: any) => d.prevRadius)
  .outerRadius((d: any) => d.prevRadius);

const FlowChart: FC<Props> = ({ size, data, time }) => {
  const centerRadius = useMemo(() => (size * 7) / 20, [size]);
  const maxOuterRadius = useMemo(() => size / 2, [size]);
  const minOuterRadius = useMemo(
    () => centerRadius + size * 0.01,
    [centerRadius, size]
  );
  const maxInnerRadius = useMemo(() => size / 5, [size]);
  const minInnerRadius = useMemo(
    () => centerRadius - size * 0.01,
    [centerRadius, size]
  );

  const centerArc = useMemo(
    () => d3.arc().innerRadius(centerRadius).outerRadius(centerRadius),
    [centerRadius]
  );

  const create = useCallback(
    (currentData) => {
      const svg = d3
        .create("svg")
        .attr("width", size)
        .attr("height", size)
        .attr("viewBox", [-size / 2, -size / 2, size, size])
        .attr("style", "max-width: 100%;")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round");

      const inLine = svg
        .append("path")
        .attr("fill", "none")
        .attr("stroke", inColor)
        .attr("stroke-width", 2)
        .attr(
          "d",
          line.radius((d: any) => d.radius - 5)(currentData.inLine as any)
        );

      const inArea = svg
        .append("path")
        .attr("fill", inColor)
        .attr("fill-opacity", 0.2)
        .attr(
          "d",
          area
            .innerRadius((d: any) => d.radius - 5)
            .outerRadius((d: any) => centerRadius)(currentData.inLine as any)
        );

      const inBar = svg
        .append("g")
        .attr("stroke", inColor)
        .attr("fill", "none")
        .attr("stroke-opacity", 0.8)
        .attr("stroke-width", 1.5)
        .selectAll("polyline")
        .data(currentData.inLine)
        .join("polyline")
        .attr("points", (d: any): any => {
          const posA = centerArc.centroid(d);
          const posB = lineArc.centroid(d);
          return [posA, posB];
        });

      const outLine = svg
        .append("path")
        .attr("fill", "none")
        .attr("stroke", outColor)
        .attr("stroke-width", 2)
        .attr(
          "d",
          line.radius((d: any) => d.radius + 5)(currentData.outLine as any)
        );

      const outArea = svg
        .append("path")
        .attr("fill", outColor)
        .attr("fill-opacity", 0.2)
        .attr(
          "d",
          area
            .innerRadius((d: any) => centerRadius)
            .outerRadius((d: any) => d.radius + 5)(currentData.outLine as any)
        );

      const outBar = svg
        .append("g")
        .attr("stroke", outColor)
        .attr("fill", "none")
        .attr("stroke-opacity", 0.8)
        .attr("stroke-width", 1.5)
        .selectAll("polyline")
        .data(currentData.outLine)
        .join("polyline")
        .attr("points", (d: any): any => {
          const posA = centerArc.centroid(d);
          const posB = lineArc.centroid(d);
          return [posA, posB];
        });

      return {
        inLine,
        inBar,
        inArea,
        outLine,
        outBar,
        outArea,
        node: svg.node(),
      };
    },
    [size, centerArc, centerRadius]
  );

  const zeroData = useMemo(() => {
    const centerRadius = (size * 0.9 * 5) / 12;
    return {
      inLine: Array.from({ length: 36 }, (_, i: number) => {
        return {
          degree: ((i * 10) / 180) * Math.PI,
          radius: centerRadius,
          value: 0.0,
          endAngle: ((i * 10 - 5) / 180) * Math.PI,
          startAngle: ((i * 10 + 5) / 180) * Math.PI,
        };
      }),
      outLine: Array.from({ length: 36 }, (_, i: number) => {
        return {
          degree: ((i * 10) / 180) * Math.PI,
          radius: centerRadius,
          value: 0.0,
          endAngle: ((i * 10 - 5) / 180) * Math.PI,
          startAngle: ((i * 10 + 5) / 180) * Math.PI,
        };
      }),
    };
  }, [size]);

  const displayData = useMemo(() => {
    if (!data) return;

    let { inLineSeqs, outLineSeqs } = data;
    const maxInValue = Math.max(...inLineSeqs.map((v) => Math.max(...v)));
    const maxOutValue = Math.max(...outLineSeqs.map((v) => Math.max(...v)));
    const inScale = d3
      .scaleLinear()
      .domain([0, maxInValue])
      .range([minInnerRadius, maxInnerRadius]);
    const outScale = d3
      .scaleLinear()
      .domain([0, maxOutValue])
      .range([minOuterRadius, maxOuterRadius]);
    return inLineSeqs.map((v, i) => {
      return {
        inLine: v.map((d, j) => {
          return {
            degree: ((j * 10) / 180) * Math.PI,
            radius: inScale(d),
            value: d,
            endAngle: ((j * 10 - 5) / 180) * Math.PI,
            startAngle: ((j * 10 + 5) / 180) * Math.PI,
          };
        }),
        outLine: outLineSeqs[i].map((d, j) => {
          return {
            degree: ((j * 10) / 180) * Math.PI,
            radius: outScale(d),
            value: d,
            endAngle: ((j * 10 - 5) / 180) * Math.PI,
            startAngle: ((j * 10 + 5) / 180) * Math.PI,
          };
        }),
      };
    });
  }, [data, maxInnerRadius, minInnerRadius, maxOuterRadius, minOuterRadius]);

  const [chart] = useState(create(zeroData));
  const [load, setLoad] = useState(false);

  const ref = useCallback(
    (node) => {
      if (node) {
        node.innerHTML = "";
        node.append(chart.node as any);
      }
      setLoad(true);
    },
    [chart]
  );

  useEffect(() => {
    if (!load) return;

    const currentData = displayData![time];
    const prevData = time > 0 ? displayData![time - 1] : zeroData;

    const animateData = {
      inLine: currentData.inLine.map((v, i) => {
        return {
          radius: v.radius,
          prevRadius: prevData.inLine[i].radius,
          degree: ((i * 10) / 180) * Math.PI,
          endAngle: ((i * 10 - 5) / 180) * Math.PI,
          startAngle: ((i * 10 + 5) / 180) * Math.PI,
        };
      }),
      outLine: currentData.outLine.map((v, i) => {
        return {
          radius: v.radius,
          prevRadius: prevData.outLine[i].radius,
          degree: ((i * 10) / 180) * Math.PI,
          endAngle: ((i * 10 - 5) / 180) * Math.PI,
          startAngle: ((i * 10 + 5) / 180) * Math.PI,
        };
      }),
    };
    chart.inLine
      .transition()
      .duration(interval)
      .ease((t) => t)
      .delay(0)
      .attrTween("d", (_): any => {
        return (t: number) => {
          return line.radius(
            (d: any) => d.prevRadius + (d.radius - 5 - d.prevRadius) * t
          )(animateData.inLine as any);
        };
      });
    chart.inArea
      .transition()
      .duration(interval)
      .ease((t) => t)
      .delay(0)
      .attrTween("d", (_): any => {
        return (t: number) => {
          return area
            .innerRadius((d: any) => centerRadius)
            .outerRadius(
              (d: any) => d.prevRadius + (d.radius - 5 - d.prevRadius) * t
            )(animateData.inLine as any);
        };
      });
    chart.outLine
      .transition()
      .duration(interval)
      .ease((t) => t)
      .delay(0)
      .attrTween("d", (_): any => {
        return (t: number) => {
          return line.radius(
            (d: any) => d.prevRadius + (d.radius + 5 - d.prevRadius) * t
          )(animateData.outLine as any);
        };
      });
    chart.outArea
      .transition()
      .duration(interval)
      .ease((t) => t)
      .delay(0)
      .attrTween("d", (_): any => {
        return (t: number) => {
          return area
            .innerRadius((d: any) => centerRadius)
            .outerRadius(
              (d: any) => d.prevRadius + (d.radius + 5 - d.prevRadius) * t
            )(animateData.outLine as any);
        };
      });

    chart.inBar
      .data(animateData.inLine)
      .join("polyline")
      .transition()
      .duration(interval)
      .ease((t) => t)
      .delay(0)
      .attrTween("points", (d: any): any => {
        return (t: number) => {
          const posA = centerArc.centroid(d);
          const posB = prevLineArc.centroid(d);
          const posC = lineArc.centroid(d);
          const mix = [posC[0] - posB[0], posC[1] - posB[1]];

          return [posA, [posB[0] + mix[0] * t, posB[1] + mix[1] * t]];
        };
      });
    chart.outBar
      .data(animateData.outLine)
      .join("polyline")
      .transition()
      .duration(interval)
      .ease((t) => t)
      .delay(0)
      .attrTween("points", (d: any): any => {
        return (t: number) => {
          const posA = centerArc.centroid(d);
          const posB = prevLineArc.centroid(d);
          const posC = lineArc.centroid(d);
          const mix = [posC[0] - posB[0], posC[1] - posB[1]];

          return [posA, [posB[0] + mix[0] * t, posB[1] + mix[1] * t]];
        };
      });
  }, [displayData, chart, load, zeroData, centerRadius, centerArc, time]);
  return <div ref={ref} />;
};

export default FlowChart;
