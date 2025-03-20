import VideoFrames from "./elements/VideoFrame";
import TextElement from "./elements/TextElement";
import ImageElement from "./elements/ImageElement";
import { ElementType } from "polotno/model/group-model";
import React from "react";
import {
  Item,
  ItemActionLayer,
  TimelineRow,
  TrimHandleLeft,
  TrimHandleRight,
} from "./styles/TimelineItemStyle";
import { Button } from "@blueprintjs/core";
import { config } from "../../shared/constants";
import { calcPixelsPerSecond } from "../../shared/utils/common";
import { useVideoStore } from "../../shared/zustand/video";

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
  selectedItemId: string | null;
  setSelectedItemId: (id: string | null) => void;
}

const offsetSpacing = 10; //px

const TimelineItem = React.memo(
  ({
    selectedItemId,
    element,
    setSelectedItemId,
    handleDragStart,
    handleTrimStart,
  }: TimelineItemProps) => {
    const setCurrentTime = useVideoStore((state) => state.setCurrentTime);

    const onDeleteItem = (id: string) => {
      const confirmed = confirm(
        "Are you sure you want to delete this element ?"
      );
      if (confirmed) {
        window.store.deleteElements([id]);
      }
    };

    const calItemOffsetRight = (): number => {
      const endTime = element.custom?.endAt ?? config.defaultDuration;
      const offset = calcPixelsPerSecond(endTime, config.pixelsPerSecond);
      return offset + offsetSpacing;
    };

    return (
      <TimelineRow
        key={element.id}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedItemId(null);
        }}
        className={`${selectedItemId === element.id ? "selected" : ""}`}
      >
        <Item
          className="timeline-item"
          style={{
            left: `${element.custom?.offsetLeft}px`,
            width: `${element.custom?.width}px`,
          }}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedItemId(element.id);
            setCurrentTime(element.custom?.start ?? 0);
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
        <ItemActionLayer
          style={{
            left: `${calItemOffsetRight()}px`,
          }}
          className="action-layer"
        >
          <Button
            onClick={() => window.store.selectElements([element.id])}
            icon="edit"
            intent="none"
          >
            Edit
          </Button>
          <Button
            onClick={() => onDeleteItem(element.id)}
            icon="trash"
            intent="danger"
          >
            Delete
          </Button>
        </ItemActionLayer>
      </TimelineRow>
    );
  }
);

export default TimelineItem;
