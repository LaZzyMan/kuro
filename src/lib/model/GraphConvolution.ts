import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";

export interface GraphConvolutionArgs {
  units: number;
  useBias: boolean;
  name?: string;
}

export default class GraphConvolution extends tf.layers.Layer {
  units: number;
  useBias: boolean;
  kernel: any;
  bias: any;
  selfLoopWeight: any;
  selfKernel: any;

  constructor(args: GraphConvolutionArgs) {
    super(args as any);

    this.units = args.units;
    this.useBias = args.useBias;
  }

  static get className() {
    return "GraphConvolution";
  }

  computeOutputShape(inputShape: tf.Shape[]) {
    const featureShape = inputShape[0];
    const batchDim = featureShape[0];
    const outDim = featureShape[1];
    return [batchDim, outDim, this.units];
  }

  getConfig(): tf.serialization.ConfigDict {
    const base_config = super.getConfig();
    const config = {
      units: this.units,
      useBias: this.useBias,
    };
    return { ...config, ...base_config };
  }

  build(inputShape: tf.Shape[]) {
    const featShape = inputShape[0];
    const inputDim = featShape.slice(-1)[0];

    this.kernel = this.addWeight(
      this.name + "_kernel",
      [inputDim, this.units],
      undefined,
      tf.initializers.glorotUniform(null as any)
    );
    this.selfLoopWeight = this.addWeight(
      this.name + "_self_loop_weight",
      [1],
      undefined,
      tf.initializers.ones(),
      undefined,
      true
    );
    this.selfKernel = this.addWeight(
      this.name + "_self_kernel",
      [inputDim, this.units],
      undefined,
      tf.initializers.glorotUniform(null as any)
    );
    if (this.useBias) {
      this.bias = this.addWeight(
        this.name + "_bias",
        [this.units],
        undefined,
        tf.initializers.zeros()
      );
    } else {
      this.bias = null;
    }
    this.built = true;
  }

  call(inputs: tf.Tensor[], kwargs: any) {
    return tf.tidy(() => {
      let [features, A] = inputs;
      features = tf.squeeze(features, [0]);
      // 提取邻节点特征
      let h_features = tf.dot(features, this.kernel.read());
      // 提取自身节点特征
      let self_h_features = tf.dot(features, this.selfKernel.read());
      // 聚合邻节点特征
      let output = tf.dot(A, h_features);
      // 邻节点特征与自身特征加权求和
      output = tf.add(
        tf.mul(this.selfLoopWeight.read(), self_h_features),
        output
      );
      output = tf.expandDims(output, 0);
      // 加入偏置项
      if (this.bias) {
        output = tf.add(output, this.bias.read());
      }
      output = tf.relu(output);
      return output;
    });
  }
}
