import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";

export interface GatherIndicesArgs {
  batchDims: number;
  axis?: number;
  name?: string;
}

export default class GatherIndices extends tf.layers.Layer {
  batchDims: number;
  axis: number;

  constructor(args: GatherIndicesArgs) {
    super(args as any);
    this.trainable = false;
    this.supportsMasking = true;
    this.batchDims = args.batchDims;
    this.axis = args.axis === undefined ? this.batchDims : args.axis;
  }

  static get className() {
    return "GatherIndices";
  }

  computeOutputShape(inputShape: tf.Shape[]) {
    const [dataShape, indicesShape] = inputShape;
    return dataShape
      .slice(0, this.axis)
      .concat(
        indicesShape.slice(this.batchDims),
        dataShape.slice(this.axis + 1)
      );
  }

  getConfig(): tf.serialization.ConfigDict {
    const config = super.getConfig();
    if (this.batchDims != null) {
      config["batchDims"] = this.batchDims;
    }
    return config;
  }

  call(inputs: tf.Tensor[], kwargs: any) {
    const [data, indices] = inputs;
    return tf.gather(data, indices, this.axis, this.batchDims);
  }
}
