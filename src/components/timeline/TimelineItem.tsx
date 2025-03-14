import VideoFrames from "./elements/VideoFrame";
import TextElement from "./elements/TextElement";
import ImageElement from "./elements/ImageElement";
import { ElementType } from "polotno/model/group-model";
import React from "react";
import {
  Item,
  TimelineRow,
  TrimHandleLeft,
  TrimHandleRight,
} from "./styles/TimelineItemStyle";

interface ElementRendererProps {
  element: ElementType;
}

const ElementRenderer = React.memo(({ element }: ElementRendererProps) => {
  switch (element.type) {
    case "video":
      return <VideoFrames id={element.id} src={element.src} />;
    case "text":
      return <TextElement text={element.text} />;
    case "image":
      return <ImageElement src={element.src} />;
    default:
      return "";
  }
});

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

const TimelineItem = React.memo(
  ({ element, handleDragStart, handleTrimStart }: TimelineItemProps) => {
    return (
      <TimelineRow key={element.id}>
        <Item
          onContextMenu={(e) => {
            e.preventDefault();
            window.store.selectElements([element.id]);
          }}
          onBlur={() => {
            window.store.selectElements([""]);
          }}
          style={{
            left: `${element.custom?.offsetLeft}px`,
            width: `${element.custom?.width}px`,
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
  }
);

export default TimelineItem;
