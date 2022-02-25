import * as d3 from "d3";
import { classes } from "../../lib/util";
import React, {
  useCallback,
  FC,
  useState,
  useEffect,
  useContext,
  useMemo,
} from "react";
import { AppContext } from "../../AppReducer";
import _ from "lodash";

export interface Props {
  data: null | any[];
  pred: number[][];
}

const margin = 10;
const yPadding = 0.2;
const titleWidth = 100;

const AttributionChart: FC<Props> = ({ data, pred }) => {
  const { state } = useContext(AppContext);
  const { trainList, currentTrainSet, selectedTrainName, colorArray } = state;
  const [chart, setChart] = useState(null as any);
  const [node, setNode] = useState(null as any);
  const [focusCell, setFocusCell] = useState(-1);

  const create = useCallback(
    (width, height) => {
      const cellSizeMax = (height - margin) / (7 * yPadding + 6);
      const cellSizeMin = cellSizeMax * 0.5;
      const paddingSize = cellSizeMax * yPadding;

      const svg = d3
        .create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto;");

      const title = svg
        .append("g")
        .attr("transform", `translate(0,${margin})`)
        .selectAll("text")
        .data(classes)
        .join("text")
        .attr("x", 0)
        .attr("y", (_, i) => (i + 0.6) * cellSizeMax + i * paddingSize)
        .attr("fill", "currentColor")
        .attr("font-weight", 500)
        .attr("text-anchor", "begin")
        .text((d) => d.abbr);

      svg
        .append("line")
        .attr("y2", height - margin - 2 * paddingSize - cellSizeMin)
        .attr(
          "transform",
          `translate(${titleWidth - paddingSize * 2},${
            margin + cellSizeMin / 2
          })`
        )
        .attr("stroke", "#efefef")
        .attr("stroke-width", 2)
        .attr("opacity", 1);

      const train = svg
        .append("g")
        .attr("transform", `translate(${titleWidth},${margin})`)
        .selectAll("g")
        .data(pred)
        .join("g")
        .attr(
          "transform",
          (_, i) => `translate(${(i + 0.5) * cellSizeMax + i * paddingSize}, 0)`
        );
      const trainLabel = svg
        .append("g")
        .attr("transform", `translate(${titleWidth}, 0)`)
        .selectAll("line")
        .data(pred)
        .join("line")
        .attr(
          "transform",
          (_, i) => `translate(${(i + 0.5) * cellSizeMax + i * paddingSize}, 0)`
        )
        .attr("x1", -cellSizeMin / 2)
        .attr("x2", cellSizeMin / 2)
        .attr("stroke-width", 8)
        .attr("fill", "none")
        .attr(
          "stroke",
          (d, i) =>
            `rgb(${colorArray[i][0]}, ${colorArray[i][1]}, ${colorArray[i][2]})`
        );

      const cells = train
        .selectAll("rect")
        .data((d, i) =>
          d.map((v, j) => ({ value: v, trainIndex: i, index: j }))
        )
        .join("rect")
        // .attr("fill", (_, i) => classes[i].color)
        .attr("fill", "rgb(1,115,98)")
        .attr("opacity", (d) => 0.3 + 0.7 * d.value)
        .attr(
          "x",
          (d) => -(cellSizeMin + (cellSizeMax - cellSizeMin) * d.value) / 2
        )
        .attr(
          "y",
          (d, i) =>
            (i + 0.5) * cellSizeMax +
            i * paddingSize -
            (cellSizeMin + (cellSizeMax - cellSizeMin) * d.value) / 2
        )
        .attr(
          "width",
          (d) => cellSizeMin + (cellSizeMax - cellSizeMin) * d.value
        )
        .attr(
          "height",
          (d) => cellSizeMin + (cellSizeMax - cellSizeMin) * d.value
        )
        .attr("cursor", "pointer");

      cells
        .append("title")
        .text((d, i) => `${classes[i].name}分类得分: ${d.value.toFixed(3)}`);

      const onCellClick = (_: any, i: any) => {
        const trainCells = (cells.selectAll("rect") as any)._parents;
        setFocusCell((prev) => {
          // 解除上一次选中高亮
          d3.select(trainCells[prev])
            .transition()
            .duration(100)
            .ease((t: any) => t)
            .attr("opacity", () => 0.3 + 0.7 * i.value);

          // 高亮当前选择cell
          d3.select(trainCells[i.trainIndex * 6 + i.index])
            .transition()
            .duration(100)
            .ease((t: any) => t)
            .attr("opacity", () => 1);

          const rows = (train.selectAll("g") as any)._parents;
          const lables = (trainLabel.selectAll("line") as any)._parents;

          if (i.trainIndex >= 2) {
            // 移动左侧cell
          }

          // 移动右侧cell
          for (
            let rowIndex = i.trainIndex + 1;
            rowIndex < rows.length;
            rowIndex++
          ) {
            d3.select(rows[rowIndex])
              .transition()
              .duration(100)
              .ease((t: any) => t)
              .attr(
                "transform",
                () =>
                  `translate(${
                    width -
                    titleWidth -
                    (2 - rowIndex + i.trainIndex + 0.5) * cellSizeMax -
                    (2 - rowIndex + i.trainIndex) * paddingSize
                  }, 0)`
              );

            d3.select(lables[rowIndex])
              .transition()
              .duration(100)
              .ease((t: any) => t)
              .attr(
                "transform",
                () =>
                  `translate(${
                    width -
                    titleWidth -
                    (2 - rowIndex + i.trainIndex + 0.5) * cellSizeMax -
                    (2 - rowIndex + i.trainIndex) * paddingSize
                  }, 0)`
              );
          }
          return i.index + i.trainIndex * 6;
        });
      };
      cells.on("click", onCellClick);

      return svg.node();
    },
    [pred, colorArray]
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

  return (
    <div
      style={{
        width: "96%",
        height: "100%",
        marginLeft: "2%",
        marginRight: "2%",
      }}
      ref={ref}
    />
  );
};

export default AttributionChart;
