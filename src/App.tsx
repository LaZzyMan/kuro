import React, { useState, useCallback } from "react";
import AppReducer from "./AppReducer";
import InfoView from "./components/InfoView";
import TrainView from "./components/TrainView";
import Layout from "./components/Layout";
import Mask from "./components/Mask";
import KuroMap from "./components/maps/KuroMap";
import LoadInfo from "./components/LoadInfo";
import Logo from "./components/Logo";
import useData from "./lib/useData";
import "./App.css";

function App() {
  const [fdStatus, fpStatus, gdStatus, gpStatus, featureData, geoJSONData] =
    useData();
  const [ridSelected, setRidSelected] = useState(null as null | number);

  const regionSelectedHandler = useCallback((rid) => {
    setRidSelected(rid);
  }, []);

  return (
    <AppReducer>
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
              <TrainView
                defaultTrainSet={featureData.defaultTrainSet}
                trueLabel={featureData.trueLabel}
              />
            }
            leftBottomView={<InfoView rid={ridSelected} />}
            rightTopView={
              <div style={{ width: "100%", height: "100%" }}>
                <KuroMap
                  data={geoJSONData}
                  featureData={featureData}
                  onSelect={regionSelectedHandler}
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
    </AppReducer>
  );
}

export default App;
