import { useState, useEffect, Dispatch, SetStateAction } from "react";
import io from "socket.io-client";

type AttributeStatus = "init" | "finish" | "progress";

export default function useAttrubte(
  url: string
): [
  AttributeStatus,
  number,
  any,
  Dispatch<SetStateAction<number | null>>,
  Dispatch<SetStateAction<string[]>>
] {
  const [rid, setRid] = useState(null as null | number);
  const [result, setResult] = useState();
  const [status, setStatus] = useState("init" as AttributeStatus);
  const [progress, setProgress] = useState(0);
  const [models, setModels] = useState([] as string[]);

  useEffect(() => {
    if (!rid || models.length === 0) return;
    const socket = io(url);
    setStatus("init");
    setProgress(0);

    socket.on("response_connect", () => {
      console.log("socket connect.");
      socket.emit("attribute", rid, models);
    });

    socket.on("response_disconnect", () => {
      console.log("socket disconnect.");
    });

    socket.on("attribute_info", (res) => {
      if (res.type === "progress") {
        setStatus("progress");
        setProgress(res.content.count);
      }
    });

    socket.on("attribute_result", (res) => {
      if (res.type === "result") {
        setStatus("finish");
        setResult(res.content);
        socket.disconnect();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, rid, models]);

  return [status, progress, result, setRid, setModels];
}
