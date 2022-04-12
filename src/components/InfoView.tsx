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
import {
  CloseOutlined,
  CheckOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { Button } from "antd";

export interface Props {
  rid: null | number;
}

const InfoView: FC<Props> = ({ rid }: Props) => {
  const { state, dispatch } = useContext(AppContext);
  const { currentTrainSet, geoJSONData, featureData } = state;
  const trueClass = useMemo(() => {
    if (rid) {
      console.log(featureData.trueLabel[rid]);
      return featureData.trueLabel[rid];
    } else {
      return null;
    }
  }, [rid, featureData]);
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
          <span>REGION INFORMATION {trueClass}</span>
          <Button
            style={{ color: "white" }}
            type="link"
            title="Help"
            icon={<QuestionCircleOutlined />}
          />
        </div>
        <div
          style={{
            display: "flex",
            paddingLeft: "5%",
            paddingRight: "5%",
            marginTop: "1vh",
            justifyContent: "space-between",
            fontSize: "1.2vh",
          }}
        >
          <span style={{ fontWeight: "bold" }}>Area:</span>
          <span>
            {area} km<sup>2</sup>
          </span>
        </div>
        <div
          style={{
            display: "flex",
            paddingLeft: "5%",
            paddingRight: "5%",
            marginTop: "1vh",
            justifyContent: "space-between",
            fontSize: "1.2vh",
          }}
        >
          <span style={{ fontWeight: "bold" }}>Num POI:</span>
          <span>{poi}</span>
        </div>
        <div
          style={{
            display: "flex",
            paddingLeft: "5%",
            paddingRight: "5%",
            marginTop: "1vh",
            justifyContent: "space-between",
            fontSize: "1.2vh",
          }}
        >
          <span style={{ fontWeight: "bold" }}>Class:</span>
          <span>
            {selectedClass
              ? classes.filter((v) => v.code === selectedClass)[0].name
              : "Unselected"}
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
            paddingRight: "5%",
            fontSize: "1.2vh",
          }}
        >
          <span style={{ fontWeight: "bold" }}>Add to Train Set</span>
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
          <span>TRAIN SET</span>
          <Button
            style={{ color: "white" }}
            type="link"
            title="Help"
            icon={<QuestionCircleOutlined />}
          />
        </div>
        <TrainSetChart />
      </div>
    </div>
  );
};

export default InfoView;
