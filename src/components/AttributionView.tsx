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
import { Empty, Spin, Switch, Button } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";

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
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <span>FEATURTE ATTRIBUTE</span>
          <Button
            style={{ marginLeft: "10px", color: "white" }}
            type="link"
            title="Help"
            icon={<QuestionCircleOutlined />}
          />
        </div>
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
              fontWeight: 500,
            }}
          >
            Baseline:
          </span>
          <Switch
          className={style.switch}
            checkedChildren="Mean"
            unCheckedChildren="Zero"
            onChange={switchChangeHandler}
            checked={baseline === "mean"}
            style={{
              background: baseline === "mean" ? "#fefefe" : "#ddd",
            }}
          />
        </div>
      </div>
      <div className={style.chart}>
        <Spin
          spinning={status !== "init" && status !== "finish"}
          tip={`Interpreting Model Prediction: Model: ${progress} / ${models.length}.`}
          wrapperClassName={style.spin}
          size="large"
        >
          {rid && trainList.length !== 0 ? (
            <PredChart data={data} pred={pred} rid={rid} />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{
                paddingTop: "10%",
                margin: 0,
              }}
              description={
                <span>{rid ? "No Train Results." : "Region Unselected."}</span>
              }
            />
          )}
        </Spin>
      </div>
    </div>
  );
};

export default AttributionView;
