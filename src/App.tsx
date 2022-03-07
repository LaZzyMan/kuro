import React, { useState, useCallback } from "react";
import AppReducer from "./AppReducer";
import InfoView from "./components/InfoView";
import AttributionView from "./components/AttributionView";
import TrainView from "./components/TrainView";
import Layout from "./components/Layout";
import Mask from "./components/Mask";
import KuroMap from "./components/maps/KuroMap";
import LoadInfo from "./components/LoadInfo";
import Logo from "./components/Logo";
import useData from "./lib/useData";
import "./App.less";

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
            rightBottomView={<AttributionView rid={ridSelected} />}
          />
        </Mask>
      </div>
    </AppReducer>
  );
}

export default App;
