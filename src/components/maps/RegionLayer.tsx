import React, {
  useCallback,
  useState,
  FC,
  Fragment,
  useContext,
  useMemo,
} from "react";
import {
  trainSetColor,
  classColor,
  selectedRegionColor,
  buildingColor,
  inColor,
  outColor,
} from "../../lib/util";
import { AppContext } from "../../AppReducer";
import bbox from "@turf/bbox";
import { Layer, Source, MapContext } from "react-mapbox-gl";

export interface RegionLayerProps {
  data: any;
  onClick: Function;
  status: "normal" | "menu" | "detail";
  targetRids?: number[];
  buildingData: any;
  showBuidling: boolean;
  flowIn: boolean;
}

const nullGeojson = {
  type: "Feature",
  geometry: {
    type: "Polygon",
    coordinates: [],
  },
  properties: {},
};

const RegionLayer: FC<RegionLayerProps> = ({
  data,
  status,
  onClick,
  targetRids,
  flowIn,
  buildingData,
  showBuidling,
}) => {
  const { state } = useContext(AppContext);
  const {
    displayTrainSet,
    currentTrainSet,
    displayMode,
    selectedTrainName,
    trainList,
  } = state;
  const map = useContext(MapContext);
  const [selectedFeature, setSelectedFeature] = useState(nullGeojson);
  const [hoverFeature, setHoverFeature] = useState(nullGeojson);

  const trainSet = useMemo(() => {
    if (displayTrainSet.length === 0) {
      return currentTrainSet.map((v) => v.rid);
    } else {
      return displayTrainSet.map((v) => v.rid);
    }
  }, [currentTrainSet, displayTrainSet]);

  const displayResult = useMemo(() => {
    if (displayMode === "result" && selectedTrainName) {
      return trainList.filter((v) => v.name === selectedTrainName)[0].result
        .pred;
    } else {
      return null;
    }
  }, [displayMode, trainList, selectedTrainName]);

  const displayData = useMemo(() => {
    if (displayResult) {
      return {
        ...data,
        features: data.features.map((v) => ({
          ...v,
          properties: {
            ...v.properties,
            class: displayResult[v.properties.rid],
          },
        })),
      };
    } else {
      return {
        ...data,
        features: data.features.map((v) => ({
          ...v,
          properties: {
            ...v.properties,
            inTrainSet:
              trainSet.indexOf(v.properties.rid) !== -1 ? "in" : "out",
          },
        })),
      };
    }
  }, [trainSet, data, displayResult]);

  const targetFeatures = useMemo(() => {
    if (!targetRids) return nullGeojson;
    const targets = (data as any).features.filter(
      (v: any) => targetRids.indexOf(v.properties.rid) !== -1
    );
    return Object.assign({}, data, { features: targets });
  }, [targetRids, data]);

  const clickHandler = useCallback(
    (e: any) => {
      const box = [
        [e.point.x - 3, e.point.y - 3],
        [e.point.x + 3, e.point.y + 3],
      ] as any;
      const features = map!.queryRenderedFeatures(box, {
        layers: ["basicRegion"],
      });
      if (features.length === 0) return;
      const rid = features[0].properties!.rid;
      const feature: any = (data as any).features.filter(
        (v: any) => v.properties.rid === rid
      )[0];
      setSelectedFeature(feature);
      onClick(feature);

      let bounds: any = bbox(feature);
      map!.fitBounds(bounds, {
        padding:
          Math.min(
            map!.getContainer().offsetHeight,
            map!.getContainer().offsetWidth
          ) * 0.35,
        offset: [
          0,
          -Math.min(
            map!.getContainer().offsetHeight,
            map!.getContainer().offsetWidth
          ) * 0.06,
        ],
      });
      bounds = [
        [bounds[0], bounds[1]],
        [bounds[2], bounds[3]],
      ];
    },
    [data, map, onClick]
  );

  const mousemoveHandler = useCallback(
    (e: any) => {
      const box = [
        [e.point.x - 5, e.point.y - 5],
        [e.point.x + 5, e.point.y + 5],
      ] as any;

      const features = map!.queryRenderedFeatures(box, {
        layers: ["basicRegion"],
      });
      if (features.length === 0) return;
      const rid = features[0].properties!.rid;
      const feature: any = (data as any).features.filter(
        (v: any) => v.properties.rid === rid
      )[0];
      feature.properties.inTrainSet =
        trainSet.indexOf(feature.properties.rid) !== -1 ? "in" : "out";
      if (displayResult)
        feature.properties.class = displayResult[feature.properties.rid];
      setHoverFeature(feature);
    },
    [data, map, trainSet, displayResult]
  );

  return (
    <Fragment>
      <Source
        id="regionPolygon"
        geoJsonSource={{
          type: "geojson",
          data: displayData,
        }}
      />
      <Source
        id="hoverPolygon"
        geoJsonSource={{
          type: "geojson",
          data: hoverFeature,
        }}
      />
      <Source
        id="selectedPolygon"
        geoJsonSource={{
          type: "geojson",
          data: selectedFeature,
        }}
      />
      <Source
        id="targetPolygon"
        geoJsonSource={{
          type: "geojson",
          data: targetFeatures,
        }}
      />
      <Source
        id="regionBuilding"
        geoJsonSource={{
          type: "geojson",
          data: buildingData,
        }}
      />
      <Layer
        id="basicRegion"
        sourceId="regionPolygon"
        type="fill"
        paint={{
          "fill-color":
            displayMode === "trainSet"
              ? [
                  "match",
                  ["get", "inTrainSet"],
                  "out",
                  trainSetColor[0],
                  "in",
                  trainSetColor[1],
                  trainSetColor[1],
                ]
              : [
                  "match",
                  ["get", "class"],
                  "C",
                  classColor[0],
                  "G",
                  classColor[1],
                  "M",
                  classColor[2],
                  "P",
                  classColor[3],
                  "R",
                  classColor[4],
                  "U",
                  classColor[5],
                  "#ffffff",
                ],
          "fill-opacity": 0.6,
        }}
        onClick={clickHandler}
        onMouseMove={mousemoveHandler}
        layout={{
          visibility: status === "normal" ? "visible" : "none",
        }}
      />
      <Layer
        id="basicHoverRegion"
        sourceId="hoverPolygon"
        type="fill"
        paint={{
          "fill-color":
            displayMode === "trainSet"
              ? [
                  "match",
                  ["get", "inTrainSet"],
                  "out",
                  trainSetColor[0],
                  "in",
                  trainSetColor[1],
                  trainSetColor[1],
                ]
              : [
                  "match",
                  ["get", "class"],
                  "C",
                  classColor[0],
                  "G",
                  classColor[1],
                  "M",
                  classColor[2],
                  "P",
                  classColor[3],
                  "R",
                  classColor[4],
                  "U",
                  classColor[5],
                  "#ffffff",
                ],
          "fill-opacity": 0.8,
        }}
        layout={{
          visibility: status === "normal" ? "visible" : "none",
        }}
      />
      <Layer
        id="basicSelectedRegion"
        sourceId="selectedPolygon"
        type="line"
        paint={{
          "line-color": selectedRegionColor,
          "line-opacity": 0.8,
          // "line-dasharray": [2, 1],
          "line-width": 5,
        }}
        layout={{
          "line-join": "round",
          visibility: status === "normal" ? "none" : "visible",
        }}
      />
      <Layer
        id="detailTargetRegion"
        sourceId="targetPolygon"
        type="fill"
        paint={{
          "fill-color": flowIn ? inColor : outColor,
          "fill-opacity": 0.6,
        }}
        layout={{
          visibility: status === "detail" ? "visible" : "none",
        }}
      />
      <Layer
        id="regionBuilding"
        sourceId="regionBuilding"
        type="fill-extrusion"
        paint={{
          "fill-extrusion-color": buildingColor,
          "fill-extrusion-height": showBuidling
            ? ["*", ["get", "floor"], 20]
            : 0,
          "fill-extrusion-opacity": 0.8,
          "fill-extrusion-height-transition": {
            duration: 500,
            delay: 100,
          },
        }}
      />
      <Layer id="sky" type="sky" />
    </Fragment>
  );
};

export default RegionLayer;
