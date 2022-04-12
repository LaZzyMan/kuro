import React, {
  useCallback,
  useState,
  FC,
  Fragment,
  useContext,
  useMemo,
  useEffect,
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
import _ from "lodash";

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
    contrast,
    mobilityRegionId,
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

  const contrastResult = useMemo(() => {
    if (contrast.active) {
      return trainList.filter((v) => v.name === contrast.ref)[0].result.pred;
    } else {
      return null;
    }
  }, [contrast, trainList]);

  const displayData = useMemo(() => {
    if (displayResult) {
      if (contrastResult) {
        return {
          ...data,
          features: data.features.map((v) => ({
            ...v,
            properties: {
              ...v.properties,
              class: displayResult[v.properties.rid],
              contrast:
                displayResult[v.properties.rid] ===
                contrastResult[v.properties.rid]
                  ? "unchanged"
                  : "changed",
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
              class: displayResult[v.properties.rid],
            },
          })),
        };
      }
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
  }, [trainSet, data, displayResult, contrastResult]);

  const targetFeatures = useMemo(() => {
    if (!targetRids) return nullGeojson;
    const targets = (data as any).features.filter(
      (v: any) => targetRids.indexOf(v.properties.rid) !== -1
    );
    return Object.assign({}, data, { features: targets });
  }, [targetRids, data]);

  const mobilityFeatures = useMemo(() => {
    if (mobilityRegionId < 0) return nullGeojson;
    const target = (data as any).features.filter(
      (v: any) => v.properties.rid === mobilityRegionId
    );
    return Object.assign({}, data, { features: target });
  }, [mobilityRegionId, data]);

  useEffect(() => {
    if (selectedFeature !== nullGeojson) {
      if (mobilityFeatures === nullGeojson) {
        let bounds: any = bbox(selectedFeature);
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
      } else {
        const tmp = _.cloneDeep(mobilityFeatures);
        tmp.features.push(selectedFeature);
        let bounds: any = bbox(tmp);
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
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobilityFeatures]);

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

      if (contrastResult)
        feature.properties.contrast =
          displayResult[feature.properties.rid] ===
          contrastResult[feature.properties.rid]
            ? "unchanged"
            : "changed";
      setHoverFeature(feature);
    },
    [data, map, trainSet, displayResult, contrastResult]
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
        id="mobilityPolygon"
        geoJsonSource={{
          type: "geojson",
          data: mobilityFeatures,
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
              : contrast.active
              ? [
                  "match",
                  ["get", "contrast"],
                  "changed",
                  inColor,
                  "unchanged",
                  outColor,
                  outColor,
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
              : contrast.active
              ? [
                  "match",
                  ["get", "contrast"],
                  "changed",
                  inColor,
                  "unchanged",
                  outColor,
                  outColor,
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
          "fill-opacity": 1.0,
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
        id="mobilityRegion"
        sourceId="mobilityPolygon"
        type="fill"
        paint={{
          "fill-color": [
            "match",
            ["get", "land_use_code"],
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
        layout={
          {
            // visibility: status === "detail" ? "visible" : "none",
          }
        }
      />
      <Layer
        id="detailTargetRegion"
        sourceId="targetPolygon"
        type="fill"
        paint={{
          "fill-color": flowIn ? inColor : outColor,
          "fill-opacity": 0.3,
        }}
        layout={{
          visibility: status === "detail" ? "visible" : "none",
        }}
      />
      <Layer
        id="detailTargetRegionLine"
        sourceId="targetPolygon"
        type="line"
        paint={{
          "line-color": flowIn ? inColor : outColor,
          "line-opacity": 0.8,
          "line-width": 1.5,
        }}
        layout={{
          "line-join": "round",
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
            ? ["*", ["get", "floor"], 10]
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
