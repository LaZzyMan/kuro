import React, {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import TrainList from "./TrainList";
import style from "./TrainView.module.css";
import { InputNumber, Button, Spin, Modal, Radio } from "antd";
import useTrainModel from "../lib/useTrainModel";
import { AppContext } from "../AppReducer";
import FeatureWeightView from "./FeatureWeightView";
import _ from "lodash";

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
  const [trainStatus, epoch, params, trainResult, setTrainSet, setParams] =
    useTrainModel("ws://192.168.61.91:7325/kuro");
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
        <div className={style.paramTitle}>网络参数设置</div>
        <Spin
          spinning={trainStatus !== "initial" && trainStatus !== "finish"}
          tip={
            trainStatus === "load"
              ? "正在加载训练数据..."
              : trainStatus === "train"
              ? "正在进行训练: Epoch " + epoch + " / 500"
              : "训练完成，正在计算结果..."
          }
          wrapperClassName={style.spin}
          size="large"
        >
          <div className={style.paramContainer}>
            <span className={style.paramText}>特征提取维度</span>
            <InputNumber
              className={style.paramInput}
              step={1}
              min={10}
              max={100}
              defaultValue={50}
              onChange={(value) => {
                onParamsChange(value, "embeddingSize");
              }}
            />
          </div>
          <div className={style.paramContainer}>
            <span className={style.paramText}>No.1图卷积特征维度</span>
            <InputNumber
              className={style.paramInput}
              step={1}
              min={10}
              max={100}
              defaultValue={64}
              onChange={(value) => {
                onParamsChange(value, "gcnSize1");
              }}
            />
          </div>
          <div className={style.paramContainer}>
            <span className={style.paramText}>No.2图卷积特征维度</span>
            <InputNumber
              className={style.paramInput}
              step={1}
              min={10}
              max={100}
              defaultValue={64}
              onChange={(value) => {
                onParamsChange(value, "gcnSize2");
              }}
            />
          </div>
          <div className={style.paramContainer}>
            <span className={style.paramText}>丢弃率</span>
            <InputNumber
              className={style.paramInput}
              step={0.1}
              min={0.1}
              max={0.9}
              defaultValue={0.5}
              onChange={(value) => {
                onParamsChange(value, "dropout");
              }}
            />
          </div>
          <div className={style.paramContainer}>
            <span className={style.paramText}>学习率</span>
            <InputNumber
              className={style.paramInput}
              step={0.001}
              min={0.001}
              max={0.1}
              defaultValue={0.012}
              onChange={(value) => {
                onParamsChange(value, "lr");
              }}
            />
          </div>
          <div className={style.paramContainer}>
            <span className={style.paramText}>权重衰减率</span>
            <InputNumber
              className={style.paramInput}
              step={0.001}
              min={0.001}
              max={0.1}
              defaultValue={0.009}
              onChange={(value) => {
                onParamsChange(value, "wd");
              }}
            />
          </div>
          <div
            className={style.paramContainer}
            style={{ justifyContent: "space-around", marginTop: "10px" }}
          >
            <Button onClick={() => setShowWeight((prev) => !prev)}>
              特征权重
            </Button>
            <Button onClick={() => setModalVisible(true)}>训练集</Button>
            <Button type="primary" onClick={onTrainClick}>
              训练模型
            </Button>
          </div>
        </Spin>
      </div>
      <div className={style.trainList}>
        <div className={style.trainListTitle}>
          <span>模型训练历史</span>
        </div>
        <TrainList />
      </div>
      {showWeight && <FeatureWeightView position="up" weight={weight} />}
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
