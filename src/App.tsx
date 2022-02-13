import React, { useState, useCallback } from "react";
import Layout from "./components/Layout";
import Mask from "./components/Mask";
import KuroMap from "./components/maps/KuroMap";
import LoadInfo from "./components/LoadInfo";
import Logo from "./components/Logo";
import ToolBox from "./components/ToolBox";
import TrainTools from "./components/TrainTools";
import useData from "./lib/useData";
import "./App.css";

function App() {
  const [trainToolsVisible, setTrainToolsVisible] = useState(false);
  const [fdStatus, fpStatus, gdStatus, gpStatus, featureData, geoJSONData] =
    useData();

  const trainToolsCloseCallback = useCallback(() => {
    setTrainToolsVisible(false);
  }, []);

  const trainToolsOpenCallback = useCallback(() => {
    setTrainToolsVisible(true);
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
        <Layout
          leftTopView={
            <div
              style={{
                height: "100%",
                display: "flex",
                color: "white",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "x-large",
                fontWeight: 700,
              }}
            >
              <span>Train View</span>
            </div>
          }
          leftBottomView={
            <div
              style={{
                height: "100%",
                display: "flex",
                color: "white",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "x-large",
                fontWeight: 700,
              }}
            >
              <span>Info View</span>
            </div>
          }
          rightTopView={
            <div style={{ width: "100%", height: "100%" }}>
              <KuroMap
                data={geoJSONData}
                featureData={featureData}
                onSelect={(feature) => {}}
              />
              <ToolBox onTrainToolsClick={trainToolsOpenCallback} />
              <TrainTools
                onClose={trainToolsCloseCallback}
                visible={trainToolsVisible}
                trainSet={featureData.defaultTrainSet}
              />
            </div>
          }
          rightBottomView={
            <div
              style={{
                height: "100%",
                display: "flex",
                color: "white",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "x-large",
                fontWeight: 700,
              }}
            >
              <span>Feature Attribution View</span>
            </div>
          }
        />
      </Mask>
    </div>
  );
}

export default App;
