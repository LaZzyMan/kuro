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

const DragHandle = SortableHandle(() => (
  <div className={style.handle} title="更改顺序" />
));
const SortableItem = SortableElement(({ value, detail, onDetailClick }) => {
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
        height: detail ? "100%" : "20%",
      }}
    >
      <div className={style.item} style={{ height: detail ? "20%" : "100%" }}>
        <DragHandle />
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
          value.name
        )}
        <div className={style.itemButtonArea}>
          <Button
            type="link"
            title="查看详细参数"
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
            title="编辑名称"
            icon={edit ? <SaveOutlined /> : <EditOutlined />}
            onClick={() => {
              setEdit((prev) => {
                if (prev) saveName();
                return !prev;
              });
            }}
          />
          <Button type="link" title="下载模型" icon={<DownloadOutlined />} />
          <Button
            type="link"
            title="删除模型"
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
          <div style={{ fontWeight: "bold" }}>训练时间: </div>
          <div>{value.time}</div>
        </div>
        <div className={style.titleLine}>
          <div style={{ fontWeight: "bold" }}>训练参数: </div>
        </div>
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
        <div className={style.titleLine}>
          <div style={{ fontWeight: "bold" }}>地图显示: </div>
          <Switch
            checkedChildren="分类结果"
            unCheckedChildren="训练集"
            checked={mapDisplay}
            onChange={changeMapDisplay}
          />
        </div>
      </div>
    </div>
  );
});

const SortableList = SortableContainer(
  ({ items, detailItem, onDetailClick }) => {
    return (
      <div className={style.list}>
        {items.length === 0 ? (
          <Empty
            style={{
              marginTop: "40%",
            }}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span>暂无训练记录</span>}
          />
        ) : (
          items.map((value, index) => (
            <SortableItem
              key={`item-${value.name}`}
              index={index}
              value={value}
              detail={detailItem === value.name}
              onDetailClick={onDetailClick}
            />
          ))
        )}
      </div>
    );
  }
);

const TrainList: FC<Props> = () => {
  const { state, dispatch } = useContext(AppContext);
  const { trainList } = state;
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
    />
  );
};

export default TrainList;
