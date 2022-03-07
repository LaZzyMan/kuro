import * as d3 from "d3";
import { classes } from "../../lib/util";
import { Empty } from "antd";
import React, {
  useCallback,
  FC,
  useState,
  useEffect,
  useContext,
  useMemo,
} from "react";
import { AppContext, RegionClass } from "../../AppReducer";

export interface Props {}

const marginBottom = 2;
const marginTop = 38;
const marginRight = 20;
const marginLeft = 50;

const transform = (trainSet: RegionClass[]) => {
  const result = {
    C: 0,
    G: 0,
    M: 0,
    P: 0,
    R: 0,
    U: 0,
  };
  for (let regionClass of trainSet) {
    result[regionClass.class] += 1;
  }
  return result;
};
const isEmpty = (data): boolean => {
  if (data.length > 1) return false;
  return (
    data[0].C + data[0].G + data[0].M + data[0].P + data[0].R + data[0].U === 0
  );
};

const TrainSetChart: FC<Props> = () => {
  const { state } = useContext(AppContext);
  const { trainList, currentTrainSet, selectedTrainName } = state;
  const [chart, setChart] = useState(null as any);
  const [node, setNode] = useState(null as any);
  const data = useMemo(() => {
    const transformedData = [
      { ...transform(currentTrainSet), name: "Current" },
    ];
    transformedData.push(
      ...trainList.map((v) => ({
        name: v.name,
        ...transform(v.trainSet),
      }))
    );
    return transformedData;
  }, [trainList, currentTrainSet]);

  const create = useCallback(
    (width, height) => {
      const flatData = classes.flatMap((v) =>
        data.map((d) => ({
          name: d.name,
          class: v.name,
          count: d[v.code],
        }))
      );

      const svgHeight =
        ((height - marginTop - marginBottom) * (data.length + 1)) / 5 +
        marginTop +
        marginBottom;
      const xRange = [marginLeft, width - marginRight];
      const yRange = [marginBottom, height - marginTop];
      const yPadding = 1 / 3;

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
      const yBandWidth = (y: string) => {
        const h = yRange[1] - yRange[0];
        const barSize = h / 5 / (1 + yPadding);
        const focus = selectedTrainName ? selectedTrainName : "Current";
        return y === focus ? barSize * 2 : barSize;
      };
      const yScale = (y: string) => {
        const h = yRange[1] - yRange[0];
        const barSize = h / 5 / (1 + yPadding);
        const paddingSize = barSize * yPadding;
        const yList = data.map((v) => v.name);
        const focusIndex = selectedTrainName
          ? yList.indexOf(selectedTrainName)
          : 0;
        let current = yRange[0];
        const scale: number[] = [];
        for (let i = 0; i < yList.length; i++) {
          if (i === 0) {
            scale.push(current + paddingSize);
            current += paddingSize;
          } else {
            if (i - 1 === focusIndex) {
              scale.push(current + paddingSize + barSize * 2);
              current += paddingSize + barSize * 2;
            } else {
              scale.push(current + paddingSize + barSize);
              current += paddingSize + barSize;
            }
          }
        }
        return scale[yList.indexOf(y)];
      };
      const color = d3.scaleOrdinal(zDomain, colors);

      const svg = d3
        .create("svg")
        .attr("width", width)
        .attr("height", svgHeight)
        .attr("viewBox", [0, 0, width, svgHeight])
        .attr("style", "max-width: 100%; height: auto;");

      svg
        .append("g")
        .attr("transform", `translate(0,${marginTop})`)
        .call(d3.axisTop(xScale).ticks(width / 80))
        .call((g) => g.select(".domain").remove())
        .call((g) =>
          g
            .selectAll(".tick line")
            .clone()
            .attr("y2", svgHeight)
            .attr("stroke-opacity", 0.3)
        )
        .call((g) =>
          g
            .append("text")
            .attr("x", width - marginRight)
            .attr("y", -23)
            .attr("fill", "currentColor")
            .attr("font-size", "12px")
            .attr("font-weight", 400)
            .attr("text-anchor", "end")
            .text("Num of Regions")
        );

      svg
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
        .attr("height", (d) => {
          return yBandWidth(d.data[0] as any);
        });

      svg
        .append("g")
        .attr("transform", `translate(${xScale(0) - 2},${marginTop})`)
        .attr("font-size", "12px")
        .selectAll("g")
        .data(data)
        .join("g")
        .attr(
          "transform",
          (d) => `translate(0,${yScale(d.name) + yBandWidth(d.name) / 2})`
        )
        .call((g) =>
          g
            .append("text")
            .attr("x", 0)
            .attr("y", 4)
            .attr("fill", "currentColor")
            .attr("font-weight", (d) => {
              if (!selectedTrainName && d.name === "Current") return 500;
              else return selectedTrainName === d.name ? 500 : 400;
            })
            .attr("text-anchor", "end")
            .text((d) => d.name)
        )
        .call((g) =>
          g
            .append("line")
            .attr("x2", 12)
            .attr("stroke-width", 2)
            .attr("stroke-opacity", 0.3)
            .attr("stroke", "black")
        );

      return svg.node();
    },
    [data, selectedTrainName]
  );

  const ref = useCallback(
    (node) => {
      if (node) {
        if (!chart) {
          const newChart = create(node.offsetWidth, node.offsetHeight);
          node.innerHTML = "";
          node.append(newChart as any);
          setChart(newChart);
          setNode(node);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [create]
  );

  useEffect(() => {
    if (node && chart) {
      const newChart = create(node.offsetWidth, node.offsetHeight);
      node.innerHTML = "";
      node.append(newChart as any);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [create]);

  return isEmpty(data) ? (
    <Empty
      style={{
        marginTop: "45%",
      }}
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={<span>No Train Set</span>}
    />
  ) : (
    <div
      style={{ width: "100%", height: "calc(100% - 40px)", overflow: "auto" }}
      ref={ref}
    />
  );
};

export default TrainSetChart;
