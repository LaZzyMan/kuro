import React, {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AppContext } from "../AppReducer";
import TrainSetChart from "./charts/TrainSetChart";
import style from "./InfoView.module.css";
import { Switch } from "antd";
import { classes } from "../lib/util";
import { CloseOutlined, CheckOutlined } from "@ant-design/icons";

export interface Props {
  rid: null | number;
}

const InfoView: FC<Props> = ({ rid }: Props) => {
  const { state, dispatch } = useContext(AppContext);
  const { currentTrainSet, geoJSONData } = state;
  const [selectedClass, setSelectedClass] = useState(
    null as "C" | "G" | "M" | "P" | "R" | "U" | null
  );
  const [inTrainSet, setInTrainSet] = useState(false);

  const switchChangeHandler = useCallback(
    (e) => {
      setInTrainSet(e);
      if (e) {
        dispatch({
          type: "appendTrainSet",
          regionClass: { rid, class: selectedClass },
        });
      } else {
        dispatch({
          type: "removeTrainSet",
          rid,
        });
      }
    },
    [rid, dispatch, selectedClass]
  );

  useEffect(() => {
    const regionClass = currentTrainSet.filter((v) => v.rid === rid);
    if (regionClass.length === 0) {
      setInTrainSet(false);
      setSelectedClass(null);
    } else {
      setInTrainSet(true);
      setSelectedClass(regionClass[0].class);
    }
  }, [rid, currentTrainSet]);

  const area = useMemo(() => {
    if (!geoJSONData || rid === null) return 0;
    return (geoJSONData.region.features[rid].properties.area / 1000000).toFixed(
      3
    );
  }, [rid, geoJSONData]);

  const poi = useMemo(() => {
    if (!geoJSONData || rid === null) return 0;
    return geoJSONData.region.features[rid].properties.poi_count;
  }, [rid, geoJSONData]);

  return (
    <div className={style.container}>
      <div className={style.regionInfo}>
        <div className={style.regionInfoTitle}>
          <span>选区信息</span>
        </div>
        <div
          style={{
            display: "flex",
            paddingLeft: "5%",
            paddingRight: "10%",
            marginTop: "10px",
            justifyContent: "space-between",
          }}
        >
          <span>区域面积:</span>
          <span style={{ color: "#2E94B9", fontWeight: "bold" }}>
            {area} 平方千米
          </span>
        </div>
        <div
          style={{
            display: "flex",
            paddingLeft: "5%",
            paddingRight: "10%",
            marginTop: "10px",
            justifyContent: "space-between",
          }}
        >
          <span>POI总数:</span>
          <span style={{ color: "#F0B775", fontWeight: "bold" }}>{poi} 个</span>
        </div>
        <div
          style={{
            display: "flex",
            paddingLeft: "5%",
            paddingRight: "10%",
            marginTop: "10px",
            justifyContent: "space-between",
          }}
        >
          <span>区域类别:</span>
          <span style={{ fontWeight: "bold" }}>
            {selectedClass
              ? classes.filter((v) => v.code === selectedClass)[0].name
              : "暂无"}
          </span>
        </div>
        <div className={style.switchContainer}>
          {classes.map((value, index) => (
            <div
              title={value.name}
              className={
                selectedClass === value.code
                  ? style.switchCircleSelected
                  : style.switchCircle
              }
              onClick={() => {
                setSelectedClass((prev) => {
                  if (prev === value.code) {
                    return null;
                  } else {
                    return value.code as any;
                  }
                });
              }}
              key={value.code}
              style={{ backgroundColor: value.color }}
            />
          ))}
        </div>
        <div
          style={{
            justifyContent: "space-between",
            display: "flex",
            paddingLeft: "5%",
            paddingRight: "10%",
          }}
        >
          <span>加入训练集</span>
          <Switch
            disabled={selectedClass === null}
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            onChange={switchChangeHandler}
            checked={inTrainSet}
          />
        </div>
      </div>
      <div className={style.trainSet}>
        <div className={style.trainSetTitle}>
          <span>训练集概况</span>
        </div>
        <TrainSetChart />
      </div>
    </div>
  );
};

export default InfoView;
