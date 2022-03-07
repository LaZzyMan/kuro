import React, { FC, useContext, useState, useCallback } from "react";
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
import { Button, Empty, Input, Switch } from "antd";
import { AppContext } from "../AppReducer";
import style from "./TrainList.module.css";

export interface Props {}

const DragHandle = SortableHandle(({ color }) => {
  return (
    <div style={{ borderColor: color }} className={style.handle} title="Sort" />
  );
});
const SortableItem = SortableElement(
  ({ value, detail, onDetailClick, color }) => {
    const [edit, setEdit] = useState(false);
    const [newName, setNewName] = useState(value.name);
    const { dispatch } = useContext(AppContext);
    const [mapDisplay, setMapDisplay] = useState(false);

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

    return (
      <div
        style={{
          width: "100%",
          height: detail ? "85%" : "20%",
        }}
      >
        <div className={style.item} style={{ height: detail ? "20%" : "100%" }}>
          <DragHandle color={color} />
          {edit ? (
            <Input
              style={{ width: "30%", padding: 0, fontSize: "15px" }}
              maxLength={10}
              value={newName}
              onChange={(e) => {
                setNewName(e.currentTarget.value);
              }}
              onPressEnter={saveName}
            />
          ) : (
            <span style={{ fontWeight: "bold" }}>{value.name}</span>
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
            <Button type="link" title="Download" icon={<DownloadOutlined />} />
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
            paddingTop: "10px",
            paddingBottom: "10px",
          }}
        >
          <div className={style.titleLine}>
            <div style={{ fontWeight: "bold" }}>Time: </div>
            <div>{value.time}</div>
          </div>
          <div className={style.titleLine}>
            <div style={{ fontWeight: "bold" }}>Parameter: </div>
            <div className={style.paramContainer}>
              <div className={style.contentLine}>
                <div>Embedding Size = {value.params.embeddingSize}</div>
              </div>
              <div className={style.contentLine}>
                <div>Drop Rate = {value.params.dropout}</div>
              </div>
              <div className={style.contentLine}>
                <div>
                  Layer Size ={" "}
                  {`[${value.params.gcnSize1}, ${value.params.gcnSize2}]`}
                </div>
              </div>
              <div className={style.contentLine}>
                <div>Learning Rate = {value.params.lr}</div>
              </div>
              <div className={style.contentLine}>
                <div>Weight Decay = {value.params.wd}</div>
              </div>
            </div>
          </div>
          <div className={style.titleLine}>
            <div style={{ fontWeight: "bold" }}>Map Dispaly: </div>
            <Switch
              checkedChildren="Result"
              unCheckedChildren="Train Set"
              checked={mapDisplay}
              onChange={changeMapDisplay}
            />
          </div>
        </div>
      </div>
    );
  }
);

const SortableList = SortableContainer(
  ({ items, detailItem, onDetailClick, colors }) => {
    return (
      <div className={style.list}>
        {items.length === 0 ? (
          <Empty
            style={{
              marginTop: "45%",
            }}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span>No Train Data</span>}
          />
        ) : (
          items.map((value, index) => (
            <SortableItem
              key={`item-${value.name}`}
              index={index}
              value={value}
              detail={detailItem === value.name}
              onDetailClick={onDetailClick}
              color={`rgb(${colors[index][0]}, ${colors[index][1]}, ${colors[index][2]})`}
            />
          ))
        )}
      </div>
    );
  }
);

const TrainList: FC<Props> = () => {
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
      colors={colorArray}
    />
  );
};

export default TrainList;
