import React, { FC } from "react";
import { Drawer, Button, Space } from "antd";
import style from "./TrainTools.module.css";

export interface TrainToolsProps {
  onClose: (e: any) => void;
  visible: boolean;
}

const TrainTools: FC<TrainToolsProps> = ({
  onClose,
  visible,
}: TrainToolsProps) => {
  return (
    <Drawer
      title="分类模型训练"
      placement="bottom"
      width={600}
      onClose={onClose}
      visible={visible}
      extra={
        <Space>
          <Button>初始化训练集</Button>
          <Button type="primary">训练模型</Button>
        </Space>
      }
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
        </div>
      </div>
    </Drawer>
  );
};

export default TrainTools;
