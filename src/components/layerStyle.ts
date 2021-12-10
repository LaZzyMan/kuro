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

export const basicSelectRegion: mapboxgl.FillLayer = {
  id: "basicSelectRegion",
  type: "fill",
  source: "regionSelectPolygon",
  paint: {
    "fill-color": "orange",
    "fill-opacity": 0.6,
  },
};
