import * as tf from "@tensorflow/tfjs";
import centeroid from "@turf/centroid";

export interface FeatureData {
  featureLC: number[][];
  featurePOI: number[][];
  featureBuilding: number[][];
  featureMobility: number[][];
  featureRhythm: number[][];
  adjIndices: number[][];
  adjValue: number[];
  trueLabel: string[];
  defaultTrainSet: number[];
}

export interface Feature {
  lc: number[];
  poi: number[];
  building: number[];
  mobility: number[];
  rhythm: number[];
}

export interface GeoJSONData {
  region: object;
  center: number[][];
}

const featureUrls = [
  "data/featureLCRaw.bin",
  "data/featurePOIRaw.bin",
  "data/featureBuildingRaw.bin",
  "data/featureMobility.bin",
  "data/featureRhythm.bin",
  "data/adjIndices.bin",
  "data/adjValues.bin",
  "data/allOutIndices.bin",
  "data/allOutput.bin",
  "data/trainSet.bin",
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
          const featureLC = tf
            .tensor2d(new Float32Array(datas[0]), [1514, 19])
            .arraySync();
          const featurePOI = tf
            .tensor2d(new Float32Array(datas[1]), [1514, 17])
            .arraySync();
          const featureBuilding = tf
            .tensor2d(new Float32Array(datas[2]), [1514, 4])
            .arraySync();
          const featureMobility = tf
            .tensor2d(new Float32Array(datas[3]), [1514, 1514])
            .arraySync();
          const featureRhythm = tf
            .tensor2d(new Float32Array(datas[4]), [1514, 48])
            .arraySync();
          const adjIndices = tf
            .tensor2d(new Float32Array(datas[5]), [201690, 2], "int32")
            .arraySync();
          const adjValue = tf
            .tensor2d(new Float32Array(datas[6]), [1, 201690])
            .arraySync()[0];
          const allOutput = tf
            .tensor2d(new Float32Array(datas[8]), [1514, 6], "int32")
            .arraySync();
          const defaultTrainSet = Array.from(new Float32Array(datas[9]));
          const trueLabel = Array.from({ length: 1514 }, (v, i) => i).map(
            (i) => {
              const classes = ["C", "G", "M", "P", "R", "U"];
              return classes[allOutput[i].indexOf(1)];
            }
          );
          setTimeout(parseCallback, 2000);
          resolve({
            featureLC,
            featurePOI,
            featureBuilding,
            featureMobility,
            featureRhythm,
            adjIndices,
            adjValue,
            trueLabel,
            defaultTrainSet,
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
          resolve({
            region: datas[0],
            center: centers,
          });
        });
      });
  });
}
