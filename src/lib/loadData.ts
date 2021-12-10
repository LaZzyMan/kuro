import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs-backend-cpu";

export interface FeatureTensor {
  inputs: tf.Tensor[];
  output: tf.Tensor;
}

export interface GeoJSONData {
  region: object;
}

const featureUrls = [
  "data/featureLC.bin",
  "data/featurePOI.bin",
  "data/featureBuilding.bin",
  "data/featureMobility.bin",
  "data/featureRhythm.bin",
  "data/adjIndices.bin",
  "data/adjValues.bin",
  "data/allOutIndices.bin",
  "data/allOutput.bin",
];

const geojsonUrls = ["data/region.geojson"];

export async function loadFeatureTensor(
  downloadCallback: Function,
  parseCallback: Function
): Promise<FeatureTensor> {
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
          const featureLC = tf.tensor3d(
            new Float32Array(datas[0]),
            [1, 1514, 19]
          );
          const featurePOI = tf.tensor3d(
            new Float32Array(datas[1]),
            [1, 1514, 17]
          );
          const featureBuilding = tf.tensor3d(
            new Float32Array(datas[2]),
            [1, 1514, 4]
          );
          const featureMobility = tf.tensor3d(
            new Float32Array(datas[3]),
            [1, 1514, 1514]
          );
          const featureRhythm = tf.tensor3d(
            new Float32Array(datas[4]),
            [1, 1514, 48]
          );
          const adjIndices = tf.tensor3d(
            new Float32Array(datas[5]),
            [1, 201690, 2],
            "int32"
          );
          const adjValue = tf.tensor2d(new Float32Array(datas[6]), [1, 201690]);
          const allOutIndices = tf.tensor2d(
            new Float32Array(datas[7]),
            [1, 1514],
            "int32"
          );
          const allOutput = tf.tensor3d(
            new Float32Array(datas[8]),
            [1, 1514, 6],
            "int32"
          );
          setTimeout(parseCallback, 2000);
          resolve({
            inputs: [
              featureLC,
              featurePOI,
              featureBuilding,
              featureMobility,
              featureRhythm,
              adjIndices,
              adjValue,
              allOutIndices,
            ],
            output: allOutput,
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
          resolve({
            region: datas[0],
          });
        });
      });
  });
}
