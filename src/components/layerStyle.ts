import mapboxgl from "mapbox-gl";

export const basicRegion: mapboxgl.FillLayer = {
  id: "basicRegion",
  type: "fill",
  source: "regionPolygon",
  paint: {
    "fill-color": "#0080ff",
    "fill-opacity": 0.6,
  },
};

export const basicMouseoverRegion: mapboxgl.FillLayer = {
  id: "basicMouseoverRegion",
  type: "fill",
  source: "regionMouseoverPolygon",
  paint: {
    "fill-color": "#0080ff",
    "fill-opacity": 0.8,
  },
};

export const basicSelectRegion: mapboxgl.LineLayer = {
  id: "basicSelectRegion",
  type: "line",
  source: "regionSelectPolygon",
  paint: {
    "line-color": "#541212",
    "line-opacity": 0.8,
    "line-dasharray": [2, 1],
    "line-width": 5,
  },
  layout: {
    "line-join": "round",
  },
};

export const selectedBuildingLayer: mapboxgl.FillExtrusionLayer = {
  id: "selectedBuilding",
  source: "selectedBuilding",
  filter: ["==", "extrude", "true"],
  type: "fill-extrusion",
  minzoom: 10,
  paint: {
    "fill-extrusion-color": "#aaa",
    "fill-extrusion-height": ["*", 10, ["get", "height"]],
    "fill-extrusion-base": ["get", "min_height"],
    "fill-extrusion-opacity": 0.8,
  },
  layout: {
    visibility: "none",
  },
};

export const buildingLayer: mapboxgl.FillExtrusionLayer = {
  id: "3dBuilding",
  source: "composite",
  "source-layer": "building",
  filter: ["==", "extrude", "true"],
  type: "fill-extrusion",
  minzoom: 10,
  paint: {
    "fill-extrusion-color": "#aaa",
    "fill-extrusion-height": 10,
    "fill-extrusion-base": 0,
    "fill-extrusion-opacity": 0.3,
  },
  layout: {
    visibility: "visible",
  },
};
