import React, { useCallback, FC, useMemo, useState, useEffect } from "react";
import * as d3 from "d3";
import { concat, isEqual, sum, uniqWith } from "lodash";

export interface Props {
  regionId: number;
  size: number;
  centers: any;
  map: any;
  data?: {
    in: any[][];
    out: any[][];
  };
  times: {
    in: number[];
    out: number[];
  };
  onBarHover: (rids?: number[]) => void;
}

const distanceSlice = (data: any) => {
  const allData = concat(...data);

  const slices = [
    [0, 2],
    [2, 5],
    [5, 10],
    [10, 1000],
  ];
  const output = slices.map((slice) => {
    const d = allData.filter(
      (v: any) => v.distance >= slice[0] && v.distance < slice[1]
    );
    return sum(d.map((d: any) => d.value));
  });
  return {
    "0-2km": output[0],
    "2-5km": output[1],
    "5-10km": output[2],
    ">10km": output[3],
  };
};

const inColor = "#2F3A8F";
const inColors = d3.interpolateRgb(d3.rgb("#ffffff"), d3.rgb(inColor));
const outColor = "#FE7E6D";
const outColors = d3.interpolateRgb(d3.rgb("#ffffff"), d3.rgb(outColor));
const interval = 500;

const BrushChart: FC<Props> = ({
  size,
  data,
  times,
  centers,
  map,
  regionId,
  onBarHover,
}) => {
  const centerRadius = (size * 7) / 20;
  const maxOuterRadius = size / 2;
  const minOuterRadius = centerRadius + 1;
  const maxInnerRadius = size / 5;
  const minInnerRadius = centerRadius - 1;

  const maxInValue = useMemo(
    () =>
      Math.max(
        ...Array.from({ length: 36 }, (_, i: number) =>
          sum(data!.in.map((v) => v[i].total))
        )
      ),
    [data]
  );
  const maxOutValue = useMemo(
    () =>
      Math.max(
        ...Array.from({ length: 36 }, (_, i: number) =>
          sum(data!.out.map((v) => v[i].total))
        )
      ),
    [data]
  );

  const inScale = useMemo(
    () =>
      d3
        .scaleLinear()
        .domain([0, maxInValue])
        .range([minInnerRadius, maxInnerRadius]),
    [maxInValue, maxInnerRadius, minInnerRadius]
  );

  const outScale = useMemo(
    () =>
      d3
        .scaleLinear()
        .domain([0, maxOutValue])
        .range([minOuterRadius, maxOuterRadius]),
    [maxOutValue, minOuterRadius, maxOuterRadius]
  );

  const zeroData = useMemo(() => {
    const tmp = {
      in: Array.from({ length: 36 }, (_, i: number) => {
        return {
          "0-2km": 0,
          "2-5km": 0,
          "5-10km": 0,
          ">10km": 0,
          degree: ((i * 10) / 180) * Math.PI,
          radius: minInnerRadius,
          value: 0.0,
          endAngle: ((i * 10 - 5) / 180) * Math.PI,
          startAngle: ((i * 10 + 5) / 180) * Math.PI,
        };
      }),
      out: Array.from({ length: 36 }, (_, i: number) => {
        return {
          "0-2km": 0,
          "2-5km": 0,
          "5-10km": 0,
          ">10km": 0,
          degree: ((i * 10) / 180) * Math.PI,
          radius: minOuterRadius,
          value: 0.0,
          endAngle: ((i * 10 - 5) / 180) * Math.PI,
          startAngle: ((i * 10 + 5) / 180) * Math.PI,
        };
      }),
    };
    return {
      in: d3.stack().keys(["0-2km", "2-5km", "5-10km", ">10km"])(tmp.in),
      out: d3.stack().keys(["0-2km", "2-5km", "5-10km", ">10km"])(tmp.out),
    };
  }, [minInnerRadius, minOuterRadius]);

  const create = useCallback(() => {
    const arc = d3
      .arc()
      .padAngle(0.01)
      .padRadius(centerRadius)
      .startAngle((d: any) => d.data.startAngle)
      .endAngle((d: any) => d.data.endAngle);
    const svg = d3
      .create("svg")
      .attr("width", map!.getContainer().offsetWidth)
      .attr("height", map!.getContainer().offsetHeight)
      .attr("viewBox", [-size / 2, -size / 2, size, size])
      .attr("style", "max-width: 100%;")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round");

    const lines = svg.append("g");

    const inBar = svg
      .append("g")
      .selectAll("g")
      .data(zeroData.in)
      .join("g")
      .attr("fill", (d) => inColors(1 - 0.2 * d.index));
    inBar
      .selectAll("path")
      .data((d: any) => d)
      .join("path")
      .attr(
        "d",
        arc
          .innerRadius((d: any) => inScale(d[0]))
          .outerRadius((d: any) => inScale(d[1])) as any
      );

    const outBar = svg
      .append("g")
      .selectAll("g")
      .data(zeroData.out)
      .join("g")
      .attr("fill", (d) => outColors(1 - 0.2 * d.index));
    outBar
      .selectAll("path")
      .data((d: any) => d)
      .join("path")
      .attr(
        "d",
        arc
          .innerRadius((d: any) => outScale(d[0]))
          .outerRadius((d: any) => outScale(d[1])) as any
      );

    return {
      inBar,
      outBar,
      lines,
      node: svg.node(),
    };
  }, [size, inScale, outScale, centerRadius, zeroData, map]);

  const [chart] = useState(create());
  const [load, setLoad] = useState(false);
  // eslint-disable-next-line
  const [displayData, setDisplayData] = useState(zeroData);

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
    const currentData = {
      in: data?.in.filter((_, i) => times.in.indexOf(i) >= 0),
      out: data?.out.filter((_, i) => times.out.indexOf(i) >= 0),
    };
    const animateData = {
      in: Array.from({ length: 36 }, (_, i) => {
        return {
          index: i,
          ...distanceSlice(currentData.in?.map((v) => v[i].regions)),
          radius:
            times.in.length !== 0
              ? inScale(sum(currentData.in?.map((v) => v[i].total)))
              : minInnerRadius,
          prevRadius: minInnerRadius,
          degree: ((i * 10) / 180) * Math.PI,
          endAngle: ((i * 10 - 5) / 180) * Math.PI,
          startAngle: ((i * 10 + 5) / 180) * Math.PI,
        };
      }),
      out: Array.from({ length: 36 }, (_, i) => {
        return {
          index: i,
          ...distanceSlice(currentData.out?.map((v) => v[i].regions)),
          radius:
            times.in.length !== 0
              ? outScale(sum(currentData.out?.map((v) => v[i].total)))
              : minOuterRadius,
          prevRadius: minOuterRadius,
          degree: ((i * 10) / 180) * Math.PI,
          endAngle: ((i * 10 - 5) / 180) * Math.PI,
          startAngle: ((i * 10 + 5) / 180) * Math.PI,
        };
      }),
    };
    const stackData = {
      in: d3.stack().keys(["0-2km", "2-5km", "5-10km", ">10km"])(
        animateData.in
      ),
      out: d3.stack().keys(["0-2km", "2-5km", "5-10km", ">10km"])(
        animateData.out
      ),
    };
    const arc = d3.arc().padAngle(0.01).padRadius(centerRadius);

    setDisplayData((prev) => {
      // 获取上一次的图形位置
      const combineData = {
        in: stackData.in.map((seq, i) =>
          seq.map((v, j) => {
            return {
              v1: v[0],
              v2: v[1],
              prevV1: prev.in[i][j][0],
              prevV2: prev.in[i][j][1],
              ...v.data,
            };
          })
        ),
        out: stackData.out.map((seq, i) =>
          seq.map((v, j) => {
            return {
              v1: v[0],
              v2: v[1],
              prevV1: prev.out[i][j][0],
              prevV2: prev.out[i][j][1],
              ...v.data,
            };
          })
        ),
      };

      const inBar = chart.inBar
        .data(combineData.in)
        .join("g")
        .selectAll("path")
        .data((d: any) => d)
        .join("path");

      inBar
        .transition()
        .duration(interval)
        .ease(d3.easeLinear)
        .attrTween("d", (d: any): any => {
          const { v1, v2, prevV1, prevV2 } = d;
          return (t: number) =>
            arc
              .innerRadius((d: any) => inScale(d.ipl1))
              .outerRadius((d: any) => inScale(d.ipl2))(
              Object.assign({}, d, {
                ipl1: prevV1 + t * (v1 - prevV1),
                ipl2: prevV2 + t * (v2 - prevV2),
              }) as any
            );
        });
      const outBar = chart.outBar
        .data(combineData.out)
        .join("g")
        .selectAll("path")
        .data((d: any) => d)
        .join("path");

      outBar
        .transition()
        .duration(interval)
        .ease(d3.easeLinear)
        .attrTween("d", (d: any): any => {
          const { v1, v2, prevV1, prevV2 } = d;
          return (t: number) =>
            arc
              .innerRadius((d: any) => outScale(d.ipl1))
              .outerRadius((d: any) => outScale(d.ipl2))(
              Object.assign({}, d, {
                ipl1: prevV1 + t * (v1 - prevV1),
                ipl2: prevV2 + t * (v2 - prevV2),
              }) as any
            );
        });

      // 显示具体去向轨迹
      const showDetailLines = (i: any, mode: "in" | "out") => {
        const line = d3
          .line()
          .curve(d3.curveBasis)
          .x((d) => d[0])
          .y((d) => d[1]);
        const dRange = [i.startAngle - 0.005, i.endAngle + 0.005];
        let total = sum(currentData[mode]!.map((v) => v[i.index].total));
        let radius = mode === "in" ? minInnerRadius : outScale(total);
        let op = map.project(centers[regionId]);
        let targets = concat(
          ...currentData[mode]!.map((v) => v[i.index].regions)
        );
        let uniqRids = uniqWith(
          targets.map((v) => {
            return {
              rid: v.rid,
              degree: v.degree,
              distance: v.distance,
            };
          }),
          isEqual
        );
        // 按方向角排序防止遮挡
        uniqRids.sort((a, b) => b.degree - a.degree);

        // 更新地图显示
        onBarHover(uniqRids.map((v: any) => v.rid));

        targets = uniqRids.map(({ rid, degree }) => {
          const dp = map.project(centers[rid]);
          return {
            rid,
            degree,
            value: sum(
              targets.filter((v) => v.rid === rid).map((v) => v.value)
            ),
            coord: [dp.x - op.x, dp.y - op.y],
          };
        });
        let d = dRange[0];
        targets.forEach((v) => {
          const r = (v.value / total) * (dRange[1] - dRange[0]);
          v.startAngle = d;
          v.endAngle = d + r;
          v.centerAngle = d + r / 2;
          d = d + r;
        });

        chart.lines
          .attr("display", "block")
          .selectAll("path")
          .data(targets)
          .join("path")
          .attr("fill", "none")
          .attr("stroke", mode === "in" ? inColor : outColor)
          .attr("stroke-linecap", "butt")
          .attr(
            "stroke-width",
            (d: any) => (d.startAngle - d.endAngle) * radius
          )
          .transition()
          .duration(interval)
          .ease(d3.easeLinear)
          .attrTween("d", (d: any): any => {
            const posA = [
              radius * Math.sin(d.centerAngle),
              -radius * Math.cos(d.centerAngle),
            ];
            const posB = d.coord;
            const l =
              Math.sqrt((posA[0] - posB[0]) ** 2 + (posA[1] - posB[1]) ** 2) /
              2;
            const dxdy = [
              (radius + l) * Math.sin(d.centerAngle),
              -(radius + l) * Math.cos(d.centerAngle),
            ];
            return (t: number) => {
              const mix = [
                posA[0] + t * (posB[0] - posA[0]),
                posA[1] + t * (posB[1] - posA[1]),
              ];
              return line([posA, dxdy, mix] as any);
            };
          });
      };

      inBar.on("mouseover", (e, i: any) => {
        inBar.attr("fill", (d: any) => (d.index === i.index ? inColor : ""));
        outBar.attr("display", "none");
        showDetailLines(i, "in");
      });

      inBar.on("mouseout", (e, i: any) => {
        inBar.attr("fill", "");
        outBar.attr("display", "block");
        chart.lines.attr("display", "none");
        onBarHover();
      });

      outBar.on("mouseover", (e, i: any) => {
        outBar.attr("fill", (d: any) => (d.index === i.index ? outColor : ""));
        inBar.attr("display", "none");
        showDetailLines(i, "out");
      });

      outBar.on("mouseout", (e, i: any) => {
        outBar.attr("fill", "");
        inBar.attr("display", "block");
        chart.lines.attr("display", "none");
        onBarHover();
      });
      return stackData;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    data,
    times,
    centerRadius,
    centers,
    chart,
    inScale,
    outScale,
    load,
    map,
    minInnerRadius,
    minOuterRadius,
    regionId,
  ]);
  return <div ref={ref} />;
};

export default BrushChart;
