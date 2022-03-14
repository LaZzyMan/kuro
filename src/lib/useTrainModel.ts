import { useState, useEffect, Dispatch, SetStateAction } from "react";
import io from "socket.io-client";
import { uuid } from "./util";

type TrainStatus = "initial" | "load" | "train" | "pred" | "finish";

export interface Params {
  embeddingSize: number;
  gcnSize1: number;
  gcnSize2: number;
  dropout: number;
  lr: number;
  wd: number;
  e: number;
}

export default function useTrainModel(
  url: string,
  initTrainSet?: number[]
): [
  TrainStatus,
  number,
  Params,
  any,
  Dispatch<SetStateAction<number[] | undefined>>,
  Dispatch<SetStateAction<Params>>,
  Dispatch<SetStateAction<any[]>>
] {
  const [trainSet, setTrainSet] = useState(initTrainSet);
  const [result, setResult] = useState();
  const [status, setStatus] = useState("initial" as TrainStatus);
  const [epoch, setEpoch] = useState(0);
  const [params, setParams] = useState({
    embeddingSize: 50,
    gcnSize1: 64,
    gcnSize2: 64,
    dropout: 0.5,
    lr: 0.012,
    wd: 0.009,
    e: 0.01,
  } as Params);
  const [weights, setWeights] = useState([] as any[]);

  useEffect(() => {
    if (!trainSet) return;

    const socket = io(url);
    setStatus("initial");
    setEpoch(0);

    socket.on("response_connect", () => {
      console.log("socket connect.");
      socket.emit("train", trainSet, params, uuid(), weights);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, trainSet]);

  return [status, epoch, params, result, setTrainSet, setParams, setWeights];
}
