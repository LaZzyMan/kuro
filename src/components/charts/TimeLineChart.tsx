import * as d3 from "d3";
import { sum } from "lodash";
import React, { useCallback, FC, useMemo, useState, useEffect } from "react";

export interface Props {
  size: [number, number];
  data: any;
  time: number;
  onBrush: (e: any) => void;
  onBrushEnd: () => void;
}

const inColor = "#2F3A8F";
const outColor = "#FE7E6D";
const gridColor = "#aaaaaa";
const interval = 500;
const margin = {
  top: 10,
  right: 15,
  bottom: 10,
  left: 15,
};

const line = d3.line().curve(d3.curveCatmullRom);

const area = d3.area().curve(d3.curveCatmullRom);

const TimeLineChart: FC<Props> = ({
  size,
  data,
  time,
  onBrush,
  onBrushEnd,
}) => {
  const [height, width] = size;

  const [chart, setChart] = useState();

  const inLineSeqs = useMemo(
    () => data.inLineSeqs.map((v: number[]) => sum(v)),
    [data]
  );
  const outLineSeqs = useMemo(
    () => data.outLineSeqs.map((v: number[]) => sum(v)),
    [data]
  );

  const inScale = useMemo(() => {
    const maxInValue = Math.max(...inLineSeqs);
    const maxOutValue = Math.max(...outLineSeqs);
    return d3
      .scaleLinear()
      .domain([0, Math.max(maxInValue, maxOutValue)])
      .range([height / 2, margin.bottom]);
  }, [height, inLineSeqs, outLineSeqs]);

  const outScale = useMemo(() => {
    const maxInValue = Math.max(...inLineSeqs);
    const maxOutValue = Math.max(...outLineSeqs);
    return d3
      .scaleLinear()
      .domain([0, Math.max(maxInValue, maxOutValue)])
      .range([height / 2, height - margin.top]);
  }, [height, inLineSeqs, outLineSeqs]);

  const xScale = useMemo(
    () =>
      d3
        .scaleLinear()
        .domain([0, 23])
        .range([margin.left, width - margin.right]),
    [width]
  );

  const displayData = useMemo(() => {
    return {
      inLine: inLineSeqs.map((v: number, i: number) => {
        return {
          value: v,
          y: inScale(v),
          x: xScale(i),
          time: `${i}h`,
          index: i,
        };
      }),
      outLine: outLineSeqs.map((v: number, i: number) => {
        return {
          value: v,
          y: outScale(v),
          x: xScale(i),
          time: `${i}h`,
          index: i,
        };
      }),
    };
  }, [inLineSeqs, outLineSeqs, inScale, outScale, xScale]);

  const create = useCallback(() => {
    const svg = d3
      .create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);

    const inLine = svg
      .append("path")
      .attr("fill", "none")
      .attr("stroke", inColor)
      .attr("stroke-width", 2)
      .attr("stroke-linejoin", "round")
      .attr(
        "d",
        line.x((d: any) => d.x).y((d: any) => d.y)(displayData?.inLine as any)
      );

    inLine
      .transition()
      .duration(interval)
      .ease((t) => t)
      .delay(0)
      .attrTween("d", (_): any => {
        return (t: number) => {
          const s = Math.floor(24 * t);
          return line.x((d: any) => d.x).y((d: any) => d.y)(
            displayData?.inLine.slice(0, s === 0 ? 1 : s) as any
          );
        };
      });
    const inArea = svg
      .append("path")
      .attr("fill", inColor)
      .attr("fill-opacity", 0.2)
      .attr(
        "d",
        area
          .x0((d: any) => d.x)
          .y0((d: any) => d.y)
          .x1((d: any) => d.x)
          .y1((d: any) => height / 2)(displayData?.inLine as any)
      );

    inArea
      .transition()
      .duration(interval)
      .ease((t) => t)
      .delay(0)
      .attrTween("d", (_): any => {
        return (t: number) => {
          const s = Math.floor(24 * t);
          return area
            .x0((d: any) => d.x)
            .y0((d: any) => d.y)
            .x1((d: any) => d.x)
            .y1((d: any) => height / 2)(
            displayData?.inLine.slice(0, s === 0 ? 1 : s) as any
          );
        };
      });

    const outLine = svg
      .append("path")
      .attr("fill", "none")
      .attr("stroke", outColor)
      .attr("stroke-width", 2)
      .attr("stroke-linejoin", "round")
      .attr(
        "d",
        line.x((d: any) => d.x).y((d: any) => d.y)(displayData?.outLine as any)
      );

    outLine
      .transition()
      .duration(interval)
      .ease((t) => t)
      .delay(0)
      .attrTween("d", (_): any => {
        return (t: number) => {
          const s = Math.floor(24 * t);
          return line.x((d: any) => d.x).y((d: any) => d.y)(
            displayData?.outLine.slice(0, s === 0 ? 1 : s) as any
          );
        };
      });

    const outArea = svg
      .append("path")
      .attr("fill", outColor)
      .attr("fill-opacity", 0.2)
      .attr(
        "d",
        area
          .x0((d: any) => d.x)
          .y0((d: any) => d.y)
          .x1((d: any) => d.x)
          .y1((d: any) => height / 2)(displayData?.outLine as any)
      );

    outArea
      .transition()
      .duration(interval)
      .ease((t) => t)
      .delay(0)
      .attrTween("d", (_): any => {
        return (t: number) => {
          const s = Math.floor(24 * t);
          return area
            .x0((d: any) => d.x)
            .y0((d: any) => d.y)
            .x1((d: any) => d.x)
            .y1((d: any) => height / 2)(
            displayData?.outLine.slice(0, s === 0 ? 1 : s) as any
          );
        };
      });

    svg
      .append("g")
      .style("font-family", "sans-serif")
      .style("font-size", 16)
      .style("transform", `translate(0px, ${height / 2}px)`)
      .call(
        d3.axisBottom(xScale).tickFormat((x) => {
          if (x === 0) return "";
          return `${x}h`;
        })
      )
      .call((g) =>
        g
          .selectAll(".tick line")
          .clone()
          .attr("y2", margin.top + margin.bottom - height)
          .style("transform", `translate(0, ${height / 2}px)`)
          .attr("stroke", gridColor)
          .attr("stroke-opacity", 0.3)
      );

    svg
      .append("g")
      .style("font-family", "sans-serif")
      .style("transform", `translate(${margin.left}px,0px)`)
      .style("font-size", 16)
      .call(
        d3
          .axisRight(inScale)
          .ticks(height / 80)
          .tickFormat((e) => {
            if (e === 0) return "";
            return `${e}`;
          })
      )
      .call((g: any) => g.select(".domain").remove())
      .call((g) =>
        g
          .selectAll(".tick line")
          .clone()
          .attr("x2", width - margin.left - margin.right)
          .attr("stroke", gridColor)
          .attr("stroke-opacity", 0.3)
      );

    svg
      .append("g")
      .style("font-family", "sans-serif")
      .style("transform", `translate(${margin.left}px,0px)`)
      .style("font-size", 16)
      .call(
        d3
          .axisRight(outScale)
          .ticks(height / 80)
          .tickFormat((e) => {
            if (e === 0) return "";
            return `${e}`;
          })
      )
      .call((g: any) => g.select(".domain").remove())
      .call((g) =>
        g
          .selectAll(".tick line")
          .clone()
          .attr("x2", width - margin.left - margin.right)
          .attr("stroke", gridColor)
          .attr("stroke-opacity", 0.3)
      );

    // bursh
    const inPoints = svg
      .append("g")
      .attr("fill", "white")
      .attr("stroke", inColor)
      .selectAll("circle")
      .data(displayData.inLine)
      .join("circle")
      .attr("r", 3)
      .attr("cx", (d: any) => d.x)
      .attr("cy", (d: any) => d.y);
    inPoints
      .transition()
      .duration(interval)
      .ease((t) => t)
      .attrTween("opacity", (): any => {
        return (t: number) => t;
      });

    const outPoints = svg
      .append("g")
      .attr("fill", "white")
      .attr("stroke", outColor)
      .selectAll("circle")
      .data(displayData.outLine)
      .join("circle")
      .attr("r", 3)
      .attr("cx", (d: any) => d.x)
      .attr("cy", (d: any) => d.y);

    outPoints
      .transition()
      .duration(interval)
      .ease((t) => t)
      .attrTween("opacity", (): any => {
        return (t: number) => t;
      });

    svg.call(
      d3
        .brush()
        .extent([
          [0, 0],
          [width, height],
        ])
        .on("start brush end", ({ selection }) => {
          let inValue: any[] = [];
          let outValue: any[] = [];
          if (selection) {
            const [[x0, y0], [x1, y1]] = selection;
            inValue = inPoints
              .style("fill", "white")
              .filter(
                (d: any) => x0 <= d.x && d.x < x1 && y0 <= d.y && d.y < y1
              )
              .style("fill", inColor)
              .data();
            outValue = outPoints
              .style("fill", "white")
              .filter(
                (d: any) => x0 <= d.x && d.x < x1 && y0 <= d.y && d.y < y1
              )
              .style("fill", outColor)
              .data();
            onBrush({ inValue, outValue });
          } else {
            inPoints.style("fill", "white");
            outPoints.style("fill", "white");
            onBrushEnd();
          }
        }) as any
    );

    // time line
    const timeLine = svg
      .append("line")
      .attr("fill", "none")
      .attr("stroke", "gray")
      .attr("stroke-width", 3)
      .style("transform", `translate(${margin.left}px, ${margin.top}px)`)
      .attr("y2", height - margin.top - margin.bottom);

    const inPath = svg
      .append("path")
      .attr("id", "path-seg")
      .attr("fill", "none")
      .attr("stroke-width", 2)
      .attr("stroke", "none");

    const outPath = svg
      .append("path")
      .attr("id", "path-seg")
      .attr("fill", "none")
      .attr("stroke-width", 2)
      .attr("stroke", "none");

    const inPoint = svg
      .append("circle")
      .attr("fill", "white")
      .attr("stroke", inColor)
      .attr("stroke-width", 2)
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 5);

    const outPoint = svg
      .append("circle")
      .attr("fill", "white")
      .attr("stroke", outColor)
      .attr("stroke-width", 2)
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 5);
    return {
      node: svg.node(),
      timeLine: { line: timeLine, inPoint, outPoint, inPath, outPath },
    };
  }, [
    displayData,
    height,
    width,
    inScale,
    outScale,
    xScale,
    onBrushEnd,
    onBrush,
  ]);

  const ref = useCallback(
    (node) => {
      if (node) {
        const chart = create();
        node.innerHTML = "";
        node.append(chart.node as any);
        setChart(chart as any);
      }
    },
    [create]
  );

  useEffect(() => {
    if (!chart) return;
    const intervalLength = (width - margin.left - margin.right) / 23;
    (chart as any).timeLine.line
      .transition()
      .duration(1000)
      .ease((t: any) => t)
      .delay(0)
      .attrTween("style", (_: any): any => {
        return (t: number) => {
          return `transform: translate(${
            margin.left + (time + t) * intervalLength
          }px, ${margin.top}px)`;
        };
      });

    const { inPath, outPath, inPoint, outPoint } = (chart as any).timeLine;

    const inLineSeg = d3
      .line()
      .curve(d3.curveCatmullRom)
      .defined((_, i) => i === time || i === time + 1)
      .x((d: any) => d.x)
      .y((d: any) => d.y)(displayData?.inLine as any);
    inPath.attr("d", inLineSeg);

    const outLineSeg = d3
      .line()
      .curve(d3.curveCatmullRom)
      .defined((_, i) => i === time || i === time + 1)
      .x((d: any) => d.x)
      .y((d: any) => d.y)(displayData?.outLine as any);
    outPath.attr("d", outLineSeg);

    inPoint
      .transition()
      .duration(1000)
      .ease((t: any) => t)
      .attrTween("transform", (_: any): any => {
        const node = inPath.node();
        const l = node.getTotalLength();
        return (t: number) => {
          const p = node.getPointAtLength(t * l);
          return "translate(" + p.x + "," + p.y + ")";
        };
      });

    outPoint
      .transition()
      .duration(1000)
      .ease((t: any) => t)
      .attrTween("transform", (_: any): any => {
        const node = outPath.node();
        const l = node.getTotalLength();
        return (t: number) => {
          const p = node.getPointAtLength(t * l);
          return "translate(" + p.x + "," + p.y + ")";
        };
      });
  }, [time, chart, width, displayData]);
  return <div ref={ref} />;
};

export default TimeLineChart;
