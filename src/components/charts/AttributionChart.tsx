import * as d3 from "d3";
import {
  featureSets,
  indexOfMax,
  posColor,
  negColor,
  featureTypes,
} from "../../lib/util";
import React, { useCallback, FC, useState, useEffect, useMemo } from "react";
import _ from "lodash";
import ShapChart from "./ShapChart";

export interface Props {
  data: null | number[];
  pred: null | number;
  rid: number | null;
  origin: number[];
  classIndex: number;
}

const toAbsFeatureSet = (data: number[]): number[] => {
  return [
    Math.abs(_.sum(data.slice(0, 19))),
    Math.abs(_.sum(data.slice(19, 36))),
    Math.abs(_.sum(data.slice(36, 40))),
    Math.abs(_.sum(data.slice(40, 1554))),
    Math.abs(_.sum(data.slice(1554, 1602))),
  ];
};

const toFeatureSet = (data: number[]): number[] => {
  return [
    _.sum(data.slice(0, 19)),
    _.sum(data.slice(19, 36)),
    _.sum(data.slice(36, 40)),
    _.sum(data.slice(40, 1554)),
    _.sum(data.slice(1554, 1602)),
  ];
};

const margin = 10;
const featureSetWidth = 1 / 5;
const transformWidth = 1 / 10;

