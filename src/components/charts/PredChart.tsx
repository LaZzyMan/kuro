import * as d3 from "d3";
import { classes, themeColor } from "../../lib/util";
import React, {
  useCallback,
  FC,
  useState,
  useEffect,
  useContext,
  useMemo,
} from "react";
import { AppContext } from "../../AppReducer";
import AttributionChart from "./AttributionChart";

export interface Props {
  data: null | any[];
  pred: number[][];
  rid: number | null;
}

const margin = 10;
const yPadding = 0.2;
const titleMargin = 140;

const PredChart: FC<Props> = ({ data, pred, rid }) => {
  const { state } = useContext(AppContext);
  const { colorArray } = state;
  const [chart, setChart] = useState(null as any);
  const [node, setNode] = useState(null as any);
  const [focusCell, setFocusCell] = useState(-1);
  const [attributionChartWidth, setAttributionChartWidth] = useState(100);
  const [attributionChartLeft, setAttributionChartLeft] = useState(0);
  const [attributionChartOrigin, setAttributionChartOrigin] = useState([0, 0]);

  const create = useCallback(
    (width, height) => {
      const cellSizeMax = (height - margin) / (7 * yPadding + 6);
      const cellSizeMin = cellSizeMax * 0.5;
      const paddingSize = cellSizeMax * yPadding;
      const marginLeft = width / (98.5 / 1.5);
      const titleWidth = titleMargin + marginLeft;

      setAttributionChartWidth(
        width - titleWidth - 4 * cellSizeMax - 3 * paddingSize
      );

      const svg = d3
        .create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto;");

      const title = svg
        .append("g")
        .attr("transform", `translate(${marginLeft},${margin})`)
        .selectAll("text")
        .data(classes)
        .join("text")
        .attr("x", 0)
        .attr("y", (_, i) => (i + 0.6) * cellSizeMax + i * paddingSize)
        .attr("fill", "currentColor")
        .attr("font-weight", 500)
        .attr("text-anchor", "begin");

      title
        .append("tspan")
        .attr("x", 0)
        .attr("y", (d, i) =>
          d.abbr.length === 1
            ? (i + 0.6) * cellSizeMax + i * paddingSize
            : (i + 0.42) * cellSizeMax + i * paddingSize
        )
        .text((d) => d.abbr[0]);
      title
        .append("tspan")
        .attr("x", 0)
        .attr("y", (d, i) =>
          d.abbr.length === 1
            ? (i + 0.6) * cellSizeMax + i * paddingSize
            : (i + 0.78) * cellSizeMax + i * paddingSize
        )
        .text((d) => (d.abbr.length > 1 ? d.abbr[1] : ""));

      svg
        .append("g")
        .attr("transform", `translate(0,${margin})`)
        .selectAll("line")
        .data(classes)
        .join("line")
        .attr("y1", (_, i) => (i + 0.25) * cellSizeMax + i * paddingSize)
        .attr("y2", (_, i) => (i + 0.75) * cellSizeMax + i * paddingSize)
        .attr("stroke-width", 8)
        .attr("fill", "none")
        .attr("stroke", (d) => d.color);

      svg
        .append("line")
        .attr("y2", height - margin - 2 * paddingSize - cellSizeMin)
        .attr(
          "transform",
          `translate(${titleWidth - paddingSize * 2},${
            margin + cellSizeMin / 2
          })`
        )
        .attr("stroke", "#999999")
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
        .selectAll("g")
        .data((d, i) =>
          d.map((v, j) => ({ value: v, trainIndex: i, index: j }))
        )
        .join("g")
        .append("rect")
        // .attr("fill", (_, i) => classes[i].color)
        .attr("fill", themeColor)
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

        setAttributionChartLeft(
          titleWidth +
            (i.trainIndex > 2
              ? 3 * (cellSizeMax + paddingSize)
              : (i.trainIndex + 1) * (cellSizeMax + paddingSize)) -
            paddingSize
        );

        setAttributionChartOrigin([
          (i.index + 0.5) * cellSizeMax +
            i.index * paddingSize -
            (cellSizeMin + (cellSizeMax - cellSizeMin) * i.value) / 2,
          (i.index + 0.5) * cellSizeMax +
            i.index * paddingSize +
            (cellSizeMin + (cellSizeMax - cellSizeMin) * i.value) / 2,
        ]);

        setFocusCell((prev) => {
          const rows = (train.selectAll("g") as any)._parents;
          const lables = (trainLabel.selectAll("line") as any)._parents;

          const moveRow = (r: number, l: number) => {
            // 在原位置基础上移动单元格r
            d3.select(rows[r])
              .transition()
              .duration(100)
              .ease((t: any) => t)
              .attr(
                "transform",
                () =>
                  `translate(${
                    (r + 0.5) * cellSizeMax + r * paddingSize + l
                  }, 0)`
              );

            d3.select(lables[r])
              .transition()
              .duration(100)
              .ease((t: any) => t)
              .attr(
                "transform",
                () =>
                  `translate(${
                    (r + 0.5) * cellSizeMax + r * paddingSize + l
                  }, 0)`
              );
          };

          const hideRow = (r: number, hide: boolean) => {
            d3.select(rows[r])
              .transition()
              .duration(100)
              .ease((t: any) => t)
              .attr("opacity", () => (hide ? 0 : 1));

            d3.select(lables[r])
              .transition()
              .duration(100)
              .ease((t: any) => t)
              .attr("opacity", () => (hide ? 0 : 1));
          };

          // 解除上一次选中高亮
          d3.select(trainCells[prev])
            .transition()
            .duration(100)
            .ease((t: any) => t)
            .attr(
              "opacity",
              () => 0.3 + 0.7 * pred[Math.floor(prev / 6)][prev % 6]
            );

          // 还原单元格位置
          train
            .transition()
            .duration(100)
            .ease((t: any) => t)
            .attr("opacity", () => 1)
            .attr(
              "transform",
              (_, i) =>
                `translate(${(i + 0.5) * cellSizeMax + i * paddingSize}, 0)`
            );
          trainLabel
            .transition()
            .duration(100)
            .ease((t: any) => t)
            .attr("opacity", () => 1)
            .attr(
              "transform",
              (_, i) =>
                `translate(${(i + 0.5) * cellSizeMax + i * paddingSize}, 0)`
            );

          if (prev === i.index + i.trainIndex * 6) {
            // 再次点击选中的单元格，回到初始状态
            return -1;
          }

          // 点击的不是已选中的单元格
          // 高亮当前选择cell
          d3.select(trainCells[i.trainIndex * 6 + i.index])
            .transition()
            .duration(100)
            .ease((t: any) => t)
            .attr("opacity", () => 1);

          if (i.trainIndex > 2) {
            // 移动左侧cell
            for (let rowIndex = 0; rowIndex <= i.trainIndex; rowIndex++) {
              moveRow(
                rowIndex,
                -(paddingSize + cellSizeMax) * (i.trainIndex - 2)
              );
            }
            // 隐藏左侧范围外cell
            for (let rowIndex = 0; rowIndex < i.trainIndex - 2; rowIndex++) {
              hideRow(rowIndex, true);
            }
          }

          // 移动右侧cell
          for (
            let rowIndex = i.trainIndex + 1;
            rowIndex < rows.length;
            rowIndex++
          ) {
            moveRow(
              rowIndex,
              width -
                titleWidth -
                (cellSizeMax + paddingSize) * 4 -
                (i.trainIndex - 2 > 0 ? i.trainIndex - 2 : 0) *
                  (paddingSize + cellSizeMax)
            );
          }
          // 隐藏右侧范围外cell
          for (
            let rowIndex = 4 + (i.trainIndex - 2 > 0 ? i.trainIndex - 2 : 0);
            rowIndex < rows.length;
            rowIndex++
          ) {
            hideRow(rowIndex, true);
          }

          return i.index + i.trainIndex * 6;
        });
      };

      const onCellMouseover = (_: any, i: any) => {
        // todo
      };
      const onCellMouseout = (_: any, i: any) => {
        // todo
      };

      cells
        .on("click", onCellClick)
        .on("mouseover", onCellMouseover)
        .on("mouseout", onCellMouseout);

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

  const attributionData = useMemo(() => {
    if (!data || focusCell === -1) return null;
    const trainIndex = Math.floor(focusCell / 6);
    const classIndex = focusCell % 6;
    return data[trainIndex][classIndex];
  }, [data, focusCell]);

  const attributionPred = useMemo(() => {
    if (!pred || focusCell === -1) return null;
    const trainIndex = Math.floor(focusCell / 6);
    const classIndex = focusCell % 6;
    return pred[trainIndex][classIndex];
  }, [pred, focusCell]);

  return (
    <div
      style={{
        width: "98.5%",
        height: "98%",
        marginRight: "1.5%",
        // marginLeft: "2%",
      }}
    >
      <div
        ref={ref}
        style={{
          width: "100%",
          height: "100%",
        }}
      />
      <div
        style={{
          width: `${attributionChartWidth}px`,
          height: "98%",
          position: "absolute",
          // marginLeft: "2%",
          top: "0",
          zIndex: focusCell === -1 ? -1 : "auto",
          // display: focusCell === -1 ? "none" : "block",
          left: `${attributionChartLeft}px`,
        }}
      >
        <AttributionChart
          rid={rid}
          classIndex={focusCell % 6}
          data={attributionData}
          pred={attributionPred}
          origin={attributionChartOrigin}
        />
      </div>
    </div>
  );
};

export default PredChart;
