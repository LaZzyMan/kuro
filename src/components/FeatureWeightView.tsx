import React, { FC, useMemo, useCallback, useContext } from "react";
import style from "./FeatureWeightView.module.css";
import { Table, InputNumber, Button } from "antd";
import { FeatureWeight } from "../AppReducer";
import { classes, featureTypes, posColor, negColor } from "../lib/util";
import { AppContext } from "../AppReducer";
import { CloseOutlined } from "@ant-design/icons";

export interface Props {
  position: "up" | "down";
  weight: FeatureWeight[];
}

const FeatureWeightView: FC<Props> = ({ position, weight }) => {
  const { dispatch } = useContext(AppContext);
  const data = useMemo(() => {
    return weight.map((w) => ({
      weight: w,
      className: classes[w.classIndex].name,
      name: featureTypes[w.featureSetIndex][w.featureIndex],
    }));
  }, [weight]);

  const onChange = useCallback(
    (w, v) => {
      dispatch({
        type: "setWeight",
        weight: v,
        featureSetIndex: w.featureSetIndex,
        classIndex: w.classIndex,
        featureIndex: w.featureIndex,
      });
    },
    [dispatch]
  );

  const removeWeight = useCallback(
    (w) => {
      dispatch({
        type: "removeWeight",
        featureSetIndex: w.featureSetIndex,
        classIndex: w.classIndex,
        featureIndex: w.featureIndex,
      });
    },
    [dispatch]
  );

  return (
    <div
      className={style.container}
      style={{ top: position === "up" ? "-100%" : "-50%" }}
    >
      <Table
        bordered={false}
        pagination={false}
        columns={[
          {
            title: "NAME",
            dataIndex: "name",
            key: "name",
            render: (text) => <span>{text}</span>,
          },
          {
            title: "CLASS",
            dataIndex: "className",
            key: "class",
            render: (text) => <span>{text}</span>,
          },
          {
            title: "WEIGHT",
            dataIndex: "weight",
            key: "weight",
            render: (w) => (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <InputNumber
                  style={{
                    color:
                      w.weight > 0
                        ? posColor
                        : w.weight === 0
                        ? "black"
                        : negColor,
                  }}
                  step={0.1}
                  min={-1}
                  max={1}
                  defaultValue={0}
                  value={w.weight}
                  onChange={(v) => onChange(w, v)}
                />
                <Button
                  style={{ marginLeft: "8px" }}
                  icon={<CloseOutlined />}
                  size="small"
                  shape="circle"
                  type="link"
                  onClick={() => removeWeight(w)}
                />
              </div>
            ),
          },
        ]}
        dataSource={data}
      />
    </div>
  );
};

export default FeatureWeightView;
