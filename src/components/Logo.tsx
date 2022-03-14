import React, { FC, Fragment } from "react";
import { themeColor } from "../lib/util";
const Logo: FC = () => {
  return (
    <Fragment>
      <div
        style={{
          width: 0,
          height: 0,
          zIndex: 20,
          position: "absolute",
          top: 0,
          right: 0,
          borderStyle: "solid",
          borderWidth: "90px 90px 90px 90px",
          borderColor: `${themeColor} ${themeColor} transparent transparent`,
        }}
      />
      <div
        style={{
          fontWeight: 800,
          fontSize: "xx-large",
          zIndex: 21,
          position: "absolute",
          top: 0,
          right: 0,
          marginTop: "30px",
          marginRight: "10px",
          color: "white",
        }}
      >
        KURO
      </div>
    </Fragment>
  );
};
export default Logo;
