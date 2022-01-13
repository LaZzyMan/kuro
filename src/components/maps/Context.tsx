import * as React from "react";
import { MapContext } from "react-mapbox-gl";

export function withMap<Props>(
  Component: React.ForwardRefExoticComponent<
    Props & React.RefAttributes<unknown>
  >
) {
  const ComponentWithMap: React.ForwardRefRenderFunction<unknown, Props> = (
    props: Props,
    ref: any
  ) => {
    const componentRef = React.useRef(null);

    React.useImperativeHandle(ref, () => componentRef.current);

    return (
      <MapContext.Consumer>
        {() => <Component {...props} ref={componentRef} />}
      </MapContext.Consumer>
    );
  };

  return React.forwardRef<unknown, Props>(ComponentWithMap);
}
