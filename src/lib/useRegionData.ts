import { useState, useEffect, Dispatch, SetStateAction } from "react";
import io from "socket.io-client";

const nullGeojson = {
  type: "Feature",
  geometry: {
    type: "Polygon",
    coordinates: [],
  },
  properties: {},
};

export default function useRegionData(
  url: string,
  id?: number
): [
  number | undefined,
  Dispatch<SetStateAction<number | undefined>>,
  any,
  any
] {
  const [rid, setrid] = useState(id);
  const [adj, setAdj] = useState();
  const [building, setBuilding] = useState(nullGeojson);

  useEffect(() => {
    if (!rid) return;
    const socket = io(url);

    socket.on("response_connect", () => {
      console.log("socket connect.");
      socket.emit("region_data", rid);
    });

    socket.on("response_disconnect", () => {
      console.log("socket disconnect.");
    });

    socket.on("region", (res) => {
      setAdj(res.adj);
      setBuilding(res.building);
      socket.disconnect();
    });
  }, [url, rid]);

  return [rid, setrid, adj, building];
}
