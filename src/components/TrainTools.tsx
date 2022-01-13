import React, { FC, useCallback, useEffect } from "react";
import { Drawer, Button, Space, Spin } from "antd";
import style from "./TrainTools.module.css";
import { Liquid } from "@ant-design/charts";
import { classes } from "../lib/util";
import useTrainModel from "../lib/useTrainModel";

export interface TrainToolsProps {
  onClose: (e: any) => void;
  trainSet: number[];
  visible: boolean;
}

const TrainTools: FC<TrainToolsProps> = ({
  onClose,
  visible,
  trainSet,
}: TrainToolsProps) => {
  const [trainStatus, epoch, trainResult, setTrainSet] = useTrainModel(
    "ws://127.0.0.1:5000/kuro"
  );
  const onTrainClick = useCallback(() => {
    setTrainSet(trainSet);
  }, [trainSet, setTrainSet]);

  useEffect(() => {
    console.log(trainResult);
  }, [trainResult]);

  return (
    <Drawer
      title="分类模型训练"
      placement="bottom"
      height={500}
      onClose={onClose}
      visible={visible}
      extra={
        <Space>
          <Button>初始化训练集</Button>
          <Button
            type="primary"
            disabled={trainStatus !== "initial" && trainStatus !== "finish"}
            onClick={onTrainClick}
          >
            训练模型
          </Button>
        </Space>
      }
    >
      <Spin
        spinning={trainStatus !== "initial" && trainStatus !== "finish"}
        tip={
          trainStatus === "load"
            ? "正在加载训练数据..."
            : trainStatus === "train"
            ? "正在进行训练: Epoch " + epoch + " / 500"
            : "训练完成，正在计算结果..."
        }
        wrapperClassName={style.spin}
        size="large"
      >
        <div className={style.container}>
          <div className={style.trainBox}>
            <span className={style.boxTitle}>训练历史</span>
          </div>
          <div className={style.resultBox}>
            <span className={style.boxTitle}>训练结果</span>
          </div>
          <div className={style.trainSetBox}>
            <span className={style.boxTitle}>当前训练集</span>

            <div className={style.liquidContainer}>
              {classes.map((value, index) => {
                return (
                  <div className={style.liquidItem}>
                    <Liquid
                      className={style.liquid}
                      key={value.code}
                      percent={0.25}
                      outline={{ border: 4, distance: 4 }}
                      wave={{ length: 64 }}
                      color={value.color}
                      padding={0}
                      appendPadding={0}
                      // statistic={{ content: { formatter: () => "111" } }}
                      // interactions={[{ type: "element-active" }]}
                    />
                    <div className={style.liquidTitle}>{value.name}</div>
                  </div>
                );
              })}
              <div className={style.trainHeader}>
                <div>训练集占比：{((302 * 100) / 1514).toFixed(2) + "%"}</div>
                <div>{302 + " / 1514"}</div>
              </div>
            </div>
          </div>
        </div>
      </Spin>
    </Drawer>
  );
};

export default TrainTools;
