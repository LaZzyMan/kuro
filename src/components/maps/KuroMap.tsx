import React, {
  useCallback,
  useState,
  FC,
  useEffect,
  Fragment,
  useRef,
} from "react";
import ReactMapboxGL, { MapContext } from "react-mapbox-gl";
import Marker from "./Marker";
import Control from "./Control";
import RegionLayer from "./RegionLayer";
import bbox from "@turf/bbox";
import center from "@turf/center";
import distance from "@turf/distance";
import { GeoJSONData, FeatureData } from "../../lib/loadData";
import mapboxgl from "mapbox-gl";
import {
  MenuChart,
  FeatureChart,
  FlowChart,
  TimeLineChart,
  BrushChart,
} from "../charts";
import useAdj from "../../lib/useAdj";
import style from "./KuroMap.module.css";
import { isEqual } from "lodash";

export interface KuroMapProps {
  data: GeoJSONData | null;
  featureData: FeatureData | null;
  onSelect: (rid: number) => void;
  child?: React.ReactElement;
}

const Map = ReactMapboxGL({
  logoPosition: "top-right",
  accessToken:
    "pk.eyJ1IjoiaGlkZWlubWUiLCJhIjoiY2tvam9vamNnMHd1YTJxcm16YTRpaWZocCJ9.9nhmt0tjF3aVTY6p1asRxg",
});

