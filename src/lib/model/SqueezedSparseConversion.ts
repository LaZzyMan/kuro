import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";

export interface SqueezedSparseConversionArgs {
  matrixShape: number;
  axis?: number;
}

export default class SqueezedSparseConversion extends tf.layers.Layer {
  matrixShape: number;
  axis: number;

  constructor(args: SqueezedSparseConversionArgs) {
    super(args as any);
    this.trainable = false;
    this.supportsMasking = true;
    this.matrixShape = args.matrixShape;
    this.axis = args.axis === undefined ? 0 : args.axis;
  }

  static get className() {
    return "SqueezedSparseConversion";
  }

  computeOutputShape(inputShape: tf.Shape | tf.Shape[]) {
    return [this.matrixShape, this.matrixShape];
  }

  getConfig(): tf.serialization.ConfigDict {
    const config = super.getConfig();
    if (this.matrixShape != null) {
      config["matrixShape"] = this.matrixShape;
    }
    return config;
  }

  call(inputs: tf.Tensor[], kwargs: any) {
    return tf.tidy(() => {
      let indices = tf.squeeze(inputs[0], [this.axis]);
      let values = tf.squeeze(inputs[1], [this.axis]);
      if (this.dtype) {
        values = tf.cast(values, this.dtype);
      }
      const output = tf.sparseToDense(indices, values, [
        this.matrixShape,
        this.matrixShape,
      ]);
      return output;
    });
  }
}
