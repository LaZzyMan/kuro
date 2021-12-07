import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs-backend-cpu";
import AggregationLayer from "./model/AggregationLayer";
import GatherIndices from "./model/GatherIndices";
import GraphConvolution from "./model/GraphConvolution";
import SqueezedSparseConversion from "./model/SqueezedSparseConversion";

tf.setBackend("cpu");
tf.serialization.registerClass(AggregationLayer);
tf.serialization.registerClass(GatherIndices);
tf.serialization.registerClass(GraphConvolution);
tf.serialization.registerClass(SqueezedSparseConversion);

const dataUrls = [
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

export async function loadData() {
  return new Promise((resolve, reject) => {
    Promise.all(dataUrls.map((url) => fetch(process.env.PUBLIC_URL + url)))
      .then((responses) => {
        console.log("数据下载完成.");
        return responses;
      })
      .then((responses) => {
        Promise.all(responses.map((r) => r.arrayBuffer())).then((datas) => {
          console.log("数据解析完成.");
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

export function createModel() {
  const inputLC = tf.input({ batchShape: [1, 1514, 19], name: "Input_LC" });
  const inputPOI = tf.input({ batchShape: [1, 1514, 17], name: "Input_POI" });
  const inputBuilding = tf.input({
    batchShape: [1, 1514, 4],
    name: "Input_Building",
  });
  const inputMobility = tf.input({
    batchShape: [1, 1514, 1514],
    name: "Input_Mobility",
  });
  const inputRhythm = tf.input({
    batchShape: [1, 1514, 48],
    name: "Input_Rhythm",
  });
  const inputAdjIndices = tf.input({
    batchShape: [1, null, 2],
    name: "Input_Adj_Indices",
    dtype: "int32",
  });
  const inputAdjValue = tf.input({
    batchShape: [1, null],
    name: "Input_Adj_values",
  });
  const inputOutIndices = tf.input({
    batchShape: [1, null],
    name: "Input_Out_Indices",
    dtype: "int32",
  });
  const inputs = [
    inputLC,
    inputPOI,
    inputBuilding,
    inputMobility,
    inputRhythm,
    inputAdjIndices,
    inputAdjValue,
    inputOutIndices,
  ];
  const featureInputs = [
    inputLC,
    inputPOI,
    inputBuilding,
    inputMobility,
    inputRhythm,
  ];
  const features = ["LC", "POI", "Building", "Mobility", "Rhythm"];
  const inputAdj = new SqueezedSparseConversion({ shape: 1514 }).apply(
    [inputAdjIndices, inputAdjValue],
    {}
  );
  let outputs = featureInputs.map((featureInput, i) => {
    let out = tf.layers
      .dense({
        units: 50,
        activation: "relu",
        name: "Hidden_" + features[i],
      })
      .apply(featureInput);
    out = tf.layers.dropout({ rate: 0.5 }).apply(out);
    out = new GraphConvolution({
      units: 64,
      useBias: true,
      name: "GC_" + features[i],
    }).apply([out as tf.Tensor<tf.Rank>, inputAdj as tf.Tensor<tf.Rank>]);
    return out;
  });
  let output = new AggregationLayer({ name: "Graph_Pool" }).apply(
    outputs as tf.Tensor<tf.Rank>[]
  );
  output = tf.layers.dropout({ rate: 0.5 }).apply(output);
  output = new GraphConvolution({
    units: 64,
    useBias: true,
    name: "GC_2",
  }).apply([output as tf.Tensor<tf.Rank>, inputAdj as tf.Tensor<tf.Rank>]);

  output = new GatherIndices({ batchDims: 1, name: "Gather_Indices" }).apply([
    output as tf.SymbolicTensor,
    inputOutIndices,
  ]);
  output = tf.layers
    .activation({ activation: "softmax", name: "Softmax_Activation" })
    .apply(
      tf.layers.dense({ units: 6, name: "Prediction_Score" }).apply(output)
    );

  const model = tf.model({
    inputs,
    outputs: output as tf.SymbolicTensor | tf.SymbolicTensor[],
  });

  return model;
}

export async function getDefaultTrainSet() {
  const response = await fetch(process.env.PUBLIC_URL + "data/trainSet.bin");
  const arrayBuffer = await response.arrayBuffer();
  return Array.from(new Float32Array(arrayBuffer));
}

export function trainModel(
  model: tf.LayersModel,
  inputs: tf.Tensor[],
  output: tf.Tensor,
  trainSet: number[]
) {
  let fullSet = Array.from({ length: 1514 }, (v, i) => i);
  let testSet = fullSet.filter((v) => trainSet.indexOf(v) === -1);
  let testOutInidices = inputs[7].clone();
  let testOutput = output.clone();
  testOutInidices = tf.gather(
    testOutInidices,
    tf.tensor1d(testSet, "int32"),
    1
  );
  let testInputs = inputs.slice(0, 7);
  testInputs.push(testOutInidices);
  testOutput = tf.gather(testOutput, tf.tensor1d(testSet, "int32"), 1);

  inputs[7] = tf.gather(inputs[7], tf.tensor1d(trainSet, "int32"), 1);
  output = tf.gather(output, tf.tensor1d(trainSet, "int32"), 1);

  const optimizer = tf.train.adam(0.012);
  model.compile({
    optimizer: optimizer,
    loss: "categoricalCrossentropy",
    metrics: ["accuracy"],
  });
  debugger;
  console.log(tf.getBackend());
  model.fit(inputs, output, {
    epochs: 500,
    verbose: 1,
    shuffle: true,
    yieldEvery: "auto",
    validationData: [testInputs, testOutput],
    callbacks:
      // tf.callbacks.earlyStopping({
      //   monitor: "val_acc",
      //   patience: 200,
      //   restoreBestWeights: false, // True is not supported yet.
      // }),

      {
        onTrainBegin: (logs: any) => {
          console.log("Begin training model.");
        },
        onTrainEnd: (logs: any) => {
          console.log("Train finished.");
        },
        onEpochEnd: (epoch: number, logs: any) => {
          console.log("Epoch: " + epoch);
        },
        onYield: (epoch, batch, logs) => {},
      },
  });
}
