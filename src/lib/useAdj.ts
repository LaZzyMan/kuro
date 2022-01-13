import { useState, useEffect, Dispatch, SetStateAction } from "react";
import io from "socket.io-client";

export default function useAdj(
  url: string,
  id?: number
): [number | undefined, Dispatch<SetStateAction<number | undefined>>, any] {
  const [region, setRegion] = useState(id);
  const [result, setResult] = useState();

  useEffect(() => {
    if (!region) return;
    const socket = io(url);

    socket.on("response_connect", () => {
      console.log("socket connect.");
      socket.emit("adjs", region);
    });

    socket.on("response_disconnect", () => {
      console.log("socket disconnect.");
    });

    socket.on("adj", (res) => {
      setResult(res);
      socket.disconnect();
    });
  }, [url, region]);

  return [region, setRegion, result];
}
