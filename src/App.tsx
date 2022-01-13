import React, { useState, useEffect, useCallback, useMemo } from "react";
import Mask from "./components/Mask";
import KuroMap from "./components/maps/KuroMap";
import LoadInfo from "./components/LoadInfo";
import SideBox from "./components/SideBox";
import Logo from "./components/Logo";
import ToolBox from "./components/ToolBox";
import TrainTools from "./components/TrainTools";
import RegionBasicInfo from "./components/RegionBasicInfo";
import {
  loadFeatureTensor,
  loadGeoJSONData,
  FeatureData,
  GeoJSONData,
} from "./lib/loadData";
import useAdj from "./lib/useAdj";
import "./App.css";

function App() {
  const [fdStatus, setFdStatus] = useState("process");
  const [fpStatus, setFpStatus] = useState("wait");
  const [gdStatus, setGdStatus] = useState("wait");
  const [gpStatus, setGpStatus] = useState("wait");
  const [featureData, setFeatureData] = useState({} as FeatureData);
  const [geoJSONData, setGeoJSONData] = useState(null as GeoJSONData | null);
  const [sideBoxStatus, setSideBoxStatus] = useState("hide" as "hide" | "show");
  const [selectRegionId, setSelectRegionId, adjMatrix] = useAdj(
    "ws://127.0.0.1:5000/kuro"
  );
  const [trainToolsVisible, setTrainToolsVisible] = useState(false);

  const featureSelect = useMemo(() => {
    if (!selectRegionId) return null;
    return {
      lc: featureData.featureLC[selectRegionId],
      poi: featureData.featurePOI[selectRegionId],
      building: featureData.featureBuilding[selectRegionId],
      mobility: featureData.featureMobility[selectRegionId],
      rhythm: featureData.featureRhythm[selectRegionId],
    };
  }, [featureData, selectRegionId]);

  const trainToolsCloseCallback = useCallback(() => {
    setTrainToolsVisible(false);
  }, []);

  const trainToolsOpenCallback = useCallback(() => {
    setTrainToolsVisible(true);
  }, []);

  useEffect(() => {
    if (!geoJSONData || !selectRegionId) return;
    const centers = geoJSONData.center;
    const op = geoJSONData.center[selectRegionId];
    const inLineSeqs = adjMatrix.in.map((regions: any) => {
      const degrees = Array.from({ length: 36 }, (_) => 0.0);
      for (let i = 0; i < regions.length; i++) {
        const dp = centers[i];
        const degree =
          (Math.atan2(dp[1] - op[1], dp[0] - op[0]) * 180) / Math.PI;
        degrees[Math.floor(degree / 10)] += regions[i];
      }
      return degrees;
    });
    const outLineSeqs = adjMatrix.out.map((regions: any) => {
      const degrees = new Array(36).map((_) => 0.0);
      for (let i = 0; i < regions.length; i++) {
        const dp = centers[i];
        let degree = (Math.atan2(dp[1] - op[1], dp[0] - op[0]) * 180) / Math.PI;
        if (degree < 0) degree += 360;
        degrees[Math.floor(degree / 10)] += regions[i];
      }
      return degrees;
    });
    console.log(inLineSeqs, outLineSeqs);
  }, [adjMatrix]);

  useEffect(() => {
    async function load() {
      const ft: any = await loadFeatureTensor(
        () => {
          setFdStatus("finish");
          setFpStatus("process");
        },

        () => {
          setFpStatus("finish");
          setGdStatus("process");
        }
      );
      const gd = await loadGeoJSONData(
        () => {
          setGdStatus("finish");
          setGpStatus("process");
        },

        () => {
          setGpStatus("finish");
        }
      );
      setFeatureData(ft);
      setGeoJSONData(gd);
    }
    load();
  }, []);

  return (
    <div className="App">
      <Logo />
      <Mask
        visible={gpStatus !== "finish"}
        content={
          <LoadInfo
            fdStatus={fdStatus as any}
            fpStatus={fpStatus as any}
            gdStatus={gdStatus as any}
            gpStatus={gpStatus as any}
          />
        }
      >
        <div>
          <SideBox status={sideBoxStatus} regionId={selectRegionId}>
            <RegionBasicInfo regionData featureData={featureSelect} />
          </SideBox>
          <KuroMap data={geoJSONData} featureData={featureData} onSelect={(feature) => {}} />
          <TrainTools
            onClose={trainToolsCloseCallback}
            visible={trainToolsVisible}
            trainSet={featureData.defaultTrainSet}
          />
          <ToolBox onTrainToolsClick={trainToolsOpenCallback} />
        </div>
      </Mask>
    </div>
  );
}

export default App;