const KuroMap: FC<KuroMapProps> = ({
  data,
  featureData,
  onSelect,
}: KuroMapProps) => {
  const requestRef: any = useRef();
  const previousTimeRef: any = React.useRef();

  const [time, setTime] = useState(0);
  const [status, setStatus] = useState(
    "normal" as "normal" | "menu" | "detail"
  );
  const [mapInstance, setMapInstance] = useState();
  const [menuSelected, setMenuSelected] = useState(
    "lc" as "lc" | "poi" | "building" | "traj"
  );
  const [regionCenter, setRegionCenter] = useState([0, 0]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [box, setBox] = useState([0, 0, 0, 0]);
  const [rid, setRid, adjMatrix] = useAdj("ws://127.0.0.1:5000/kuro");
  const [flowData, setFlowData] = useState();
  const [brushData, setBrushData] = useState();
  const [play, setPlay] = useState(false);
  const [isBrush, setIsBrush] = useState(false);
  const [brushTime, setBrushTime] = useState({
    in: [] as number[],
    out: [] as number[],
  });
  const [chartSize, setChartSize] = useState(0);
  const [targetRids, setTargetRids] = useState(
    undefined as number[] | undefined
  );

  const animate = () => {
    const t =
      Math.floor((performance.now() - previousTimeRef.current) / 1000) % 24;
    setTime((prev) => {
      return t;
    });
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (menuSelected === "traj") {
      setPlay(true);
    } else {
      setTime(0);
      setPlay(false);
      setIsBrush(false);
    }
  }, [menuSelected]);

  useEffect(() => {
    if (play) {
      cancelAnimationFrame(requestRef.current);
      previousTimeRef.current = performance.now() - time * 1000;
      requestRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(requestRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play]);

  useEffect(() => {
    if (data) {
      const bounds = bbox(data.region as any);
      if (mapInstance) (mapInstance as any).fitBounds(bounds, { padding: 10 });
    }
  }, [data, mapInstance]);

  const regionClickHandler = useCallback(
    (feature: any) => {
      setBox(bbox(feature));
      setRegionCenter(center(feature).geometry.coordinates);
      setStatus("menu");
      setRid(feature.properties.rid);
      onSelect(feature.properties.rid);
    },
    [onSelect, setRid]
  );

  const dblClickHandler = useCallback((_, e: any) => {
    setStatus((prev) => {
      if (prev === "normal") return "normal";
      else if (prev === "menu") {
        setChartSize(0);
        setBox([0, 0, 0, 0]);
        return "normal";
      } else {
        setMenuSelected("lc");
        return "menu";
      }
    });
    e.preventDefault();
  }, []);

  const menuClickHandler = useCallback((i: number) => {
    if (i === 0) {
      setMenuSelected("lc");
    } else if (i === 1) {
      setMenuSelected("poi");
    } else if (i === 3) {
      setMenuSelected("traj");
    } else {
      // Building
    }
    setStatus("detail");
  }, []);

  const onLoad = (map: any) => {
    setMapInstance(map);
  };

  useEffect(() => {
    if (!data || !rid) return;
    const op = data.center[rid];
    const centers = data.center;
    const dMatrix = centers.map((p: any) =>
      distance(p, op, { units: "kilometers" })
    );
    const rMatrix = centers.map((p: any) => {
      let degree = -(
        (Math.atan2(p[1] - op[1], p[0] - op[0]) * 180) / Math.PI -
        90
      );
      if (degree < 0) degree += 360;
      return degree;
    });
    const inLineSeqs = adjMatrix.in.map((regions: any) => {
      const degrees = Array.from({ length: 36 }, (_, i) => {
        return { index: i, total: 0.0, regions: [] as any[] };
      });
      for (let i = 0; i < regions.length; i++) {
        if (regions[i] === 0) continue;
        const r = rMatrix[i]; // degree
        const d = dMatrix[i]; // distance
        degrees[Math.floor(r / 10)].total += regions[i];
        degrees[Math.floor(r / 10)].regions.push({
          rid: i,
          distance: d,
          degree: r,
          value: regions[i],
        });
      }
      return degrees;
    });
    const outLineSeqs = adjMatrix.out.map((regions: any) => {
      const degrees = Array.from({ length: 36 }, (_) => {
        return { total: 0.0, regions: [] as any[] };
      });
      for (let i = 0; i < regions.length; i++) {
        if (regions[i] === 0) continue;
        const r = rMatrix[i]; // degree
        const d = dMatrix[i]; // distance
        degrees[Math.floor(r / 10)].total += regions[i];
        degrees[Math.floor(r / 10)].regions.push({
          rid: i,
          distance: d,
          degree: r,
          value: regions[i],
        });
      }
      return degrees;
    });
    setFlowData({
      inLineSeqs: inLineSeqs.map((d: any) => d.map((v: any) => v.total)),
      outLineSeqs: outLineSeqs.map((d: any) => d.map((v: any) => v.total)),
    } as any);
    setBrushData({ in: inLineSeqs, out: outLineSeqs } as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adjMatrix]);

  const onPlayButtonClick = useCallback(() => {
    setPlay((prev) => !prev);
  }, []);

  const onRestartButtonClick = useCallback(() => {
    previousTimeRef.current = performance.now();
  }, []);

  const brushHandler = useCallback(({ inValue, outValue }) => {
    setPlay(false);
    setIsBrush(true);
    const times = {
      in: inValue.map((v: any) => v.index as number),
      out: outValue.map((v: any) => v.index as number),
    };
    setBrushTime((prev) => {
      if (isEqual(prev.in, times.in) && isEqual(prev.out, times.out)) {
        return prev;
      }
      return times;
    });
  }, []);

  const brushEndHandler = useCallback(() => {
    setPlay(true);
    setIsBrush(false);
  }, []);

  const brushBarHoverHandler = useCallback((rids) => {
    setTargetRids(rids);
  }, []);

  const zoomHandler = useCallback(
    (map, e) => {
      setBox((prev: any) => {
        if (!prev) return;
        const lt = map.project([prev[0], prev[1]]);
        const rb = map.project([prev[2], prev[3]]);
        const l = Math.sqrt((lt.x - rb.x) ** 2 + (lt.y - rb.y) ** 2);
        setChartSize(Math.ceil(l) * 1.5);
        return prev;
      });
    },
    [setBox, setChartSize]
  );

  return (
    <Fragment>
      <Map
        // eslint-disable-next-line react/style-prop-object
        style="mapbox://styles/hideinme/cj9ydelgj7jlo2su9opjkbjsu"
        containerStyle={{
          height: "100%",
          width: "100%",
        }}
        maxBounds={new mapboxgl.LngLatBounds([73.66, 3.86], [135.05, 53.55])}
        onDblClick={dblClickHandler}
        onStyleLoad={onLoad}
        onZoomEnd={zoomHandler}
      >
        <MapContext.Consumer>
          {(map) => (
            <Fragment>
              <RegionLayer
                data={data?.region}
                onClick={regionClickHandler}
                status={status}
                targetRids={targetRids}
              />
              <Marker
                pitchAlignment="map"
                rotationAlignment="map"
                lngLat={regionCenter as [number, number]}
              >
                {status === "menu" ? (
                  <MenuChart size={chartSize} onClick={menuClickHandler} />
                ) : status === "detail" ? (
                  menuSelected === "traj" ? (
                    isBrush ? (
                      <BrushChart
                        regionId={rid!}
                        map={map}
                        centers={data?.center}
                        data={brushData}
                        size={chartSize}
                        times={brushTime}
                        onBarHover={brushBarHoverHandler}
                      />
                    ) : (
                      <FlowChart data={flowData} size={chartSize} time={time} />
                    )
                  ) : (
                    <FeatureChart
                      data={
                        menuSelected === "lc"
                          ? featureData!.featureLC[rid!].slice(0, -1)
                          : featureData!.featurePOI[rid!].slice(0, -1)
                      }
                      size={chartSize}
                      type={menuSelected as "lc" | "poi"}
                    />
                  )
                ) : (
                  <></>
                )}
              </Marker>
              {menuSelected === "traj" ? (
                <Control position="bottom-left" classes="flow-controller">
                  <TimeLineChart
                    data={flowData}
                    size={[
                      map!.getContainer().offsetHeight * 0.25,
                      map!.getContainer().offsetWidth,
                    ]}
                    time={time}
                    onBrushEnd={brushEndHandler}
                    onBrush={brushHandler}
                  />
                </Control>
              ) : (
                <></>
              )}
            </Fragment>
          )}
        </MapContext.Consumer>
      </Map>
      {menuSelected === "traj" ? (
        <div className={style.buttonBox}>
          <button
            className={style.play}
            onClick={onPlayButtonClick}
            disabled={isBrush}
          >
            {play ? (
              <svg
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                p-id="5719"
                width="32"
                height="32"
              >
                <path
                  d="M512 1024C228.266667 1024 0 795.733333 0 512S228.266667 0 512 0s512 228.266667 512 512-228.266667 512-512 512z m0-42.666667c260.266667 0 469.333333-209.066667 469.333333-469.333333S772.266667 42.666667 512 42.666667 42.666667 251.733333 42.666667 512s209.066667 469.333333 469.333333 469.333333z m-106.666667-682.666666c12.8 0 21.333333 8.533333 21.333334 21.333333v384c0 12.8-8.533333 21.333333-21.333334 21.333333s-21.333333-8.533333-21.333333-21.333333V320c0-12.8 8.533333-21.333333 21.333333-21.333333z m213.333334 0c12.8 0 21.333333 8.533333 21.333333 21.333333v384c0 12.8-8.533333 21.333333-21.333333 21.333333s-21.333333-8.533333-21.333334-21.333333V320c0-12.8 8.533333-21.333333 21.333334-21.333333z"
                  p-id="5720"
                ></path>
              </svg>
            ) : (
              <svg
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                p-id="2256"
                width="32"
                height="32"
              >
                <path
                  d="M512 0C230.4 0 0 230.4 0 512s230.4 512 512 512 512-230.4 512-512S793.6 0 512 0z m0 981.333333C253.866667 981.333333 42.666667 770.133333 42.666667 512S253.866667 42.666667 512 42.666667s469.333333 211.2 469.333333 469.333333-211.2 469.333333-469.333333 469.333333z"
                  p-id="2257"
                ></path>
                <path
                  d="M672 441.6l-170.666667-113.066667c-57.6-38.4-106.666667-12.8-106.666666 57.6v256c0 70.4 46.933333 96 106.666666 57.6l170.666667-113.066666c57.6-42.666667 57.6-106.666667 0-145.066667z"
                  p-id="2258"
                ></path>
              </svg>
            )}
          </button>
          <button onClick={onRestartButtonClick} disabled={isBrush}>
            <svg
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="4919"
              width="32"
              height="32"
            >
              <path
                d="M365.014704 657.815846H657.084939V365.74561H365.014704V657.815846z m584.140471-146.035118c0-240.906781-197.125482-438.105353-438.105353-438.105353-240.979872 0-438.105353 197.198572-438.105354 438.105353 0 240.979872 197.125482 438.178444 438.105354 438.178444 240.979872 0 438.105353-197.198572 438.105353-438.178444zM511.634547 0.730906c281.399001 0 511.634547 230.235546 511.634547 511.634547s-230.235546 511.634547-511.634547 511.634547-511.634547-230.235546-511.634547-511.634547 230.235546-511.634547 511.634547-511.634547z"
                p-id="4920"
              ></path>
            </svg>
          </button>
        </div>
      ) : (
        <></>
      )}
    </Fragment>
  );
};

export default KuroMap;
