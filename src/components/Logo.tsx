import React, { FC, Fragment } from "react";

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
          borderWidth: "80px 80px 80px 80px",
          borderColor: "#91C483 #91C483 transparent transparent",
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
        Kuro
      </div>
    </Fragment>
  );
};
export default Logo;
