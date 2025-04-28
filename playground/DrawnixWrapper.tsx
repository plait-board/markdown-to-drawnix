import { useRef, useState } from "react";
import { Drawnix } from "@drawnix/drawnix";
import { PlaitBoard, PlaitElement, PlaitTheme, Viewport } from "@plait/core";

import "./../node_modules/@drawnix/drawnix/style.css";
import "./../node_modules/@drawnix/react-board/style.css";
import "./../node_modules/@drawnix/react-text/style.css";

interface DrawnixWrapperProps {
  elements: PlaitElement[];
  afterInit?: (board: PlaitBoard) => void;
}

const DrawnixWrapper = ({ elements, afterInit }: DrawnixWrapperProps) => {
  const boardRef = useRef<PlaitBoard | null>(null);

  return (
    <div className="drawnix-wrapper">
      <Drawnix
        value={elements}
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
