import React, { FC, useContext, useState, useCallback, useMemo } from "react";
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from "react-sortable-hoc";
import { arrayMoveImmutable } from "array-move";
import {
  DownloadOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { Button, Empty, Input, Switch, Spin, Select } from "antd";
import { AppContext } from "../AppReducer";
import style from "./TrainList.module.css";
import { downloadURL } from "../lib/util";

export interface Props {
  onShowWeight: (show: boolean, weight?: any) => void;
}

const DragHandle = SortableHandle(({ color }) => {
  return (
    <div style={{ borderColor: color }} className={style.handle} title="Sort" />
  );
});
const SortableItem = SortableElement(
  ({ value, detail, onDetailClick, color, onShowWeight }) => {
    const [edit, setEdit] = useState(false);
    const [newName, setNewName] = useState(value.name);
    const { state, dispatch } = useContext(AppContext);
    const [mapDisplay, setMapDisplay] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const { trainList } = state;
    const { Option } = Select;

    const otherTrainNames = useMemo(() => {
      const names = trainList
        .filter((v) => v.name !== value.name)
        .map((v) => v.name);
      names.unshift("None");
      return names;
    }, [trainList, value]);

    const saveName = useCallback(() => {
      setEdit(false);
      dispatch({ type: "editTrainName", oldName: value.name, newName });
    }, [dispatch, newName, value]);

    const remove = useCallback(() => {
      dispatch({ type: "removeTrainList", name: value.name });
    }, [dispatch, value]);

    const changeMapDisplay = useCallback(
      (e) => {
        setMapDisplay(e);
        dispatch({
          type: "setDisplayMode",
          displayMode: e ? "result" : "trainSet",
        });
      },
      [dispatch]
    );

    const selectContrast = useCallback(
      (e) => {
        console.log(e);
        dispatch({
          type: "activeContrast",
          active: e !== "None",
          ref: e === "None" ? null : e,
        });
      },
      [dispatch]
    );

    const downloadModel = useCallback(async () => {
      setDownloading(true);
      const res = await fetch(`${downloadURL}?id=${value.id}`);
      const blob = await res.blob();
      const a = document.createElement("a");
      document.body.appendChild(a);
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = `${value.name}.zip`;
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setDownloading(false);
    }, [value]);

    return (
      <div
        style={{
          width: "100%",
          height: detail ? "100%" : "20%",
        }}
      >
        <Spin
          spinning={downloading}
          tip={"Download Model..."}
          wrapperClassName={style.spin}
          size="small"
        >
          <div
            className={style.item}
            style={{ height: detail ? `${200 / 10}%` : "100%" }}
          >
            <DragHandle color={color} />
            {edit ? (
              <Input
                style={{
                  width: "30%",
                  padding: 0,
                  fontSize: "1.2vh",
                  fontWeight: "bold",
                  fontFamily: "Microsoft YaHei",
                }}
                maxLength={10}
                value={newName}
                onChange={(e) => {
                  setNewName(e.currentTarget.value);
                }}
                onPressEnter={saveName}
              />
            ) : (
              <span style={{ fontWeight: "bold", fontSize: "1.2vh" }}>
                {value.name}
              </span>
            )}
            <div className={style.itemButtonArea}>
              <Button
                type="link"
                title="Detail"
                icon={detail ? <ZoomOutOutlined /> : <ZoomInOutlined />}
                onClick={() => {
                  dispatch({
                    type: "setDisplayTrainSet",
                    trainSet: detail ? [] : value.trainSet,
                  });
                  dispatch({
                    type: "setSelectedTrainName",
                    name: detail ? null : value.name,
                  });
                  dispatch({
                    type: "setDisplayMode",
                    displayMode: "trainSet",
                  });
                  onDetailClick(detail ? null : value.name);
                  if (detail) {
                    setMapDisplay(false);
                    onShowWeight(false);
                    selectContrast("None");
                  }
                }}
              />
              <Button
                type="link"
                title="Edit Name"
                icon={edit ? <SaveOutlined /> : <EditOutlined />}
                onClick={() => {
                  setEdit((prev) => {
                    if (prev) saveName();
                    return !prev;
                  });
                }}
              />
              <Button
                type="link"
                title="Download"
                icon={<DownloadOutlined />}
                onClick={downloadModel}
              />
              <Button
                type="link"
                title="Delete"
                icon={<DeleteOutlined />}
                disabled={detail}
                onClick={remove}
              />
            </div>
          </div>
          <div
            className={style.itemDetail}
            style={{
              display: detail ? "block" : "none",
            }}
          >
            <div className={style.titleLine}>
              <div style={{ fontWeight: "bold" }}>TIME</div>
              <div>{value.time}</div>
            </div>
            <div className={style.paramTitleLine}>
              <div
                style={{
                  fontWeight: "bold",
                  textAlign: "left",
                  fontSize: "1.2vh",
                }}
              >
                PARAMETER
              </div>
              <div className={style.paramContainer}>
                <div className={style.paramContentLine}>
                  <div>Embedding Size: {value.params.embeddingSize}</div>
                  <div>Drop Rate: {value.params.dropout}</div>
                </div>
                <div className={style.paramContentLine}>
                  <div>
                    Layer Size:{" "}
                    {`[${value.params.gcnSize1}, ${value.params.gcnSize2}]`}
                  </div>
                  <div>Learning Rate: {value.params.lr}</div>
                </div>
                <div className={style.paramContentLine}>
                  <div>Weight Decay: {value.params.wd}</div>
                  <div>Loss Factor: {value.params.e}</div>
                </div>
              </div>
            </div>
            <div className={style.titleLine}>
              <div style={{ fontWeight: "bold" }}>FEATURE WEIGHT</div>
              <Switch
                checkedChildren="Show"
                unCheckedChildren="Hide"
                defaultChecked={false}
                onChange={(e) => onShowWeight(e, value.weight)}
              />
            </div>
            <div className={style.titleLine}>
              <div style={{ fontWeight: "bold" }}>COMPARISON</div>
              <Select
                defaultValue={"None"}
                bordered={true}
                onChange={selectContrast}
              >
                {otherTrainNames.map((v) => (
                  <Option key={v} value={v}>
                    {v}
                  </Option>
                ))}
              </Select>
            </div>
            <div className={style.titleLine}>
              <div style={{ fontWeight: "bold" }}>MAP DISPLAY</div>
              <Switch
                checkedChildren="Result"
                unCheckedChildren="Train Set"
                checked={mapDisplay}
                onChange={changeMapDisplay}
              />
            </div>
          </div>
        </Spin>
      </div>
    );
  }
);

const SortableList = SortableContainer(
  ({ items, detailItem, onDetailClick, colors, onShowWeight }) => {
    return (
      <div
        className={style.list}
        style={{
          backgroundColor: items.length === 0 ? "white" : "#f3f3f3",
        }}
      >
        {items.length === 0 ? (
          <Empty
            style={{
              margin: 0,
              paddingTop: "100px",
            }}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <div style={{ fontWeight: "bold" }}>No Train Record.</div>
                <div>Add regions to train set </div>
                <div>and train your model.</div>
              </div>
            }
          />
        ) : (
          items.map((value, index) => (
            <SortableItem
              key={`item-${value.name}`}
              index={index}
              value={value}
              detail={detailItem === value.name}
              onDetailClick={onDetailClick}
              onShowWeight={onShowWeight}
              color={`rgb(${colors[index][0]}, ${colors[index][1]}, ${colors[index][2]})`}
            />
          ))
        )}
      </div>
    );
  }
);

const TrainList: FC<Props> = ({ onShowWeight }) => {
  const { state, dispatch } = useContext(AppContext);
  const { trainList, colorArray } = state;
  const [detailItem, setDetailItem] = useState(null as null | string);

  const onSortEnd = ({ oldIndex, newIndex }) => {
    dispatch({
      type: "setTrainList",
      trainList: arrayMoveImmutable(trainList, oldIndex, newIndex),
    });
  };
  return (
    <SortableList
      detailItem={detailItem}
      items={trainList}
      onSortEnd={onSortEnd}
      lockAxis="y"
      useDragHandle
      onDetailClick={setDetailItem}
      onShowWeight={onShowWeight}
      colors={colorArray}
    />
  );
};

export default TrainList;
