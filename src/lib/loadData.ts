import centeroid from "@turf/centroid";
import { chunk } from "lodash";
import area from "@turf/area";

export interface FeatureData {
  featureLC: number[][];
  featurePOI: number[][];
  featureBuilding: number[][];
  trueLabel: string[];
  defaultTrainSet: number[];
  featureMobility: number[][];
  featureRhythm: number[][];
}

export interface Feature {
  lc: number[];
  poi: number[];
  building: number[];
}

export interface GeoJSONData {
  region: object;
  center: number[][];
}

const featureUrls = [
  "data/featureLCRaw.bin",
  "data/featurePOIRaw.bin",
  "data/featureBuildingRaw.bin",
  "data/allOutput.bin",
  "data/trainSet.bin",
  "data/featureMobility.bin",
  "data/featureRhythm.bin",
];

const geojsonUrls = ["data/region.geojson"];

export async function loadFeatureTensor(
  downloadCallback: Function,
  parseCallback: Function
): Promise<FeatureData> {
  return new Promise((resolve, reject) => {
    Promise.all(featureUrls.map((url) => fetch(process.env.PUBLIC_URL + url)))
      .then((responses) => {
        console.log("特征数据下载完成.");
        setTimeout(downloadCallback, 1000);
        return responses;
      })
      .then((responses) => {
        Promise.all(responses.map((r) => r.arrayBuffer())).then((datas) => {
          console.log("特征数据解析完成.");
          const featureLC = chunk(new Float32Array(datas[0]), 19);
          const featurePOI = chunk(new Float32Array(datas[1]), 17);
          const featureBuilding = chunk(new Float32Array(datas[2]), 4);
          const allOutput = chunk(new Float32Array(datas[3]), 6);
          const defaultTrainSet = Array.from(new Float32Array(datas[4]));
          const trueLabel = Array.from({ length: 1514 }, (v, i) => i).map(
            (i) => {
              const classes = ["C", "G", "M", "P", "R", "U"];
              return classes[allOutput[i].indexOf(1)];
            }
          );
          const featureMobility = chunk(new Float32Array(datas[5]), 1514);
          const featureRhythm = chunk(new Float32Array(datas[6]), 48);
          setTimeout(parseCallback, 2000);
          resolve({
            featureLC,
            featurePOI,
            featureBuilding,
            trueLabel,
            defaultTrainSet,
            featureMobility,
            featureRhythm,
          });
        });
      });
  });
}

export async function loadGeoJSONData(
  downloadCallback: Function,
  parseCallback: Function
): Promise<GeoJSONData> {
  return new Promise((resolve, reject) => {
    Promise.all(geojsonUrls.map((url) => fetch(process.env.PUBLIC_URL + url)))
      .then((responses) => {
        console.log("GeoJSON数据下载完成.");
        setTimeout(downloadCallback, 3000);
        return responses;
      })
      .then((responses) => {
        Promise.all(responses.map((r) => r.json())).then((datas) => {
          console.log("GeoJSON数据解析完成.");
          setTimeout(parseCallback, 4000);
          (datas[0].features as Array<any>).sort(
            (a, b) => a.properties.rid - b.properties.rid
          );
          const centers = datas[0].features.map(
            (v: any) => centeroid(v).geometry.coordinates
          );
          datas[0].features = datas[0].features.map((f) => {
            const a = area(f);
            return {
              ...f,
              properties: {
                ...f.properties,
                area: a,
              },
            };
          });
          resolve({
            region: datas[0],
            center: centers,
          });
        });
      });
  });
}
