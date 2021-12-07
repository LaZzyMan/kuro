import React, { createContext, Context, useCallback, useState } from "react";
import mapboxgl, { Map } from "mapbox-gl";

const MapContext = createContext(undefined) as Context<Map | undefined>;

mapboxgl.accessToken =
  "pk.eyJ1IjoiaGlkZWlubWUiLCJhIjoiY2tvam9vamNnMHd1YTJxcm16YTRpaWZocCJ9.9nhmt0tjF3aVTY6p1asRxg";

const KuroMap = () => {
  const [map, setMap] = useState(undefined as Map | undefined);
  const containerRef = useCallback((node) => {
    if (node !== null) {
      const kuroMap = new mapboxgl.Map({
        container: "kuromap",
        style: "mapbox://styles/mapbox/streets-v11",
        center: [114.8, 22.5],
        zoom: 10,
      });
      setMap(kuroMap);
    }
  }, []);
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
