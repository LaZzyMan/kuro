import Marker from "./Marker";
import React, { FC, Fragment, useEffect } from "react";
import style from "./BuildingMarker.module.css";

export interface Props {
  data: number[];
  box: number[];
}

const BuildingMarker: FC<Props> = ({ data, box }: Props) => {
  useEffect(() => {
    console.log(data);
  }, [data]);
  return (
    <Fragment>
      <Marker
        lngLat={[box[0], box[1]]}
        pitchAlignment={"viewport"}
        rotationAlignment={"viewport"}
        anchor={"top"}
      >
        <div
          className={style.container}
          title={"Percentage of Landscape of Buildings."}
        >{`PLAND: ${data[0].toFixed(3)}`}</div>
      </Marker>
      <Marker
        lngLat={[box[0], box[3]]}
        pitchAlignment={"viewport"}
        rotationAlignment={"viewport"}
        anchor={"bottom"}
      >
        <div
          className={style.container}
          title={"Landscape Shape Index of Buildings."}
        >{`BLSI: ${data[1].toFixed(3)}`}</div>
      </Marker>
      <Marker
        lngLat={[box[2], box[1]]}
        pitchAlignment={"viewport"}
        rotationAlignment={"viewport"}
        anchor={"top"}
      >
        <div
          className={style.container}
          title={"Mean of Building Floors."}
        >{`Floor Mean: ${data[2].toFixed(3)}`}</div>
      </Marker>
      <Marker
        lngLat={[box[2], box[3]]}
        pitchAlignment={"viewport"}
        rotationAlignment={"viewport"}
        anchor={"bottom"}
      >
        <div
          className={style.container}
          title={"Standard Deviation of Building Floors."}
        >{`Floor Std: ${data[3].toFixed(3)}`}</div>
      </Marker>
    </Fragment>
  );
};

export default BuildingMarker;
