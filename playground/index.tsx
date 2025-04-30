import { useCallback, useRef, useState } from "react";
import CustomTest from "./CustomTest.tsx";
import DrawnixWrapper from "./DrawnixWrapper.tsx";
import GitHubCorner from "./GitHubCorner.tsx";
import { PlaitBoard, PlaitElement } from "@plait/core";
import { parseMarkdownToDrawnix } from "../src/index.ts";

const App = () => {
  const boardRef = useRef<PlaitBoard | null>(null);
  const [elements, setElements] = useState<PlaitElement[]>([]);
  const handleOnChange = useCallback(async (markdown: string) => {
    const mind = parseMarkdownToDrawnix(markdown);
    mind.points = [[0, 0]];
    console.log(mind);
    setElements([mind]);
  }, []);

  return (
    <>
      <div style={{ width: "50%", display: "flex" }}>
        <section id="custom-test">
          <CustomTest onChange={handleOnChange} />
        </section>
        <GitHubCorner />
      </div>
      <div id="drawnix">
        <DrawnixWrapper
          elements={elements}
          afterInit={(board: PlaitBoard) => {
            boardRef.current = board;
          }}
        />
      </div>
    </>
  );
};

export default App;
