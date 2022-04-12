import React, {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  QuestionCircleOutlined,
  UploadOutlined,
  CiCircleOutlined,
} from "@ant-design/icons";
import TrainList from "./TrainList";
import style from "./TrainView.module.css";
import { Button, Spin, Modal, Radio, Slider } from "antd";
import useTrainModel from "../lib/useTrainModel";
import { AppContext } from "../AppReducer";
import FeatureWeightView from "./FeatureWeightView";
import _ from "lodash";
import { wsURL, uploadURL, weightO2A } from "../lib/util";

export interface Props {
  defaultTrainSet: number[];
  trueLabel: string[];
}

const TrainView: FC<Props> = ({ defaultTrainSet, trueLabel }: Props) => {
  const { state, dispatch } = useContext(AppContext);
  const { currentTrainSet, trainList, weight } = state;
  const [showWeight, setShowWeight] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [trainRadio, setTrainRadio] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [detailTrainWeight, setDetailTrainWeight] = useState(undefined as any);
  const [detailShowWeight, setDetailShowWeight] = useState(false);
  const [
    trainStatus,
    epoch,
    params,
    trainResult,
    setTrainSet,
    setParams,
    setWeights,
  ] = useTrainModel(wsURL);
  const trainSet = useMemo(() => {
    return currentTrainSet.map((v) => v.rid);
  }, [currentTrainSet]);

  const createDefaultTrainSet = useCallback(() => {
    const trainSet = defaultTrainSet.slice(
      0,
      Math.floor((defaultTrainSet.length * trainRadio) / 4)
    );
    const tmp = trainSet.map((v) => ({
      rid: v,
      class: trueLabel[v],
    }));
    dispatch({ type: "setTrainSet", trainSet: tmp });
    setModalVisible(false);
  }, [defaultTrainSet, trueLabel, dispatch, trainRadio]);

  const onTrainClick = useCallback(() => {
    setTrainSet(trainSet);
  }, [trainSet, setTrainSet]);

  const onParamsChange = useCallback(
    (value, type) => {
      setParams((prev) => {
        return {
          ...prev,
          [type]: value,
        };
      });
    },
    [setParams]
  );

  const uploadModel = useCallback(() => {
    setUploading(true);
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".zip";
    document.body.appendChild(input);
    input.addEventListener("change", async (e: any) => {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(uploadURL, { method: "POST", body: formData });
      const data = await res.json();
      console.log(data);
      setUploading(false);
    });
    input.click();
    input.remove();
  }, []);

  const trainListShowWeightHandler = useCallback((show, weight) => {
    setDetailShowWeight(show);
    setDetailTrainWeight(weight);
  }, []);

  useEffect(() => {
    setWeights(weightO2A(weight));
  }, [weight, setWeights]);

  useEffect(() => {
    if (!trainResult) return;
    console.log(trainResult);
    const date = new Date();
    dispatch({
      type: "appendTrainList",
      trainInfo: {
        name: `Train_${trainList.length}`,
        id: trainResult.id,
        params,
        trainSet: _.cloneDeep(currentTrainSet),
        result: trainResult,
        time: date.toLocaleTimeString() + ", " + date.toLocaleDateString(),
        weight,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainResult]);

  return (
    <div className={style.container}>
      <div className={style.trainParam}>
        <div className={style.paramTitle}>
          <div>MODEL PARAMETER</div>
          <Button
            style={{
              color: "white",
            }}
            className={style.help}
            type="link"
            title="Help"
            icon={<QuestionCircleOutlined />}
          />
        </div>
        <Spin
          spinning={
            (trainStatus !== "initial" && trainStatus !== "finish") || uploading
          }
          tip={
            uploading
              ? "Upload Model..."
              : trainStatus === "load"
              ? "Loading Data..."
              : trainStatus === "train"
              ? "Training: Epoch " + epoch + " / 500"
              : "Finished."
          }
          wrapperClassName={style.spin}
          size="large"
        >
          <div className={style.paramContent}>
            <div className={style.paramContainer}>
              <span className={style.paramText}>Embedding Size</span>
              <Slider
                className={style.paramSlider}
                min={10}
                max={100}
                marks={{
                  10: "",
                  100: 100,
                }}
                defaultValue={50}
                step={1}
                onChange={(value) => {
                  onParamsChange(value, "embeddingSize");
                }}
              />
            </div>
            <div className={style.paramContainer}>
              <span className={style.paramText}>No.1 GCN Layer Size</span>
              <Slider
                className={style.paramSlider}
                min={10}
                max={100}
                marks={{
                  10: "",
                  100: 100,
                }}
                defaultValue={64}
                step={1}
                onChange={(value) => {
                  onParamsChange(value, "gcnSize1");
                }}
              />
            </div>
            <div className={style.paramContainer}>
              <span className={style.paramText}>No.2 GCN Layer Size</span>
              <Slider
                className={style.paramSlider}
                min={10}
                max={100}
                marks={{
                  10: "",
                  100: 100,
                }}
                defaultValue={64}
                step={1}
                onChange={(value) => {
                  onParamsChange(value, "gcnSize2");
                }}
              />
            </div>
            <div className={style.paramContainer}>
              <span className={style.paramText}>Drop Rate</span>
              <Slider
                className={style.paramSlider}
                min={0.1}
                max={0.9}
                marks={{
                  0.1: "",
                  0.9: 0.8,
                }}
                defaultValue={0.5}
                step={0.1}
                onChange={(value) => {
                  onParamsChange(value, "dropout");
                }}
              />
            </div>
            <div className={style.paramContainer}>
              <span className={style.paramText}>Learning Rate</span>
              <Slider
                className={style.paramSlider}
                min={0.001}
                max={0.02}
                marks={{
                  0.001: "",
                  0.02: "0.02",
                }}
                defaultValue={0.012}
                step={0.001}
                onChange={(value) => {
                  onParamsChange(value, "wd");
                }}
              />
            </div>
            <div className={style.paramContainer}>
              <span className={style.paramText}>Weight Decay</span>
              <Slider
                className={style.paramSlider}
                min={0.001}
                max={0.02}
                marks={{
                  0.001: "",
                  0.02: 0.02,
                }}
                defaultValue={0.009}
                step={0.001}
                onChange={(value) => {
                  onParamsChange(value, "wd");
                }}
              />
            </div>
            <div className={style.paramContainer}>
              <span className={style.paramText}>Loss Fatcor</span>
              <Slider
                className={style.paramSlider}
                min={0.005}
                max={0.05}
                marks={{
                  0.005: "",
                  0.05: 0.05,
                }}
                defaultValue={0.01}
                step={0.005}
                onChange={(value) => {
                  onParamsChange(value, "e");
                }}
              />
            </div>
            <div
              className={style.paramContainer}
              style={{ justifyContent: "space-between" }}
            >
              <Button
                style={{
                  width: "2.5vh",
                  height: "2.5vh",
                }}
                type="primary"
                icon={<UploadOutlined />}
                onClick={uploadModel}
              />

              <Button
                className={style.paramBtn}
                type="primary"
                onClick={() => setShowWeight((prev) => !prev)}
              >
                Weight
              </Button>
              {/* <Button
                style={{
                  width: "2.5vh",
                  height: "2.5vh",
                }}
                type="primary"
                onClick={() => setModalVisible(true)}
                icon={<CiCircleOutlined />}
              /> */}
              <Button
                className={style.paramBtn}
                type="primary"
                onClick={onTrainClick}
              >
                Train Model
              </Button>
            </div>
          </div>
        </Spin>
      </div>
      <div className={style.trainList}>
        <div className={style.trainListTitle}>
          <div>TRAIN HISTORY</div>
          <Button
            style={{
              color: "white",
            }}
            type="link"
            title="Help"
            icon={<QuestionCircleOutlined />}
          />
        </div>
        <TrainList onShowWeight={trainListShowWeightHandler} />
      </div>
      {detailShowWeight ? (
        <FeatureWeightView
          position="down"
          weight={detailTrainWeight}
          editable={false}
        />
      ) : (
        showWeight && (
          <FeatureWeightView position="up" weight={weight} editable={true} />
        )
      )}
      <Modal
        visible={modalVisible}
        title={"训练集比例"}
        centered
        onCancel={() => setModalVisible(false)}
        onOk={createDefaultTrainSet}
      >
        <Radio.Group
          onChange={(e) => setTrainRadio(e.target.value)}
          value={trainRadio}
        >
          <Radio value={1}>5%</Radio>
          <Radio value={2}>10%</Radio>
          <Radio value={3}>15%</Radio>
          <Radio value={4}>20%</Radio>
        </Radio.Group>
      </Modal>
    </div>
  );
};

export default TrainView;
