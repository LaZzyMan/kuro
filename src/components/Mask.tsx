import React, { FC, ReactElement } from "react";
import style from "./Mask.module.css";

export interface MaskProps {
  visible: boolean;
  content: ReactElement;
  children?: ReactElement;
}

const Mask: FC<MaskProps> = ({ visible, content, children }: MaskProps) => {
  return (
    <div>
      <div
        className={style.maskContainer}
        style={{ display: visible ? "block" : "none" }}
      >
        <div className={style.maskContent}>{content}</div>
      </div>
      {children}
    </div>
  );
};

export default Mask;
