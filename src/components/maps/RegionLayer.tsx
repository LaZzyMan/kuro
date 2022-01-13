import React, { useCallback, useState, FC, Fragment, useContext } from "react";
import bbox from "@turf/bbox";
import { Layer, Source, MapContext } from "react-mapbox-gl";

export interface RegionLayerProps {
  data: any;
  onClick: Function;
  status: "normal" | "menu" | "detail";
}

const nullGeojson = {
  type: "Feature",
  geometry: {
    type: "Polygon",
    coordinates: [],
  },
  properties: {},
};

const RegionLayer: FC<RegionLayerProps> = ({ data, status, onClick }) => {
  const map = useContext(MapContext);
  const [selectedFeature, setSelectedFeature] = useState(nullGeojson);
  const [hoverFeature, setHoverFeature] = useState(nullGeojson);
  const [buildingFeatures, setBuildingFeatures] = useState(nullGeojson);

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
      map!.fitBounds(bounds, { padding: 300 });
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
      setHoverFeature(feature);
    },
    [data, map]
  );

  return (
    <Fragment>
      <Source
        id="regionPolygon"
        geoJsonSource={{
          type: "geojson",
          data,
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
        paint={{ "fill-color": "#0080ff", "fill-opacity": 0.6 }}
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
          "fill-color": "#0080ff",
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
          "line-width": 5,
        }}
        layout={{
          "line-join": "round",
          visibility: status === "normal" ? "none" : "visible",
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
