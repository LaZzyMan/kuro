import React, { FC, useState, useEffect, useCallback } from "react";
import style from "./SideBox.module.css";
import { Empty, Button } from "antd";
import { RightOutlined, LeftOutlined } from "@ant-design/icons";

export interface SideBoxProps {
  status: "hide" | "show";
  regionId: number | undefined;
  children?: React.ReactElement;
}

const SideBox: FC<SideBoxProps> = ({
  status,
  regionId,
  children,
}: SideBoxProps) => {
  const [hide, setHide] = useState(true);
  const hideBox = useCallback(() => {
    setHide(true);
  }, []);
  const showBox = useCallback(() => {
    setHide(false);
  }, []);

  useEffect(() => {
    if (status === "hide") hideBox();
    if (status === "show") showBox();
  }, [status]);

  return (
    <div
      className={style.floatBox}
      style={{ transform: hide ? "translateX(31vw)" : "translateX(0vw)" }}
    >
      <Button
        className={style.showButton}
        style={{ display: hide ? "block" : "none" }}
        shape="circle"
        icon={<LeftOutlined />}
        onClick={showBox}
      />
      <div className={style.main}>
        <div className={style.header}>
          <div className={style.title}>
            <span className={style.mainTitle}>区域信息</span>
            <span className={style.secondTitle}>
              区域ID：{regionId ? "" + regionId : "NONE"}
            </span>
          </div>
          <Button
            className={style.hideButton}
            shape="circle"
            icon={<RightOutlined />}
            onClick={hideBox}
          />
        </div>
        <div className={style.content}>
          {regionId !== null ? (
            children
          ) : (
            <Empty
              className={style.empty}
              imageStyle={{
                height: 60,
              }}
              description={<span>暂未选择区域</span>}
            ></Empty>
          )}
        </div>
      </div>
    </div>
  );
};
export default SideBox;
