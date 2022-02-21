import React, { useReducer } from "react";
import { Params } from "./lib/useTrainModel";

export interface RegionClass {
  rid: number;
  class: "C" | "G" | "M" | "P" | "R" | "U";
}

export interface TrainInfo {
  name: string;
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
      return { ...state,
      trainList: [...state.trainList] };
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
      return { ...state };
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
