import React, {
  createContext,
  Context,
  useCallback,
  useState,
  FC,
  useEffect,
} from "react";
import bbox from "@turf/bbox";
import { GeoJSONData } from "../lib/loadData";
import mapboxgl, { Map, GeoJSONSource } from "mapbox-gl";
import {
  basicMouseoverRegion,
  basicRegion,
  basicSelectRegion,
} from "./layerStyle";

export interface KuroMapProps {
  data: GeoJSONData | null;
  onRegionClick: Function;
  child?: React.ReactElement;
}

const nullData: any = {
  type: "Feature",
  properties: {},
  geometry: {
    type: "Polygon",
    coordinates: [],
  },
};
const MapContext = createContext(undefined) as Context<Map | undefined>;

mapboxgl.accessToken =
  "pk.eyJ1IjoiaGlkZWlubWUiLCJhIjoiY2tvam9vamNnMHd1YTJxcm16YTRpaWZocCJ9.9nhmt0tjF3aVTY6p1asRxg";

const KuroMap: FC<KuroMapProps> = ({ data, onRegionClick }: KuroMapProps) => {
  const [map, setMap] = useState(undefined as Map | undefined);
  const containerRef = useCallback((node) => {
    if (node !== null) {
      const kuroMap = new mapboxgl.Map({
        container: "kuromap",
        style: "mapbox://styles/mapbox/streets-v11",
        center: [114.8, 22.5],
        zoom: 10,
        bounds: new mapboxgl.LngLatBounds([73.66, 3.86], [135.05, 53.55]),
        maxBounds: new mapboxgl.LngLatBounds([73.66, 3.86], [135.05, 53.55]),
      });
      setMap(kuroMap);
    }
  }, []);

  const addSources = (data: GeoJSONData) => {
    const region = map?.getSource("regionPolygon");
    if (region) {
      (region as GeoJSONSource).setData(data as any);
    } else {
      map?.addSource("regionPolygon", {
        type: "geojson",
        data: (data as GeoJSONData).region as any,
      });
      map?.fitBounds(
        new mapboxgl.LngLatBounds(
          [113.7780157145766, 22.47535583588967],
          [114.3210497974715, 22.73495619557957]
        ),
        { padding: 10 }
      );
    }
    if (!map?.getSource("regionMouseoverPolygon"))
      map?.addSource("regionMouseoverPolygon", {
        type: "geojson",
        data: nullData,
      });
    if (!map?.getSource("regionSelectPolygon"))
      map?.addSource("regionSelectPolygon", {
        type: "geojson",
        data: nullData,
      });
  };

  const addLayers = () => {
    if (!map?.getLayer("basicRegion")) {
      map?.addLayer(basicRegion);
      map?.addLayer(basicMouseoverRegion);
      map?.addLayer(basicSelectRegion);

      map?.on("click", "basicRegion", (e: any) => {
        (map.getSource("regionSelectPolygon") as GeoJSONSource).setData(
          e.features[0]
        );
        const bounds = bbox(e.features[0]);
        map.fitBounds(
          [
            [bounds[0], bounds[1]],
            [bounds[2], bounds[3]],
          ],
          { padding: 100 }
        );
        onRegionClick(e.features[0].properties.rid);
      });
      map?.on("mouseover", "basicRegion", (e: any) => {
        (map.getSource("regionMouseoverPolygon") as GeoJSONSource).setData(
          e.features[0]
        );
      });
    }
  };

  useEffect(() => {
    if (map) {
      if (map?.loaded()) {
        addSources(data as GeoJSONData);
        addLayers();
      } else {
        map.on("load", () => {
          addSources(data as GeoJSONData);
          addLayers();
        });
      }
    }
  }, [data]);

  return (
    <MapContext.Provider value={map}>
      <div
        id="kuromap"
        ref={containerRef}
        style={{
          height: "100vh",
          width: "100vw",
        }}
      />
    </MapContext.Provider>
  );
};

export default KuroMap;
