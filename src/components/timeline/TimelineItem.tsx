import styled from "styled-components";
import VideoFrames from "./elements/VideoFrame";
import TextElement from "./elements/TextElement";
import ImageElement from "./elements/ImageElement";
import { ElementType } from "polotno/model/group-model";

const TimelineRow = styled.div`
  position: relative;
  height: 55px;
  border-bottom: 1px solid #ddd;
`;

const Item = styled.div`
  position: absolute;
  height: 45px;
  top: 5px;
  background: #252a31;
  border-radius: 3px;
  cursor: move;
  user-select: none;
  color: white;
  font-size: 12px;
  padding: 1px;
  overflow: hidden;

  &:hover {
    background: #2b95d6;
  }
`;

const TrimHandleLeft = styled.div`
  position: absolute;
  width: 8px;
  height: 100%;
  top: 0;
  left: 0;
  cursor: w-resize;
  background: rgba(255, 255, 255, 0.2);

  &:hover {
    background: rgba(255, 255, 255, 0.4);
  }
`;

const TrimHandleRight = styled.div`
  position: absolute;
  width: 8px;
  height: 100%;
  top: 0;
  right: 0;
  cursor: e-resize;
  background: rgba(255, 255, 255, 0.2);

  &:hover {
    background: rgba(255, 255, 255, 0.4);
  }
`;

interface ElementRendererProps {
  element: ElementType;
}

const ElementRenderer = ({ element }: ElementRendererProps) => {
  switch (element.type) {
    case "video":
      return <VideoFrames src={element.src} />;
    case "text":
      return <TextElement text={element.text} />;
    case "image":
      return <ImageElement src={element.src} />;
    default:
      return "";
  }
};

interface TimelineItemProps {
  element: ElementType;
  handleDragStart: (
    e: React.MouseEvent<HTMLDivElement>,
    element: ElementType
  ) => void;
  handleTrimStart: (
    e: React.MouseEvent<HTMLDivElement>,
    element: ElementType,
    side: "left" | "right"
  ) => void;
}

const TimelineItem = ({
  element,
  handleDragStart,
  handleTrimStart,
}: TimelineItemProps) => {
  return (
    <TimelineRow key={element.id}>
      <Item
        style={{
          left: `${element.custom.startAt}px`,
          width: `${element.custom.width}px`,
        }}
        onMouseDown={(e) => {
          if (e.button === 0) {
            handleDragStart(e, element);
          }
        }}
      >
        <TrimHandleLeft
          onMouseDown={(e) => {
            if (e.button === 0) {
              handleTrimStart(e, element, "left");
            }
          }}
        />
        <ElementRenderer element={element} />
        <TrimHandleRight
          onMouseDown={(e) => {
            if (e.button === 0) {
              handleTrimStart(e, element, "right");
            }
          }}
        />
      </Item>
    </TimelineRow>
  );
};

export default TimelineItem;
