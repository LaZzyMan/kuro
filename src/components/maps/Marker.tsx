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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!marker) return;
    if (pitchAlignment !== undefined) marker.setPitchAlignment(pitchAlignment);
  }, [pitchAlignment, marker]);

  React.useEffect(() => {
    if (!marker) return;

    if (rotationAlignment !== undefined)
      marker.setRotationAlignment(rotationAlignment);
  }, [rotationAlignment, marker]);

  React.useEffect(() => {
    if (!marker) return;

    if (draggable !== undefined) marker.setDraggable(draggable);
  }, [draggable, marker]);

  React.useEffect(() => {
    if (!marker) return;

    marker.setLngLat(lngLat);
  }, [lngLat, marker]);

  React.useEffect(() => {
    if (!marker) return;

    if (children) {
      ReactDOM.render(
        children as React.DOMElement<React.DOMAttributes<Element>, Element>,
        marker.getElement()
      );
    }
  }, [children, marker]);

  return null;
};

export default withMap(React.forwardRef<unknown, Props>(Marker));