const AttributionChart: FC<Props> = ({ data, pred, origin, classIndex, rid }) => {
  const [chart, setChart] = useState(null as any);
  const [node, setNode] = useState(null as any);
  const [selectedFeatureSet, setSelectedFeatureSet] = useState(0);
  const [hoverFeatureSet, setHoverFeatureSet] = useState(-1);

  const dataSliced = useMemo(
    () =>
      !data
        ? null
        : [
            data.slice(0, 19),
            data.slice(19, 36),
            data.slice(36, 40),
            data.slice(40, 1554),
            data.slice(1554, 1602),
          ],
    [data]
  );

  const baseline = useMemo(() => {
    if (data && pred) {
      return pred - _.sum(data);
    } else {
      return null;
    }
  }, [pred, data]);

  const shapData = useMemo(() => {
    if (!dataSliced) return null;
    let target = dataSliced[selectedFeatureSet].map((v, i) => ({
      name: featureTypes[selectedFeatureSet][i],
      value: v,
    }));
    target = target.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
    let output = [] as any[];
    if (target.length < 10) {
      output = target;
    } else {
      output = target.slice(0, 9);
      output.push({
        name: "Other Features",
        value: _.sum(target.slice(9).map((v) => v.value)),
      });
    }
    return output;
  }, [selectedFeatureSet, dataSliced]);

  const barRange = useMemo(() => {
    if (node && baseline && shapData) {
      const top = 4 * margin;
      const bottom = node.offsetHeight - 6 * margin;
      const fsa = _.sum(shapData.map((v) => v.value)) + baseline;
      const accData = shapData.map(
        (v, i) => baseline + _.sum(shapData.slice(0, i + 1).map((d) => d.value))
      );
      accData.unshift(baseline);
      const accMax = Math.max(...accData);
      const accMin = Math.min(...accData);
      const baseLineCoord =
        bottom - ((bottom - top) * (baseline - accMin)) / (accMax - accMin);
      const fsaCoord =
        bottom - ((bottom - top) * (fsa - accMin)) / (accMax - accMin);
      return baseLineCoord > fsaCoord
        ? [fsaCoord, baseLineCoord]
        : [baseLineCoord, fsaCoord];
    }
  }, [node, shapData, baseline]);

  const create = useCallback(
    (width, height) => {
      const svg = d3
        .create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto;");
      if (data === null || pred === null)
        // 数据未加载完成
        return { node: svg.node() };

      const featureSetData = toAbsFeatureSet(data);
      const rawFeatureSetData = toFeatureSet(data);

      const featureSetBar = svg
        .append("g")
        .attr("transform", `translate(0,${margin})`)
        .selectAll("path")
        .data(
          featureSetData.map((v, i) => ({
            index: i,
            value: v,
          }))
        )
        .join("path")
        .attr("opacity", (_, i) => (i === selectedFeatureSet ? 1 : 0.4))
        .attr("fill", (_, i) => featureSets[i].color);

      featureSetBar
        .append("title")
        .text(
          (d, i) => `${featureSets[i].chinese}归因值: ${d.value.toFixed(3)}.`
        );

      featureSetBar
        .transition()
        .duration(100)
        .ease((t) => t)
        .attrTween("d", (d, i) => {
          const ly1 =
            origin[0] +
            (origin[1] - origin[0]) *
              (_.sum(featureSetData.slice(0, i)) / _.sum(featureSetData));
          const ly2 =
            origin[0] +
            (origin[1] - origin[0]) *
              (_.sum(featureSetData.slice(0, i + 1)) / _.sum(featureSetData));

          return (t: number) => {
            const ry1 =
              (height - margin * 2) *
              t *
              (_.sum(featureSetData.slice(0, i)) / _.sum(featureSetData));
            const ry2 =
              (height - margin * 2) *
              t *
              (_.sum(featureSetData.slice(0, i + 1)) / _.sum(featureSetData));

            return `M 0 ${ly1} 
              L 0 ${ly2}
              C ${((width * featureSetWidth) / 2) * t} ${ly2} 
              ${((width * featureSetWidth) / 2) * t} ${ry2} 
              ${width * featureSetWidth * t} ${ry2}
              L ${width * featureSetWidth * t} ${ry1}
              C ${((width * featureSetWidth) / 2) * t} ${ry1} ${
              ((width * featureSetWidth) / 2) * t
            } ${ly1} 0 ${ly1}`;
          };
        });

      featureSets.forEach((v) => {
        // 声明渐变色
        const pos = svg
          .append("defs")
          .append("linearGradient")
          .attr("id", `colorPos${v.index}`)
          .attr("x1", "0%")
          .attr("y1", "0%")
          .attr("x2", "100%")
          .attr("y2", "0%");

        pos.append("stop").attr("offset", "0%").style("stop-color", v.color);

        pos.append("stop").attr("offset", "100%").style("stop-color", posColor);
        const neg = svg
          .append("defs")
          .append("linearGradient")
          .attr("id", `colorNeg${v.index}`)
          .attr("x1", "0%")
          .attr("y1", "0%")
          .attr("x2", "100%")
          .attr("y2", "0%");

        neg.append("stop").attr("offset", "0%").style("stop-color", v.color);

        neg.append("stop").attr("offset", "100%").style("stop-color", negColor);
      });

      const transformBar = svg
        .append("g")
        .attr(
          "transform",
          `translate(${width * featureSetWidth - 1},${margin})`
        )
        .append("path")
        .attr(
          "fill",
          `url(#color${
            rawFeatureSetData[selectedFeatureSet] > 0 ? "Pos" : "Neg"
          }${selectedFeatureSet})`
        );

      transformBar
        .transition()
        .duration(100)
        .ease((t) => t)
        .attrTween("d", () => {
          return (t: number) => {
            const ly1 =
              (height - margin * 2) *
              t *
              (_.sum(featureSetData.slice(0, selectedFeatureSet)) /
                _.sum(featureSetData));
            const ly2 =
              (height - margin * 2) *
              t *
              (_.sum(featureSetData.slice(0, selectedFeatureSet + 1)) /
                _.sum(featureSetData));

            const ry1 = barRange![0];
            const ry2 = barRange![1];

            return `M 0 ${ly1} 
          L 0 ${ly2}
          C ${((width * transformWidth) / 2) * t} ${ly2} 
          ${((width * transformWidth) / 2) * t} ${ry2} 
          ${width * transformWidth * t} ${ry2}
          L ${width * transformWidth * t} ${ry1}
          C ${((width * transformWidth) / 2) * t} ${ry1} ${
              ((width * transformWidth) / 2) * t
            } ${ly1} 0 ${ly1}`;
          };
        });

      const onClick = (_: any, i: any) => {
        setSelectedFeatureSet(i.index);
      };

      const onMouseover = (_: any, i: any) => {
        setHoverFeatureSet(i.index);
      };

      const onMouseout = (_: any, i: any) => {
        setHoverFeatureSet(-1);
      };

      featureSetBar.on("click", onClick);
      featureSetBar.on("mouseover", onMouseover);
      featureSetBar.on("mouseout", onMouseout);
      return { node: svg.node(), featureSetBar, transformBar };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, pred, origin]
  );

  const ref = useCallback(
    (node) => {
      if (node) {
        setNode(node);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [create]
  );

  useEffect(() => {
    if (node) {
      const newChart = create(node.offsetWidth, node.offsetHeight);
      node.innerHTML = "";
      node.append(newChart.node as any);
      setChart(newChart);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [create]);

  useEffect(() => {
    if (!data) return;
    const featureSetData = toFeatureSet(data);
    setSelectedFeatureSet(indexOfMax(featureSetData));
  }, [data]);

  useEffect(() => {
    if (chart && chart.featureSetBar) {
      // 鼠标悬浮/点击颜色变化
      const bars = (chart.featureSetBar.selectAll("path") as any)._parents;
      d3.selectAll(bars).attr("opacity", (_, i) => {
        return i === selectedFeatureSet ? 1 : i === hoverFeatureSet ? 0.8 : 0.4;
      });
    }
  }, [selectedFeatureSet, hoverFeatureSet, chart]);

  useEffect(() => {
    if (!chart || !data) return;
    if (chart.transformBar) {
      // 鼠标选中的过渡带变化
      const width = node.offsetWidth;
      const height = node.offsetHeight;
      const featureSetData = toAbsFeatureSet(data);
      const rawFeatureSetData = toFeatureSet(data);

      chart.transformBar
        .attr(
          "fill",
          `url(#color${
            rawFeatureSetData[selectedFeatureSet] > 0 ? "Pos" : "Neg"
          }${selectedFeatureSet})`
        )
        .transition()
        .duration(100)
        .ease((t) => t)
        .attrTween("d", () => {
          return (t: number) => {
            const ly1 =
              (height - margin * 2) *
              t *
              (_.sum(featureSetData.slice(0, selectedFeatureSet)) /
                _.sum(featureSetData));
            const ly2 =
              (height - margin * 2) *
              t *
              (_.sum(featureSetData.slice(0, selectedFeatureSet + 1)) /
                _.sum(featureSetData));

            const ry1 = barRange![0];
            const ry2 = barRange![1];

            return `M 0 ${ly1} 
          L 0 ${ly2}
          C ${((width * transformWidth) / 2) * t} ${ly2} 
          ${((width * transformWidth) / 2) * t} ${ry2} 
          ${width * transformWidth * t} ${ry2}
          L ${width * transformWidth * t} ${ry1}
          C ${((width * transformWidth) / 2) * t} ${ry1} ${
              ((width * transformWidth) / 2) * t
            } ${ly1} 0 ${ly1}`;
          };
        });
    }
  }, [selectedFeatureSet, chart, node, data, barRange]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div style={{ width: "100%", height: "100%" }} ref={ref} />
      <div
        style={{
          width: `${100 - 100 * (featureSetWidth + transformWidth)}%`,
          height: "100%",
          position: "absolute",
          top: "0",
          left: node
            ? `${node.offsetWidth * (featureSetWidth + transformWidth) - 2}px`
            : `${100 * (featureSetWidth + transformWidth)}%`,
        }}
      >
        <ShapChart
        rid={rid}
          data={shapData}
          baseline={baseline}
          barRange={barRange}
          classIndex={classIndex}
          featureSetIndex={selectedFeatureSet}
        />
      </div>
    </div>
  );
};

export default AttributionChart;
