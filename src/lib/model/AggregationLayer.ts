import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";

export default class AggregationLayer extends tf.layers.Layer {
  kernel: any;

  constructor(args: any) {
    super(args as any);
  }

  static get className() {
    return "AggregationLayer";
  }

  computeOutputShape(inputShape: tf.Shape[]) {
    return inputShape[0];
  }

  getConfig(): tf.serialization.ConfigDict {
    const config = super.getConfig();
    return config;
  }

  build(inputShape: tf.Shape[]) {
    const numGraph = inputShape.length;
    const numFeature = inputShape[0][2] as number;

    this.kernel = this.addWeight(
      this.name + "_pool_kernel",
      [numGraph * numFeature, numFeature],
      undefined,
      tf.initializers.glorotUniform(null as any)
    );
    this.built = true;
  }

  call(inputs: tf.Tensor[], kwargs: any) {
    return tf.tidy(() => {
      const out = tf.dot(tf.squeeze(tf.concat(inputs, 2)), this.kernel.read());
      return tf.relu(tf.expandDims(out, 0));
    });
  }
}
