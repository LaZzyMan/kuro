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
import { wsURL } from "../lib/util";

export interface Props {
  rid: null | number;
}

const AttributionView: FC<Props> = ({ rid }: Props) => {
  const { state, dispatch } = useContext(AppContext);
  const { trainList, attributionCache } = state;
  const [active, setActive] = useState(false);

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

  const [status, progress, result, setRid, setModels] = useAttrubte(wsURL);

  const switchChangeHandler = useCallback(
    (e) => {
      setActive(e);
      if (e) {
        setRid(rid);
      } else {
        setRid(null);
      }
    },
    [rid, setRid]
  );

  useEffect(() => {
    setActive(models.length === 0);
    setModels(models);
    return () => {
      setRid(null);
      setModels([]);
    };
  }, [models, setModels, setRid]);

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
          <span>FEATURE ATTRIBUTE</span>
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
            Attribution:
          </span>
          <Switch
            className={style.switch}
            checkedChildren="Active"
            unCheckedChildren="None"
            onChange={switchChangeHandler}
            checked={active}
            style={{
              background: active ? "#fefefe" : "#ddd",
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
                paddingTop: "120px",
                margin: 0,
              }}
              description={
                <div>
                  <div style={{ fontWeight: "bold" }}>
                    {rid ? "No Train Result." : "Region Unselected."}
                  </div>
                  <div>
                    {rid
                      ? "Train models to get feature attribution."
                      : "Select region on map to explore feature attribution."}
                  </div>
                </div>
              }
            />
          )}
        </Spin>
      </div>
    </div>
  );
};

export default AttributionView;
