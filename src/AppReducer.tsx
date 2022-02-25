import React, { useReducer } from "react";
import { Params } from "./lib/useTrainModel";
import { getRgbArray } from "./lib/util";

export interface RegionClass {
  rid: number;
  class: "C" | "G" | "M" | "P" | "R" | "U";
}

export interface TrainInfo {
  name: string;
  id: string;
  params: Params;
  trainSet: Array<RegionClass>;
  result: any;
  time: string;
}

export interface State {
  currentTrainSet: Array<RegionClass>;
  displayTrainSet: Array<RegionClass>;
  trainList: Array<TrainInfo>;
  displayMode: "trainSet" | "result";
  selectedTrainName: string | null;
  attributionCache: object[];
  colorArray: number[][];
}

const reducer = (state: State, action) => {
  switch (action.type) {
    case "setSelectedTrainName":
      return {
        ...state,
        selectedTrainName: action.name,
      };
    case "setDisplayMode":
      return {
        ...state,
        displayMode: action.displayMode,
      };
    case "setDisplayTrainSet":
      return {
        ...state,
        displayTrainSet: action.trainSet,
      };
    case "appendTrainList":
      state.trainList.unshift(action.trainInfo);
      return { ...state, trainList: [...state.trainList] };
    case "removeTrainList":
      const tList = state.trainList.filter((v) => v.name !== action.name);
      return {
        ...state,
        trainList: tList,
      };
    case "editTrainName":
      const target = state.trainList.filter(
        (v) => v.name === action.oldName
      )[0];
      target.name = action.newName;
      return { ...state, trainList: [...state.trainList] };
    case "setTrainList":
      return {
        ...state,
        trianList: action.trainList,
      };
    case "setTrainSet":
      return {
        ...state,
        currentTrainSet: action.trainSet,
      };
    case "appendTrainSet":
      state.currentTrainSet.push(action.regionClass);
      return { ...state, currentTrainSet: [...state.currentTrainSet] };
    case "removeTrainSet":
      const tmp = state.currentTrainSet.filter((v) => v.rid !== action.rid);
      return {
        ...state,
        currentTrainSet: tmp,
      };
    case "addAttributionCache":
      for (let i = 0; i < action.models.length; i++) {
        state.attributionCache[action.rid][action.models[i]] = action.result[i];
      }
      return {
        ...state,
        attributionCache: [...state.attributionCache],
      };
    default:
      return state;
  }
};

export const AppContext = React.createContext({} as any);

export const defaultValue: State = {
  currentTrainSet: [] as Array<RegionClass>,
  displayTrainSet: [] as Array<RegionClass>,
  trainList: [] as Array<TrainInfo>,
  displayMode: "trainSet",
  selectedTrainName: null,
  attributionCache: Array.from({ length: 1514 }, () => ({})),
  colorArray: getRgbArray(10),
};

const AppReducer = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, defaultValue);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppReducer;
