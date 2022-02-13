import React, { FC } from "react";
import style from "./Layout.module.css";

export interface Props {
  leftTopView: JSX.Element | JSX.Element[];
  leftBottomView: JSX.Element | JSX.Element[];
  rightTopView: JSX.Element | JSX.Element[];
  rightBottomView: JSX.Element | JSX.Element[];
}

const Layout: FC<Props> = ({
  leftTopView,
  leftBottomView,
  rightTopView,
  rightBottomView,
}) => {
  return (
    <div className={style.mainView}>
      <div className={style.leftView}>
        <div className={style.leftTopView}>{leftTopView}</div>
        <div className={style.leftBottomView}>{leftBottomView}</div>
      </div>
      <div className={style.rightView}>
        <div className={style.rightTopView}>{rightTopView}</div>
        <div className={style.rightBottomView}>{rightBottomView}</div>
      </div>
    </div>
  );
};

export default Layout;
