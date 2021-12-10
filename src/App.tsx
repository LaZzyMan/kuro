import React, { useState, useEffect, useCallback, useMemo } from "react";
import * as tf from "@tensorflow/tfjs";
import KuroMap from "./components/KuroMap";
import LoadInfo from "./components/LoadInfo";
import SideBox from "./components/SideBox";
import Logo from "./components/Logo";
import ToolBox from "./components/ToolBox";
import TrainTools from "./components/TrainTools";
import RegionBasicInfo from "./components/RegionBasicInfo";
import {
  loadFeatureTensor,
  loadGeoJSONData,
  FeatureTensor,
  GeoJSONData,
} from "./lib/loadData";
import "./App.css";

function App() {
  const [fdStatus, setFdStatus] = useState("process");
  const [fpStatus, setFpStatus] = useState("wait");
  const [gdStatus, setGdStatus] = useState("wait");
  const [gpStatus, setGpStatus] = useState("wait");
  const [featureTensor, setFeatureTensor] = useState({} as FeatureTensor);
  const [geoJSONData, setGeoJSONData] = useState(null as GeoJSONData | null);
  const [sideBoxStatus, setSideBoxStatus] = useState("hide" as "hide" | "show");
  const [selectRegionId, setSelectRegionId] = useState(null as number | null);
  const [trainToolsVisible, setTrainToolsVisible] = useState(false);

  const regionClickCallback = useCallback((regionId) => {
    setSideBoxStatus("show");
    setSelectRegionId(regionId);
  }, []);

  const featureSelect = useMemo(() => {
    if (!selectRegionId) return null;
    return featureTensor.inputs.map(
      (feature) =>
        tf
          .squeeze(
            tf.gather(feature, tf.tensor([selectRegionId], [1], "int32"), 1),
            [0, 1]
          )
          .arraySync() as number[]
    );
  }, [featureTensor, selectRegionId]);

  const trainToolsCloseCallback = useCallback(() => {
    setTrainToolsVisible(false);
  }, []);

  const trainToolsOpenCallback = useCallback(() => {
    setTrainToolsVisible(true);
  }, []);

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
      setFeatureTensor(ft);
      setGeoJSONData(gd);
    }
    load();
  }, []);

  return (
    <div className="App">
      <Logo />
      <LoadInfo
        fdStatus={fdStatus as any}
        fpStatus={fpStatus as any}
        gdStatus={gdStatus as any}
        gpStatus={gpStatus as any}
      >
        <div>
          <SideBox status={sideBoxStatus} regionId={selectRegionId}>
            <RegionBasicInfo regionData featureData={featureSelect} />
          </SideBox>
          <KuroMap data={geoJSONData} onRegionClick={regionClickCallback} />
          <TrainTools
            onClose={trainToolsCloseCallback}
            visible={trainToolsVisible}
          />
          <ToolBox onTrainToolsClick={trainToolsOpenCallback} />
        </div>
      </LoadInfo>
    </div>
  );
}

export default App;
