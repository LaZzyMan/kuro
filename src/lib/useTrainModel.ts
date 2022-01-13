import { useState, useEffect, Dispatch, SetStateAction } from "react";
import io from "socket.io-client";

type TrainStatus = "initial" | "load" | "train" | "pred" | "finish";

export default function useTrainModel(
  url: string,
  initTrainSet?: number[]
): [TrainStatus, number, any, Dispatch<SetStateAction<number[] | undefined>>] {
  const [trainSet, setTrainSet] = useState(initTrainSet);
  const [result, setResult] = useState();
  const [status, setStatus] = useState("initial" as TrainStatus);
  const [epoch, setEpoch] = useState(0);

  useEffect(() => {
    if (!trainSet) return;

    const socket = io(url);
    setStatus("initial");
    setEpoch(0);

    socket.on("response_connect", () => {
      console.log("socket connect.");
      socket.emit("train", trainSet);
    });

    socket.on("response_disconnect", () => {
      console.log("socket disconnect.");
    });

    socket.on("train_info", (res) => {
      if (res.type === "epoch") {
        setStatus("train");
        setEpoch(res.content.count);
      } else if (res.type === "info") {
        setStatus("load");
      }
    });

    socket.on("train_result", (res) => {
      if (res.type === "info") {
        setStatus("pred");
      } else if (res.type === "result") {
        setStatus("finish");
        setResult(res.content);

        socket.disconnect();
      }
    });
  }, [url, trainSet]);

  return [status, epoch, result, setTrainSet];
}
