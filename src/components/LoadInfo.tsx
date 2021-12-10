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
  children,
}: LoadInfoProps) => {
  return (
    <div>
      <div
        className={style.stepContainer}
        style={{ display: gpStatus === "finish" ? "none" : "block" }}
      >
        <div className={style.stepBox}>
          <Steps className={style.steps}>
            <Step
              status={fdStatus}
              title="下载特征数据"
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
              title="解析特征数据"
              icon={
                fpStatus === "process" ? (
                  <LoadingOutlined />
                ) : (
                  <CloudSyncOutlined />
                )
              }
            />
            <Step
              status={gdStatus}
              title="下载GeoJSON数据"
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
              title="解析GeoJSON数据"
              icon={
                gpStatus === "process" ? (
                  <LoadingOutlined />
                ) : (
                  <CloudSyncOutlined />
                )
              }
            />
          </Steps>
        </div>
      </div>
      {children}
    </div>
  );
};

export default LoadInfo;
