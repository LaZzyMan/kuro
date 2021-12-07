import React, { useEffect } from "react";
import KuroMap from "./components/KuroMap";
import {
  createModel,
  loadData,
  getDefaultTrainSet,
  trainModel,
} from "./components/model";
import "./App.css";

function App() {
  useEffect(() => {
    async function train() {
      const data: any = await loadData();
      const { inputs, output } = data;
      const trainSet = await getDefaultTrainSet();
      const model = createModel();
      trainModel(model, inputs, output, trainSet);
    }
    train();
  }, []);
  return (
    <div className="App">
      <KuroMap />
    </div>
  );
}

export default App;
