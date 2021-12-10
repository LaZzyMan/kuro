import React, { FC } from "react";
import { Button, Popover, Menu } from "antd";
import style from "./ToolBox.module.css";
import {
  EyeFilled,
  QuestionCircleFilled,
  DashboardFilled,
} from "@ant-design/icons";

export interface ToolBoxProps {
  onTrainToolsClick: (e: any) => void;
}

const ToolBox: FC<ToolBoxProps> = ({ onTrainToolsClick }: ToolBoxProps) => {
  return (
    <div className={style.toolBox}>
      <Popover
        placement="right"
        title={"切换地图显示"}
        content={
          <Menu>
            <Menu.Item>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.antgroup.com"
              >
                基础显示视图
              </a>
            </Menu.Item>
            <Menu.Item>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.aliyun.com"
              >
                分类结果视图
              </a>
            </Menu.Item>
            <Menu.Item>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.luohanacademy.com"
              >
                准确度视图
              </a>
            </Menu.Item>
          </Menu>
        }
        trigger="click"
      >
        <Button
          className={style.toolButton}
          shape="circle"
          icon={<EyeFilled />}
        />
      </Popover>

      <Button
        className={style.toolButton}
        shape="circle"
        icon={<DashboardFilled />}
        onClick={onTrainToolsClick}
      />
      <Button
        className={style.toolButton}
        shape="circle"
        icon={<QuestionCircleFilled />}
      />
    </div>
  );
};

export default ToolBox;
