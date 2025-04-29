import { useCallback, useRef, useState } from "react";
import CustomTest from "./CustomTest.tsx";
import DrawnixWrapper from "./DrawnixWrapper.tsx";
import GitHubCorner from "./GitHubCorner.tsx";
import { depthFirstRecursion, PlaitBoard, PlaitElement } from "@plait/core";
import { unified } from "unified";
import remarkParse from "remark-parse";
import {
  createEmptyMind,
  createMindElement,
  getTopicSize,
  MindElement,
} from "@plait/mind";
import { buildText } from "@plait/common";

export type ActiveTestCaseIndex = number | "custom" | null;

export interface MermaidData {
  definition: string;
}

// 定义节点类型
interface TreeNode {
  id: string;
  type: string;
  children?: TreeNode[];
  depth?: number;
  value?: string;
  [key: string]: any;
}

export const getTextFromNode = (node: TreeNode) => {
  let text = "";
  const transform = (node: TreeNode) => {
    if (
      node.type === "text" ||
      node.type === "inlineCode" ||
      node.type === "code"
    ) {
      text += node.value;
      return;
    }
    if (node.type === "link") {
      text += `${node.url}`;
      return;
    }
    if (node.children && node.children.length > 0) {
      node.children.forEach((node) => {
        transform(node);
      });
    }
  };
  transform(node);
  return text;
};

export const getParentMindNode = (
  node: TreeNode,
  parentNodeMap: Record<string, MindElement>
) => {
  if (node.type === "heading") {
    const depth = node.depth as number;
    for (let i = depth - 1; i >= 0; i--) {
      if (parentNodeMap[`${i}`]) {
        return parentNodeMap[`${i}`];
      }
    }
  }
  return parentNodeMap["0"];
};

export const buildPlaitMindData = (root: TreeNode, board: PlaitBoard) => {
  const mind = createEmptyMind(board, [0, 0]);
  const parentNodeMap: Record<string, MindElement> = { "0": mind };
  let currentParent: MindElement = mind;
  const transform = (node: TreeNode, isNext = false) => {
    if (node.type === "heading") {
      const parentMindNode = getParentMindNode(node, parentNodeMap);
      const text = getTextFromNode(node);
      if (!text) {
        return;
      }
      const { width, height } = getTopicSize(false, false, buildText(text));
      const element = createMindElement(text, width, height, {});
      parentMindNode.children.push(element);
      parentNodeMap[`${node.depth}`] = element;
      currentParent = element;
    } else if (node.type === "list") {
      node.children?.forEach((node) => {
        transform(node);
      });
    } else if (node.type === "listItem") {
      if (node.children && node.children.length > 1) {
        const _currentParent = currentParent;
        node.children.forEach((node, index) => {
          transform(node, index === 0);
        });
        currentParent = _currentParent;
        return;
      }
      const text = getTextFromNode(node);
      if (!text) {
        return;
      }
      const { width, height } = getTopicSize(false, false, buildText(text));
      const element = createMindElement(text, width, height, {});
      currentParent.children.push(element);
    } else {
      const text = getTextFromNode(node);
      if (!text) {
        return;
      }
      const { width, height } = getTopicSize(false, false, buildText(text));
      const element = createMindElement(text, width, height, {});
      currentParent.children.push(element);
      if (isNext) {
        currentParent = element;
      }
    }
  };
  root.children?.forEach((node) => {
    transform(node);
  });
  return mind;
};

const App = () => {
  const boardRef = useRef<PlaitBoard | null>(null);
  const [elements, setElements] = useState<PlaitElement[]>([]);
  const handleOnChange = useCallback(async (markdown: string) => {
    const processor = unified().use(remarkParse);
    const result = processor.parse(markdown);
    console.log(result, "parse");
    const mindData = buildPlaitMindData(result as TreeNode, boardRef.current!);
    console.log(mindData, "drawnix data");
    setElements([mindData]);
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
