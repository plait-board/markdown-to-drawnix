import { useRef } from "react";
import { Drawnix } from "@drawnix/drawnix";
import { PlaitBoard, PlaitElement, ThemeColorMode } from "@plait/core";

import "./../node_modules/@drawnix/drawnix/index.css";
import "./../node_modules/@plait-board/react-board/index.css";
import "./../node_modules/@plait-board/react-text/index.css";

interface DrawnixWrapperProps {
  elements: PlaitElement[];
  afterInit?: (board: PlaitBoard) => void;
}

const DrawnixWrapper = ({ elements, afterInit }: DrawnixWrapperProps) => {
  const boardRef = useRef<PlaitBoard | null>(null);
  const theme = { themeColorMode: ThemeColorMode.colorful };

  return (
    <div className="drawnix-wrapper">
      <Drawnix
        value={elements}
        theme={theme}
        onChange={(value) => {}}
        afterInit={(board: PlaitBoard) => {
          boardRef.current = board;
          afterInit && afterInit(board);
        }}
      ></Drawnix>
    </div>
  );
};

export default DrawnixWrapper;
