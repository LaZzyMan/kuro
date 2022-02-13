import { useState, useEffect } from "react";
import {
  loadFeatureTensor,
  loadGeoJSONData,
  FeatureData,
  GeoJSONData,
} from "./loadData";

const useData = (): [
  string,
  string,
  string,
  string,
  FeatureData,
  GeoJSONData | null
] => {
  const [fdStatus, setFdStatus] = useState("process");
  const [fpStatus, setFpStatus] = useState("wait");
  const [gdStatus, setGdStatus] = useState("wait");
  const [gpStatus, setGpStatus] = useState("wait");
  const [featureData, setFeatureData] = useState({} as FeatureData);
  const [geoJSONData, setGeoJSONData] = useState(null as GeoJSONData | null);

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

  return [fdStatus, fpStatus, gdStatus, gpStatus, featureData, geoJSONData];
};

export default useData;
