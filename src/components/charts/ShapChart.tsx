import * as d3 from "d3";
import { posColor, negColor, inColor, outColor } from "../../lib/util";
import FeatureCard from "../FeatureCard";
import React, { useCallback, FC, useState, useEffect } from "react";
import _, { range } from "lodash";

export interface Props {
  data: null | any[];
  baseline: null | number;
  barRange: number[] | undefined;
  classIndex: number;
  featureSetIndex: number;
  rid: number | null;
}

const margin = 10;
const paddingRatio = 0.8;

const ShapChart: FC<Props> = ({
  rid,
  data,
  baseline,
  barRange,
  classIndex,
  featureSetIndex,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [chart, setChart] = useState(null as any);
  const [node, setNode] = useState(null as any);
  const [showCard, setShowCard] = useState(false);
  const [cardPos, setCardPos] = useState([0, 0]);
  const [cardValue, setCardValue] = useState(0);
  const [cardName, setCardName] = useState("");

  const create = useCallback(
    (width, height) => {
      const svg = d3
        .create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto;");

      if (data === null || baseline === null || barRange === undefined)
        // 数据未加载完成
        return { node: svg.node() };

      const barWidth = width / (data.length * (1 + paddingRatio));
      const paddingSize = barWidth * paddingRatio;
      const sumValue = _.sum(data.map((v) => v.value));

      const pToN = svg
        .append("defs")
        .append("linearGradient")
        .attr("id", `pToN`)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");
      pToN.append("stop").attr("offset", "0%").style("stop-color", posColor);
      pToN.append("stop").attr("offset", "100%").style("stop-color", negColor);

      const nToP = svg
        .append("defs")
        .append("linearGradient")
        .attr("id", `nToP`)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");
      nToP.append("stop").attr("offset", "0%").style("stop-color", negColor);
      nToP.append("stop").attr("offset", "100%").style("stop-color", posColor);

      const xAxis = svg
        .append("g")
        .attr("transform", `translate(0,${height - 25})`);
      xAxis
        .append("path")
        .attr("stroke", "black")
        .attr("stroke-opacity", 0.3)
        .attr("stroke-width", 1)
        .attr("fill", "none")
        .attr("d", `M 0 0 L ${width} 0 L ${width - 10} 5`);

      xAxis
        .append("text")
        .attr("y", 16)
        .attr("fill", "#999999")
        .attr("font-weight", 300)
        .attr("text-anchor", "middle")
        .text(`Feature`)
        .attr("x", width / 2);

      const yAxis = svg
        .append("g")
        .attr("transform", `translate(0,${height - 15})`);
      yAxis
        .append("path")
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("stroke-opacity", 0.3)
        .attr("fill", "none")
        .attr("d", `M 0 0 L 0 ${-(height - 25)} L 5 ${-(height - 25) + 10}`);

      yAxis
        .append("text")
        .attr("y", -(height - 30))
        .attr("fill", "#999999")
        .attr("font-weight", 300)
        .attr("text-anchor", "start")
        .text(`Attribution`)
        .attr("x", 5);

      const bars = svg
        .append("g")
        .attr("transform", `translate(0,${barRange[0] + 10})`)
        .selectAll("g")
        .data(data)
        .join("g");

      bars
        .append("path")
        .attr("fill", (d) => (d.value > 0 ? posColor : negColor))
        .transition()
        .duration(100)
        .ease((t) => t)
        .delay((_, i) => 100 + i * 50)
        .attrTween("d", (d, i) => {
          let topHeight = 0;
          let bottomHeight = 0;
          if (sumValue > 0) {
            // 归因值大于0，从左下向右上累积
            topHeight =
              barRange[1] -
              barRange[0] -
              (_.sum(data.map((v) => v.value).slice(0, i + 1)) / sumValue) *
                (barRange[1] - barRange[0]);
            bottomHeight =
              barRange[1] -
              barRange[0] -
              (_.sum(data.map((v) => v.value).slice(0, i)) / sumValue) *
                (barRange[1] - barRange[0]);
          } else {
            // 归因值小于0，从左下向右上累积
            bottomHeight =
              (_.sum(data.map((v) => v.value).slice(0, i)) / sumValue) *
              (barRange[1] - barRange[0]);
            topHeight =
              (_.sum(data.map((v) => v.value).slice(0, i + 1)) / sumValue) *
              (barRange[1] - barRange[0]);
          }

          if (Math.abs(topHeight - bottomHeight) < 5) {
            return (t: number) => `M ${
              (0.5 + i) * paddingSize + i * barWidth
            } ${bottomHeight}
                  L ${
                    (0.5 + i) * paddingSize + (i + 1) * barWidth
                  } ${bottomHeight}
                  L ${(0.5 + i) * paddingSize + (i + 1) * barWidth} ${
              (topHeight - bottomHeight) * t + bottomHeight
            }
                  L ${(0.5 + i) * paddingSize + i * barWidth} ${
              (topHeight - bottomHeight) * t + bottomHeight
            }
                  L ${(0.5 + i) * paddingSize + i * barWidth} ${bottomHeight}`;
          } else {
            return (t: number) => `M ${
              (0.5 + i) * paddingSize + i * barWidth
            } ${bottomHeight}
                  L ${
                    (0.5 + i) * paddingSize + (i + 1) * barWidth
                  } ${bottomHeight}
                  L ${(0.5 + i) * paddingSize + (i + 1) * barWidth} ${
              (topHeight + (d.value > 0 ? 5 : -5) - bottomHeight) * t +
              bottomHeight
            }
                  L ${(0.5 + i) * paddingSize + (i + 0.5) * barWidth} ${
              (topHeight - bottomHeight) * t + bottomHeight
            }
                  L ${(0.5 + i) * paddingSize + i * barWidth} ${
              (topHeight + (d.value > 0 ? 5 : -5) - bottomHeight) * t +
              bottomHeight
            }
                  L ${(0.5 + i) * paddingSize + i * barWidth} ${bottomHeight}`;
          }
        });

      bars
        .append("path")
        .attr("fill", "none")
        .attr("stroke-dasharray", "3 3")
        .attr("stroke-width", 2)
        .attr("stroke", (d, i) => {
          if (i === data.length - 1) return "none";
          if (d.value > 0) {
            if (data[i + 1].value > 0) {
              return posColor;
            } else {
              return `url(#pToN)`;
            }
          } else {
            if (data[i + 1].value < 0) {
              return negColor;
            } else {
              return `url(#nToP)`;
            }
          }
        })
        .attr(
          "transform",
          (d, i) =>
            `translate(0,${
              sumValue > 0
                ? barRange[1] -
                  barRange[0] -
                  (_.sum(data.map((v) => v.value).slice(0, i + 1)) / sumValue) *
                    (barRange[1] - barRange[0])
                : (_.sum(data.map((v) => v.value).slice(0, i + 1)) / sumValue) *
                  (barRange[1] - barRange[0])
            })`
        )
        .transition()
        .duration(100)
        .ease((t) => t)
        .delay(100)
        .delay((_, i) => 100 + i * 50)
        .attrTween("d", (d, i) => {
          return (t: number) => `M ${
            (0.5 + i) * paddingSize + (i + 0.5) * barWidth
          } 0
          L ${(0.5 + i + t) * (barWidth + paddingSize)} 0
          L ${(0.5 + i + t) * (barWidth + paddingSize)} 1`;
        });

      bars
        .append("title")
        .text((d) => `${d.name} Attribution: ${d.value.toFixed(4)}.`);

      bars.on("click", (e, v) => {
        if (v.name === "Other Features") return;
        setCardPos([e.clientX, e.clientY]);
        setCardName(v.name);
        setCardValue(v.value);
        setShowCard(true);
      });

      const baselineLine = svg
        .append("g")
        .attr(
          "transform",
          `translate(0,${(sumValue > 0 ? barRange[1] : barRange[0]) + margin})`
        );

      baselineLine
        .append("line")
        .attr("stroke", "#777777")
        .attr("stroke-dasharray", "5 5")
        .transition()
        .duration(100)
        .ease((t) => t)
        .delay(100)
        .attr("x2", width);

      baselineLine
        .append("text")
        .attr("y", sumValue > 0 ? 16 : -8)
        .attr("fill", "#777777")
        .attr("font-weight", 500)
        .attr("text-anchor", "end")
        .text(`Baseline=${baseline.toFixed(3)}`)
        .transition()
        .duration(100)
        .ease((t) => t)
        .delay(100)
        .attr("x", width);

      const attributionLine = svg
        .append("g")
        .attr(
          "transform",
          `translate(0,${(sumValue < 0 ? barRange[1] : barRange[0]) + margin})`
        );

      attributionLine
        .append("line")
        .attr("stroke", sumValue > 0 ? inColor : outColor)
        .attr("stroke-dasharray", "5 5")
        .transition()
        .duration(100)
        .ease((t) => t)
        .delay(100)
        .attr("x2", width);

      attributionLine
        .append("text")
        .attr("y", sumValue > 0 ? -8 : 16)
        .attr("fill", sumValue > 0 ? inColor : outColor)
        .attr("font-weight", 500)
        .attr("text-anchor", "start")
        .text(`Feature Set Attribution=${(baseline + sumValue).toFixed(3)}`)
        .transition()
        .duration(100)
        .ease((t) => t)
        .delay(100)
        .attr("x", 5);

      return { node: svg.node() };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, baseline, range]
  );

  const ref = useCallback((node) => {
    if (node) {
      setNode(node);
    }
  }, []);

  useEffect(() => {
    setShowCard(false);
    if (node) {
      const newChart = create(node.offsetWidth, node.offsetHeight);
      node.innerHTML = "";
      node.append(newChart.node as any);
      setChart(newChart);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [create]);

  const handleCardClose = useCallback(() => {
    setShowCard(false);
  }, []);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div style={{ width: "100%", height: "100%" }} ref={ref} />
      {showCard && (
        <div
          style={{
            position: "fixed",
            maxWidth: "240px",
            transform: `translate(-50%, -100%) translate(${cardPos[0]}px, ${cardPos[1]}px)`,
            display: "flex",
            flexDirection: "column-reverse",
            top: 0,
            left: 0,
          }}
        >
          <div
            style={{
              alignSelf: "center",
              width: 0,
              height: 0,
              border: "10px solid transparent",
              zIndex: 2000,
              borderBottom: "none",
              borderTopColor: "white",
              transform: "translate(0, -1px)",
            }}
          />
          <FeatureCard
            rid={rid}
            classIndex={classIndex}
            featureSetIndex={featureSetIndex}
            attribution={cardValue}
            name={cardName}
            onClose={handleCardClose}
          />
        </div>
      )}
    </div>
  );
};

export default ShapChart;
