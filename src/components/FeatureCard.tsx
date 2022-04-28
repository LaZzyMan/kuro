import React, { FC, useCallback, useContext, useMemo, useState } from "react";
import style from "./FeatureCard.module.css";
import { AppContext } from "../AppReducer";
import { Slider, Button } from "antd";
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

const features = [
  "LAND COVER",
  "POI",
  "BUILDING",
  "TAXI MOBILITY",
  "TAXI RHYTHM",
];

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
  const [showRegion, setShowRegion] = useState(false);
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

  const onPosClick = useCallback(() => {
    setShowRegion((prev) => {
      if (!prev) {
        dispatch({ type: "setMobilityRegionId", rid: featureIndex });
        console.log(featureIndex);
      } else {
        dispatch({ type: "setMobilityRegionId", rid: -1 });
      }
      return !prev;
    });
  }, [dispatch, featureIndex]);

  const closeHandler = useCallback(() => {
    dispatch({ type: "setMobilityRegionId", rid: -1 });
    setShowRegion(false);
    onClose();
  }, [onClose, dispatch]);

  const titleIcon = useMemo(() => {
    if (featureSetIndex === 3) {
      return showRegion
        ? `${process.env.PUBLIC_URL}icon/taxi_filled.png`
        : `${process.env.PUBLIC_URL}icon/taxi.png`;
    } else if (featureSetIndex === 0) {
      return `${process.env.PUBLIC_URL}icon/land.png`;
    } else if (featureSetIndex === 1) {
      return `${process.env.PUBLIC_URL}icon/poi.png`;
    } else if (featureSetIndex === 2) {
      return `${process.env.PUBLIC_URL}icon/building.png`;
    } else {
      return `${process.env.PUBLIC_URL}icon/building.png`;
    }
  }, [featureSetIndex, showRegion]);

  return (
    <div className={style.container}>
      <div className={style.titleContainer}>
        <div
          style={{
            display: "flex",
            alignItems: "end",
          }}
        >
          <button
            style={{
              background: "transparent",
              cursor: featureSetIndex === 3 ? "pointer" : "auto",
              overflow: "hidden",
            }}
            disabled={featureSetIndex !== 3}
            onClick={onPosClick}
          >
            <img
              style={{
                height: "30px",
                filter: "drop-shadow(30px 0 white)",
                transform: "translate(-30px, 0)",
              }}
              src={titleIcon}
              alt={"Display on Map"}
            />
          </button>
          <span className={style.title}>{`${features[featureSetIndex]}`}</span>
        </div>
        <Button
          type="link"
          shape="default"
          style={{ color: "white" }}
          icon={<CloseOutlined />}
          onClick={closeHandler}
        />
      </div>
      <div className={style.content}>
        <div className={style.row}>
          <div className={style.rowTitle}>NAME</div>
          <div>
            <strong>{name}</strong>
          </div>
        </div>
        <div className={style.row}>
          <div className={style.rowTitle}>VALUE </div>
          <div>
            <span>
              <strong>{value.toFixed(3)}</strong>
            </span>
            <span
              style={{
                color: value > meanValue ? posColor : negColor,
              }}
            >
              <strong>{`(${value - meanValue > 0 ? "+" : ""}${(
                value - meanValue
              ).toFixed(3)})`}</strong>
            </span>
          </div>
        </div>
        <div className={style.row}>
          <div className={style.rowTitle}>ATTRIBUTION </div>
          <div
            style={{
              color: attribution > 0 ? posColor : negColor,
            }}
          >
            <strong>{attribution.toFixed(3)}</strong>
          </div>
        </div>
        <div className={style.row}>
          <div className={style.rowTitle}>WEIGHT </div>

          <Slider
            className={style.paramSlider}
            min={-1}
            max={1}
            marks={{
              "-1": {
                style: { color: negColor },
                label: <strong>-1</strong>,
              },
              0: {
                style: { color: "black" },
                label: 0,
              },
              1: {
                style: { color: posColor },
                label: <strong>1</strong>,
              },
            }}
            defaultValue={0}
            value={w}
            step={0.1}
            onChange={onChange}
          />
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;
