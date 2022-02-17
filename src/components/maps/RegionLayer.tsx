import React, {
  useCallback,
  useState,
  FC,
  Fragment,
  useContext,
  useMemo,
} from "react";
import { AppContext } from "../../AppReducer";
import bbox from "@turf/bbox";
import { Layer, Source, MapContext } from "react-mapbox-gl";

export interface RegionLayerProps {
  data: any;
  onClick: Function;
  status: "normal" | "menu" | "detail";
  targetRids?: number[];
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
  const [buildingFeatures, setBuildingFeatures] = useState(nullGeojson);

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
            inTrainSet: v.properties.rid in trainSet ? "in" : "out",
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
      const buildings = map!.queryRenderedFeatures(
        [map!.project(bounds[0]), map!.project(bounds[1])],
        {
          layers: ["3dBuilding"],
        }
      );
      setBuildingFeatures({
        type: "FeatureCollection",
        features: buildings,
      } as any);
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
        feature.properties.rid in trainSet ? "in" : "out";
      setHoverFeature(feature);
    },
    [data, map, trainSet]
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
        id="selectedBuilding"
        geoJsonSource={{
          type: "geojson",
          data: buildingFeatures,
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
                  "#0080ff",
                  "in",
                  "#ff0000",
                  "#ff0000",
                ]
              : [
                  "match",
                  ["get", "class"],
                  "C",
                  "#ef476f",
                  "G",
                  "#06d6a0",
                  "M",
                  "#073b4c",
                  "P",
                  "#ffd166",
                  "R",
                  "#118ab2",
                  "U",
                  "#8338ec",
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
          "fill-color": [
            "match",
            ["get", "inTrainSet"],
            "out",
            "#0080ff",
            "in",
            "#ff0000",
            "#ff0000",
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
          "line-color": "#541212",
          "line-opacity": 0.8,
          "line-dasharray": [2, 1],
          "line-width": 3,
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
          "fill-color": "red",
          "fill-opacity": 0.6,
        }}
        layout={{
          visibility: status === "detail" ? "visible" : "none",
        }}
      />
      <Layer
        id="3dBuilding"
        type="fill-extrusion"
        sourceId="composite"
        sourceLayer="building"
        filter={["==", "extrude", "true"]}
        minzoom={10}
        paint={{
          "fill-extrusion-color": "#aaa",
          "fill-extrusion-height": 10,
          "fill-extrusion-base": 0,
          "fill-extrusion-opacity": 0.3,
        }}
        layout={{
          visibility: status === "normal" ? "visible" : "none",
        }}
      />
      <Layer
        id="selectedBuilding"
        sourceId="selectedBuilding"
        type="fill-extrusion"
        filter={["==", "extrude", "true"]}
        paint={{
          "fill-extrusion-color": "#aaa",
          "fill-extrusion-height": ["*", 10, ["get", "height"]],
          "fill-extrusion-base": ["get", "min_height"],
          "fill-extrusion-opacity": 0.8,
        }}
        layout={{
          visibility: status !== "normal" ? "visible" : "none",
        }}
      />
    </Fragment>
  );
};

export default RegionLayer;
