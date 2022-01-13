import * as React from "react";
import { withMap } from "./Context";
import { MapContext } from "react-mapbox-gl";
import ReactDOM from "react-dom";
import mapboxgl from "mapbox-gl";

export interface Props {
  lngLat: [number, number];
  children?: JSX.Element | JSX.Element[] | string;
  draggable?: boolean;
  pitchAlignment?: "auto" | "map" | "viewport";
  rotationAlignment?: "auto" | "map" | "viewport";
}

const Marker: React.ForwardRefRenderFunction<unknown, Props> = (
  { children, lngLat, draggable, pitchAlignment, rotationAlignment }: Props,
  ref: any
) => {
  const map = React.useContext(MapContext);
  // @ts-ignore
  const [marker, setMarker] = React.useState(
    new mapboxgl.Marker({
      draggable,
      pitchAlignment,
      rotationAlignment,
      element: document.createElement("div"),
    })
  );

  React.useImperativeHandle<unknown, any>(ref, () => ({
    getMarker: () => marker,
  }));

  React.useEffect(() => {
    marker.setLngLat(lngLat);
    marker.addTo(map!);
    return () => {
      marker.remove();
    };
  }, []);

  React.useEffect(() => {
    if (pitchAlignment !== undefined) marker.setPitchAlignment(pitchAlignment);
  }, [pitchAlignment]);

  React.useEffect(() => {
    if (rotationAlignment !== undefined)
      marker.setRotationAlignment(rotationAlignment);
  }, [rotationAlignment]);

  React.useEffect(() => {
    if (draggable !== undefined) marker.setDraggable(draggable);
  }, [draggable]);

  React.useEffect(() => {
    marker.setLngLat(lngLat);
  }, [lngLat]);

  React.useEffect(() => {
    if (children) {
      ReactDOM.render(
        children as React.DOMElement<React.DOMAttributes<Element>, Element>,
        marker.getElement()
      );
    }
  }, [children]);

  return null;
};

export default withMap(React.forwardRef<unknown, Props>(Marker));
