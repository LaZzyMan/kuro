import * as React from "react";
import { withMap } from "./Context";
import { MapContext } from "react-mapbox-gl";
import ReactDOM from "react-dom";

class IControl {
  _map?: any;
  _container?: any;
  _className?: string;

  constructor(className?: string) {
    this._className = className;
  }

  onAdd(map: any) {
    this._map = map;
    this._container = document.createElement("div");
    this._container.className = this._className;
    return this._container;
  }

  getContainer() {
    return this._container;
  }

  onRemove() {
    if (this._container.parentNode)
      this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}

export interface Props {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  children?: JSX.Element | JSX.Element[] | string;
  classes?: string;
}

const Control: React.ForwardRefRenderFunction<unknown, Props> = (
  { children, position, classes }: Props,
  ref: any
) => {
  const map = React.useContext(MapContext);
  const [control] = React.useState(new IControl(classes));

  React.useImperativeHandle<unknown, any>(ref, () => ({
    getMarker: () => control,
  }));

  React.useEffect(() => {
    map!.addControl(control, position);
    return () => {
      map!.removeControl(control);
    };
  }, [map, control, position]);

  React.useEffect(() => {
    if (children) {
      ReactDOM.render(
        children as React.DOMElement<React.DOMAttributes<Element>, Element>,
        control.getContainer()
      );
    }
  }, [children, control]);

  return null;
};

export default withMap(React.forwardRef<unknown, Props>(Control));
