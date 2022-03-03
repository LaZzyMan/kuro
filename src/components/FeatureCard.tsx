import React, { FC, useCallback, useContext, useMemo } from "react";
import style from "./FeatureCard.module.css";
import { AppContext } from "../AppReducer";
import { InputNumber, Button } from "antd";
import { posColor, negColor, featureTypes } from "../lib/util";
import { CloseOutlined } from "@ant-design/icons";
import _ from "lodash";

export interface Props {
  attribution: number;
  name: string | null;
  onClose: () => void;
  classIndex: number;
  featureSetIndex: number;
  rid: number | null;
}

const FeatureCard: FC<Props> = ({
  attribution,
  name,
  onClose,
  classIndex,
  rid,
  featureSetIndex,
}) => {
  const { state, dispatch } = useContext(AppContext);
  const { featureData, weight } = state;
  const featureIndex = useMemo(() => {
    return featureTypes[featureSetIndex].indexOf(name!);
  }, [featureSetIndex, name]);

  const w = useMemo(() => {
    const tmp = weight.filter(
      (v) =>
        v.featureSetIndex === featureSetIndex &&
        v.classIndex === classIndex &&
        v.featureIndex === featureIndex
    );
    if (tmp.length === 0) {
      return 0;
    } else {
      return tmp[0].weight;
    }
  }, [classIndex, featureSetIndex, featureIndex, weight]);

  const onChange = useCallback(
    (v) => {
      dispatch({
        type: "setWeight",
        weight: v,
        featureSetIndex,
        classIndex,
        featureIndex,
      });
    },
    [classIndex, dispatch, featureSetIndex, featureIndex]
  );

  const value = useMemo(() => {
    if (featureIndex === -1) return 0;
    const featureSets = [
      featureData.featureLC,
      featureData.featurePOI,
      featureData.featureBuilding,
      featureData.featureMobility,
      featureData.featureRhythm,
    ];
    const featureSet = featureSets[featureSetIndex];
    const feature = featureSet[rid!];
    return feature[featureIndex];

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featureData, rid, featureIndex]);

  const meanValue = useMemo(() => {
    if (featureIndex === -1) return 0;
    const featureSets = [
      featureData.featureLC,
      featureData.featurePOI,
      featureData.featureBuilding,
      featureData.featureMobility,
      featureData.featureRhythm,
    ];
    const featureSet = featureSets[featureSetIndex];
    const features = featureSet.map((v) => v[featureIndex]);
    return _.mean(features);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featureData, featureIndex]);

  return (
    <div className={style.container}>
      <div className={style.titleContainer}>
        <span className={style.title}>{name}</span>
        <Button
          type="dashed"
          shape="default"
          icon={<CloseOutlined />}
          onClick={onClose}
        />
      </div>
      <div className={style.content}>
        <div className={style.row}>
          <div className={style.rowTitle}>Value: </div>
          <div>
            <span>{value.toFixed(3)}</span>
            <span
              style={{
                color: value > meanValue ? posColor : negColor,
              }}
            >{`(${value - meanValue > 0 ? "+" : ""}${(
              value - meanValue
            ).toFixed(3)})`}</span>
          </div>
        </div>
        <div className={style.row}>
          <div className={style.rowTitle}>Attribution: </div>
          <div
            style={{
              color: attribution > 0 ? posColor : negColor,
            }}
          >
            {attribution.toFixed(3)}
          </div>
        </div>
        <div className={style.row}>
          <div className={style.rowTitle}>Weight: </div>
          <div>
            <InputNumber
              style={{
                color: w > 0 ? posColor : w === 0 ? "black" : negColor,
              }}
              step={0.1}
              min={-1}
              max={1}
              defaultValue={0}
              value={w}
              onChange={onChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;
