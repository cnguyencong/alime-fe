import { useState, useRef, useEffect } from "react";
import { observer } from "mobx-react-lite";
import styled from "styled-components";
import { ContextMenu, Menu, MenuItem } from "@blueprintjs/core";

// Components
import TimelineHeader from "./TimelineHeader";
import TimelineItem from "./TimelineItem";
//Hooks
import { useTimelineElements } from "../../functions/hooks/useTimelineElements";
import { TAny } from "../../shared/types/common";
import { StoreType } from "polotno/model/store";
import { ElementType } from "polotno/model/group-model";
import { config } from "../../shared/constants";

const TimelineContainer = styled.div`
  position: relative;
  width: 100%;
  background: #f5f5f5;
  border: 1px solid #ddd;
`;

const TimelineRowWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 150px;
  overflow-x: auto;
  overflow-y: auto;
`;

const TimelineIndicator = styled.div`
  position: absolute;
  top: 0;
  width: 2px;
  height: 100%;
  background-color: #ff3333;
  pointer-events: auto;
  z-index: 2;
`;

const IndicatorHandle = styled.div`
  position: absolute;
  width: 12px;
  height: 12px;
  background: #ff3333;
  border-radius: 50%;
  top: 50%;
  left: -5px;
  transform: translateY(-50%);
  cursor: ew-resize;

  &:hover {
    transform: translateY(-50%) scale(1.2);
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
  }
`;

interface TimelineControlProps {
  store: StoreType;
}

export const TimelineControl = observer(({ store }: TimelineControlProps) => {
  const [dragging, setDragging] = useState<TAny | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const containerRef = useRef<TAny | null>(null);
  const [isDraggingIndicator, setIsDraggingIndicator] = useState(false);
  const [trimming, setTrimming] = useState<TAny | null>(null);

  const currentTimeInSec = store.currentTime / 1000;

  // Maximize video duration to avoid playback issues
  const currentPage = store.activePage;
  currentPage.set({ duration: 99999999999999 });
  // const pageElements = currentPage.children.toJSON().map((el) => el.toJSON());
  // const elementIds = pageElements.map((el) => el.id);
  // console.log(elementIds);

  // const elements = [];
  const elements = useTimelineElements(store, store.currentTime, isPlaying);

  const maxEndTime =
    elements.length > 0
      ? Math.max(...elements.map((el) => el.custom.endAt))
      : 0;

  const handleDragStart = (
    e: React.MouseEvent<HTMLDivElement>,
    element: ElementType
  ) => {
    e.preventDefault();
    const container = containerRef.current.getBoundingClientRect();
    const elementX = e.clientX - container.left;

    setDragging({
      element,
      offsetX: elementX - element.custom.startAt,
    });
  };

  const handleIndicatorDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const container = containerRef.current.getBoundingClientRect();
    const offsetX = e.clientX - container.left;
    setIsDraggingIndicator(true);
    store.setCurrentTime(offsetX);
  };

  const handleIndicatorDragMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDraggingIndicator) {
      const container = containerRef.current.getBoundingClientRect();
      const newX = Math.max(0, e.clientX - container.left);
      store.setCurrentTime(newX * 100);
    }
  };

  const handleIndicatorDragEnd = () => {
    setIsDraggingIndicator(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const id = trimming?.element?.id ?? dragging?.element?.id;
    const element = store.getElementById(id) as TAny;

    if (dragging) {
      e.preventDefault();
      const container = containerRef.current.getBoundingClientRect();
      const newX = Math.max(0, e.clientX - container.left - dragging.offsetX);
      element?.set({
        custom: {
          startAt: newX,
          endAt: (element?.duration ?? config.defaultDuration) + newX,
        },
      });
    } else if (trimming) {
      const deltaX = e.clientX - trimming.startX;
      const deltaTime = deltaX / config.pixelsPerSecond;

      if (trimming.side === "left") {
        const newStartTime = Math.max(
          0,
          trimming.originalStartTime + deltaTime
        );
        const maxStartTime = trimming.originalEndTime - 1;

        element?.set({
          startTime: Math.min(newStartTime, maxStartTime),
        });
      } else {
        const newEndTime = Math.min(1, trimming.originalEndTime + deltaTime);
        const minEndTime = trimming.originalStartTime + 1; // Minimum 1 second duration
        element?.set({
          endTime: Math.max(newEndTime, minEndTime),
        });
      }
    }
    handleIndicatorDragMove(e);
  };

  const handleMouseUp = () => {
    setDragging(null);
    handleIndicatorDragEnd();
  };

  const handleTrimStart = (
    e: React.MouseEvent<HTMLDivElement>,
    element: TAny,
    side: "left" | "right"
  ) => {
    e.stopPropagation();
    setTrimming({
      element,
      side,
      startX: e.clientX,
      originalStartTime: element.startTime,
      originalEndTime: element.endTime,
      originalDuration: element.duration,
    });
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setDragging(null);
      setTrimming(null);
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);

    if (store.currentTime > 0) {
      store.stop();
    }
  };

  const TimelineContextMenu = ({ children, elementId }: TAny) => {
    return (
      <ContextMenu
        content={
          <Menu>
            <MenuItem
              text="Delete"
              intent="danger"
              onClick={() => deleteElement(elementId)}
            />
          </Menu>
        }
      >
        {children}
      </ContextMenu>
    );
  };

  const deleteElement = (elementId: string) => {
    store.deleteElements([elementId]);
  };

  return (
    <>
      <TimelineHeader
        isPlaying={isPlaying}
        currentTime={currentTimeInSec}
        maxTime={maxEndTime}
        handlePlayPause={handlePlayPause}
      />

      <TimelineContainer
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <TimelineIndicator
          style={{ left: `${currentTimeInSec * config.pixelsPerSecond}px` }}
        >
          <IndicatorHandle onMouseDown={handleIndicatorDragStart} />
        </TimelineIndicator>
        <TimelineRowWrapper>
          {elements.map((element, _index) =>
            element.custom?.type !== "transcript" ? (
              <TimelineContextMenu elementId={element.id} key={element.id}>
                <TimelineItem
                  element={{
                    id: element.id,
                    type: element.type,
                    custom: element.custom,
                    // src: element.src, // Laggy
                    text: element.text,
                  }}
                  handleDragStart={handleDragStart}
                  handleTrimStart={handleTrimStart}
                />
              </TimelineContextMenu>
            ) : null
          )}
        </TimelineRowWrapper>
      </TimelineContainer>
    </>
  );
});
