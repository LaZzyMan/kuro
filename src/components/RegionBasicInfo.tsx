import React, { FC, useCallback, useState, useEffect } from "react";
import { Chart } from "@antv/g2";
import style from "./RegionBasicInfo.module.css";

const landCoverTypes = [
  "rice paddy",
  "other cropland",
  "orchard",
  "bare farmland",
  "broadleaf leaf on",
  "broadleaf leaf off",
  "needleleaf leaf off",
  "mixedleaf leaf off",
  "natural grassland",
  "grassland leaf off",
  "shrubland leaf on",
  "shrubland leaf off",
  "marshland",
  "mudlaf",
  "water",
  "herbaceons tundra",
  "impervious surface",
  "bareland",
];

const poiTypes = [
  "shopping service",
  "catering service",
  "domestic service",
  "transportation facilities service",
  "corporate",
  "business residence",
  "science and education service",
  "access facilities",
  "government agencies and social organizations",
  "financial insurance service",
  "accommodation service",
  "healthcare service",
  "vehicle service",
  "sport and leisure service",
  "public utilities",
  "famous tourist sites",
];

const buildingTypes = ["PLAND", "BLSI", "floorMean", "floorStd"];

export interface RegionBasicInfoProps {
  regionData: any;
  featureData: number[][] | null;
}

const RegionBasicInfo: FC<RegionBasicInfoProps> = ({
  regionData,
  featureData,
}: RegionBasicInfoProps) => {
  const [lcChart, setLcChart] = useState(null as any);
  const [poiChart, setPoiChart] = useState(null as any);
  const [rhythmChart, setRhythmChart] = useState(null as any);

  const lcChartContainer = useCallback(() => {
    let chart = new Chart({
      container: "lcchart",
      autoFit: true,
      padding: [40, 10, 40, 10],
    });

    chart.coordinate("polar", {
      startAngle: Math.PI, // 起始角度
      endAngle: Math.PI * (3 / 2), // 结束角度
    });

    chart.scale("value", {
      tickCount: 6,
    });

    chart.axis("value", {
      grid: {
        line: {
          type: "circle",
        },
        closed: false,
      },
      verticalFactor: 1,
      label: {
        offset: 15,
      },
    });

    chart.axis("type", {
      tickLine: {
        alignTick: false,
      },
      grid: {
        alignTick: false,
      },
    });

    chart.tooltip({
      showMarkers: false,
    });
    chart.interaction("element-highlight");
    chart.legend(false);

    chart
      .interval()
      .position("type*value")
      .color("type", "#EA5455-#FEB692")
      .style({
        lineWidth: 2,
        stroke: "#fff",
      });
    setLcChart(chart);
  }, []);

  const poiChartContainer = useCallback(() => {
    let chart = new Chart({
      container: "poichart",
      autoFit: true,
      padding: [40, 10, 40, 10],
    });

    chart.coordinate("polar", {
      startAngle: Math.PI * 2, // 起始角度
      endAngle: Math.PI * (5 / 2), // 结束角度
    });

    chart.scale("value", {
      tickCount: 6,
    });

    chart.axis("value", {
      grid: {
        line: {
          type: "circle",
        },
        closed: false,
      },
      verticalFactor: 1,
      label: {
        offset: 15,
      },
    });

    chart.axis("type", {
      tickLine: {
        alignTick: false,
      },
      grid: {
        alignTick: false,
      },
    });

    chart.tooltip({
      showMarkers: false,
    });
    chart.interaction("element-highlight");
    chart.legend(false);

    chart
      .interval()
      .position("type*value")
      .color("type", "#0396FF-#ABDCFF")
      .style({
        lineWidth: 2,
        stroke: "#fff",
      });
    setPoiChart(chart);
  }, []);

  const rhythmChartContainer = useCallback(() => {
    const chart = new Chart({
      container: "rhythmchart",
      autoFit: true,
      padding: [40, 40, 40, 40],
    });

    chart.scale("time", {
      range: [0, 1],
    });
    chart.scale("value", {
      nice: true,
    });
    chart.tooltip({
      shared: true,
      showCrosshairs: true,
    });

    chart.area().position("time*value").color("type");
    chart.line().position("time*value").color("type");
    chart.render();
    setRhythmChart(chart);
  }, []);

  useEffect(() => {
    if (!featureData || !lcChart) return;
    const lcData = landCoverTypes.map((type, i) => {
      return {
        type,
        value: Math.floor(featureData[0][i] * 100),
      };
    });
    lcData.sort((a, b) => b.value - a.value);
    lcChart.data(lcData.slice(0, 6));
    lcChart.render();
  }, [featureData, lcChart]);

  useEffect(() => {
    if (!featureData || !poiChart) return;
    const poiData = poiTypes.map((type, i) => {
      return {
        type,
        value: Math.floor(featureData[0][i] * 100),
      };
    });
    poiData.sort((a, b) => b.value - a.value);
    poiChart.data(poiData.slice(0, 6));
    poiChart.render();
  }, [featureData, poiChart]);

  useEffect(() => {
    if (!featureData || !rhythmChart) return;
    let timeArray = Array.from({ length: 24 }, (v, i) => i);
    let inData = timeArray.map((i) => {
      return {
        time: i + "h",
        type: "in",
        value: Math.floor(featureData[4][i] * 100),
      };
    });
    let outData = timeArray.map((i) => {
      return {
        time: i + "h",
        type: "out",
        value: Math.floor(featureData[4][i + 24] * 100),
      };
    });
    rhythmChart.data(inData.concat(outData));
    rhythmChart.render();
  }, [featureData, rhythmChart]);

  return (
    <div className={style.mainContainer}>
      <div id="lcchart" className={style.lcChart} ref={lcChartContainer}>
        <span className={style.lcTitle}>地表覆盖类型</span>
      </div>
      <div id="poichart" className={style.poiChart} ref={poiChartContainer}>
        <span className={style.poiTitle}>兴趣点类型</span>
      </div>
      <div
        id="rhythmchart"
        className={style.rhythmChart}
        ref={rhythmChartContainer}
      >
        <span className={style.rhythmTitle}>出租车流量分布</span>
      </div>
    </div>
  );
};

export default RegionBasicInfo;
