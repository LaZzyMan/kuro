import React, { FC, ReactElement } from "react";
import { Steps } from "antd";
import style from "./LoadInfo.module.css";
import {
  CloudDownloadOutlined,
  CloudSyncOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

export interface LoadInfoProps {
  fdStatus: "wait" | "process" | "finish" | "error";
  fpStatus: "wait" | "process" | "finish" | "error";
  gdStatus: "wait" | "process" | "finish" | "error";
  gpStatus: "wait" | "process" | "finish" | "error";
  children?: ReactElement;
}
const { Step } = Steps;

const LoadInfo: FC<LoadInfoProps> = ({
  fdStatus,
  fpStatus,
  gdStatus,
  gpStatus,
}: LoadInfoProps) => {
  return (
    <div className={style.stepBox}>
      <Steps className={style.steps}>
        <Step
          status={fdStatus}
          title="Download Feature"
          icon={
            fdStatus === "process" ? (
              <LoadingOutlined />
            ) : (
              <CloudDownloadOutlined />
            )
          }
        />
        <Step
          status={fpStatus}
          title="Parse Feature"
          icon={
            fpStatus === "process" ? <LoadingOutlined /> : <CloudSyncOutlined />
          }
        />
        <Step
          status={gdStatus}
          title="Download GeoJSON"
          icon={
            gdStatus === "process" ? (
              <LoadingOutlined />
            ) : (
              <CloudDownloadOutlined />
            )
          }
        />
        <Step
          status={gpStatus}
          title="Parse GeoJSON"
          icon={
            gpStatus === "process" ? <LoadingOutlined /> : <CloudSyncOutlined />
          }
        />
      </Steps>
    </div>
  );
};

export default LoadInfo;
