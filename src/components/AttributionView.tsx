import React, {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AppContext } from "../AppReducer";
import useAttrubte from "../lib/useAttribute";
import PredChart from "./charts/PredChart";
import style from "./AttributionView.module.css";
import { Empty, Spin, Switch } from "antd";

export interface Props {
  rid: null | number;
}

const AttributionView: FC<Props> = ({ rid }: Props) => {
  const { state, dispatch } = useContext(AppContext);
  const { trainList, attributionCache } = state;
  const [baseline, setBaseline] = useState("mean" as "mean" | "zero");

  const switchChangeHandler = useCallback((e) => {
    setBaseline(e ? "mean" : "zero");
  }, []);

  const models = useMemo(() => {
    const cache = rid ? attributionCache[rid] : null;
    if (!cache) {
      return trainList.map((v) => v.id);
    } else {
      return trainList
        .filter((v) => cache[v.id] === undefined)
        .map((v) => v.id);
    }
  }, [trainList, rid, attributionCache]);

  const [status, progress, result, setRid, setModels] = useAttrubte(
    "ws://192.168.61.91:7325/kuro"
  );

  useEffect(() => {
    setRid(rid);
    return () => setRid(null);
  }, [rid, setRid]);

  useEffect(() => {
    setModels(models);
    return () => setModels([]);
  }, [models, setModels]);

  useEffect(() => {
    if (!result) return;
    console.log(result);
    dispatch({ type: "addAttributionCache", rid, models, result });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  const data = useMemo(() => {
    if (!rid || trainList.length === 0) return null;
    let complete = true;
    const attributions: any[] = [];
    for (let train of trainList) {
      const attribution = attributionCache[rid][train.id];
      if (!attribution) {
        complete = false;
        break;
      } else {
        attributions.push(attribution);
      }
    }
    return complete ? attributions : null;
  }, [trainList, attributionCache, rid]);

  const pred = useMemo(() => {
    if (rid && trainList.length !== 0)
      return trainList.map((v) => v.result.score[rid]);
  }, [trainList, rid]);

  return (
    <div className={style.container}>
      <div className={style.title}>
        <span>选区信息</span>
        <div
          style={{
            justifyContent: "space-between",
            display: "flex",
            width: "180px",
            paddingRight: "2%",
          }}
        >
          <span
            style={{
              fontSize: "14px",
              fontWeight: "normal",
            }}
          >
            特征归因基准
          </span>
          <Switch
            checkedChildren="均值"
            unCheckedChildren="零值"
            onChange={switchChangeHandler}
            checked={baseline === "mean"}
          />
        </div>
      </div>
      <div className={style.chart}>
        <Spin
          spinning={status !== "init" && status !== "finish"}
          tip={`正在进行模型解释: Model: ${progress} / ${models.length}.`}
          wrapperClassName={style.spin}
          size="large"
        >
          {rid && trainList.length !== 0 ? (
            <PredChart data={data} pred={pred} rid={rid}/>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{
                paddingTop: "10%",
                margin: 0,
              }}
              description={
                <span>{rid ? "暂无训练结果" : "未选择目标区域"}</span>
              }
            />
          )}
        </Spin>
      </div>
    </div>
  );
};

export default AttributionView;
