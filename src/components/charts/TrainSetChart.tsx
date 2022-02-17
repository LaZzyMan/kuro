import * as d3 from "d3";
import { classes } from "../../lib/util";
import React, { useCallback, FC, useState, useEffect } from "react";

const testData = [
  {
    name: "Train_5",
    C: 60,
    G: 40,
    M: 40,
    P: 70,
    R: 80,
    U: 5,
  },
  {
    name: "Train_4",
    C: 50,
    G: 40,
    M: 35,
    P: 60,
    R: 55,
    U: 5,
  },
  {
    name: "Train_3",
    C: 40,
    G: 30,
    M: 30,
    P: 50,
    R: 45,
    U: 5,
  },
  {
    name: "Train_2",
    C: 30,
    G: 30,
    M: 25,
    P: 40,
    R: 30,
    U: 5,
  },
  {
    name: "Train_1",
    C: 20,
    G: 20,
    M: 20,
    P: 30,
    R: 15,
    U: 5,
  },
  {
    name: "Train_0",
    C: 10,
    G: 20,
    M: 15,
    P: 20,
    R: 10,
    U: 5,
  },
];

export interface Props {
  size: number;
  onClick: (i: number) => void;
}

const TrainSetChart: FC<Props> = () => {
  const create = useCallback((width, height) => {
    const flatData = classes.flatMap((v) =>
      testData.map((d) => ({
        name: d.name,
        class: v.name,
        count: d[v.code],
      }))
    );
    const marginBottom = 2;
    const marginTop = 30;
    const marginRight = 20;
    const marginLeft = 50;
    const xRange = [marginLeft, width - marginRight];
    const yRange = [marginBottom, height - marginTop];
    const yPadding = 0.25;

    const X = d3.map(flatData, (d) => d.count);
    const Y = d3.map(flatData, (d) => d.name);
    const Z = d3.map(flatData, (d) => d.class);
    let yDomain = new d3.InternSet(
      d3.groupSort(
        flatData,
        (D) => -d3.sum(D, (d) => d.count),
        (d) => d.name
      )
    );
    let zDomain = new d3.InternSet(d3.map(classes, (d) => d.name));
    const colors = d3.map(classes, (d) => d.color);
    const I = d3
      .range(X.length)
      .filter((i) => yDomain.has(Y[i]) && zDomain.has(Z[i]));

    const series = d3
      .stack()
      .keys(zDomain)
      .value(([, I]: any, z) => X[I.get(z)])
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetDiverging)(
        d3.rollup(
          I,
          ([i]) => i,
          (i: number) => Y[i],
          (i: number) => Z[i]
        ) as any
      )
      .map((s) =>
        s.map((d) => Object.assign(d, { i: (d.data[1] as any).get(s.key) }))
      );
    const xDomain = d3.extent(series.flat(2));

    const xScale = d3.scaleLinear(xDomain as any, xRange);
    const yScale = d3.scaleBand(yDomain, yRange).paddingInner(yPadding);
    const color = d3.scaleOrdinal(zDomain, colors);
    const xAxis = d3.axisTop(xScale).ticks(width / 80);
    const yAxis = d3.axisLeft(yScale).tickSizeOuter(0);

    const svg = d3
      .create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");

    svg
      .append("g")
      .attr("transform", `translate(0,${marginTop})`)
      .call(xAxis)
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .selectAll(".tick line")
          .clone()
          .attr("y2", height - marginTop - marginBottom)
          .attr("stroke-opacity", 0.1)
      )
      .call((g) =>
        g
          .append("text")
          .attr("x", width - marginRight)
          .attr("y", -22)
          .attr("fill", "currentColor")
          .attr("text-anchor", "end")
          .text("选取数量 →")
      );

    const bar = svg
      .append("g")
      .attr("transform", `translate(0,${marginTop})`)
      .selectAll("g")
      .data(series)
      .join("g")
      .attr("fill", ([{ i }]) => color(Z[i]))
      .selectAll("rect")
      .data((d) => d)
      .join("rect")
      .attr("x", ([x1, x2]) => Math.min(xScale(x1), xScale(x2)))
      .attr("y", ({ i }) => yScale(Y[i]) as any)
      .attr("width", ([x1, x2]) => Math.abs(xScale(x1) - xScale(x2)))
      .attr("height", yScale.bandwidth());

    const formatValue = xScale.tickFormat(100);
    const title = (i) => `${Y[i]}\n${Z[i]}\n${formatValue(X[i])}`;
    bar.append("title").text(({ i }) => title(i));

    svg
      .append("g")
      .attr("transform", `translate(${xScale(0)},${marginTop})`)
      .call(yAxis);

    return svg.node();
  }, []);

  const ref = useCallback(
    (node) => {
      if (node) {
        const chart = create(node.offsetWidth, node.offsetHeight);
        node.innerHTML = "";
        node.append(chart as any);
      }
    },
    [create]
  );
  return (
    <div style={{ width: "100%", height: "90%", overflow: "auto" }} ref={ref} />
  );
};

export default TrainSetChart;
