import { useState, useRef, useEffect } from "react";
import { observer } from "mobx-react-lite";
import styled from "styled-components";
import { ContextMenu, Menu, MenuItem } from "@blueprintjs/core";

// Components
import TimelineHeader from "./TimelineHeader";
import TimelineItem from "./TimelineItem";
//Hooks
import { useTimelineElements } from "../../hooks/useTimelineElements";
import { usePlayback } from "../../hooks/usePlayback";
import { TAny } from "../../types/common";
import { StoreType } from "polotno/model/store";
import { PageType } from "polotno/model/page-model";
import { ElementType } from "polotno/model/group-model";

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
  const [currentTime, setCurrentTime] = useState(0);
  const containerRef = useRef<TAny | null>(null);
  const [isDraggingIndicator, setIsDraggingIndicator] = useState(false);
  const [trimming, setTrimming] = useState<TAny | null>(null);

  const pixelsPerSecond = 2;
  const elements = useTimelineElements(
    store,
    currentTime,
    isPlaying,
    pixelsPerSecond
  );
  const maxEndTime =
    elements.length > 0
      ? Math.max(...elements.map((el) => el.custom.endAt))
      : 0;

  useEffect(() => {
    if (!isPlaying) {
      store.pages.forEach((page: PageType) => {
        page.children.forEach((element: ElementType) => {
          if (element.type === "video") {
            element.store.stop();
          }
        });
      });
    }
  }, [isPlaying]);

  usePlayback(
    isPlaying,
    elements,
    pixelsPerSecond,
    setCurrentTime,
    setIsPlaying,
    maxEndTime
  );

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
    setCurrentTime(offsetX);
  };

  const handleIndicatorDragMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDraggingIndicator) {
      const container = containerRef.current.getBoundingClientRect();
      const newX = Math.max(0, e.clientX - container.left);
      setCurrentTime(newX);
    }
  };

  const handleIndicatorDragEnd = () => {
    setIsDraggingIndicator(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragging) {
      e.preventDefault();
      const container = containerRef.current.getBoundingClientRect();
      const newX = Math.max(0, e.clientX - container.left - dragging.offsetX);

      store.pages.forEach((page: TAny) => {
        page.children.forEach((el: TAny) => {
          if (el.id === dragging.element.id) {
            el.set({ custom: { startAt: newX, endAt: el.duration + newX } });
          }
        });
      });
    } else if (trimming) {
      const deltaX = e.clientX - trimming.startX;
      const deltaTime = deltaX / pixelsPerSecond;

      store.pages.forEach((page: TAny) => {
        page.children.forEach((el: TAny) => {
          if (el.id === trimming.element.id) {
            if (trimming.side === "left") {
              const newStartTime = Math.max(
                0,
                trimming.originalStartTime + deltaTime
              );
              const maxStartTime = trimming.originalEndTime - 1;

              el.set({
                startTime: Math.min(newStartTime, maxStartTime),
              });
            } else {
              const newEndTime = Math.min(
                1,
                trimming.originalEndTime + deltaTime
              );
              const minEndTime = trimming.originalStartTime + 1; // Minimum 1 second duration
              el.set({
                endTime: Math.max(newEndTime, minEndTime),
              });
            }
          }
        });
      });
    }
    handleIndicatorDragMove(e);
  };

  const handleMouseUp = () => {
    setDragging(null);
    handleIndicatorDragEnd();
  };

  const handleTrimStart = (
    e: React.MouseEvent<HTMLDivElement>,
    element: ElementType,
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
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const TimelineContextMenu = ({ children, element }: TAny) => {
    return (
      <ContextMenu
        content={
          <Menu>
            <MenuItem
              text="Delete"
              intent="danger"
              onClick={() => deleteElement(element.id)}
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
        currentTime={currentTime}
        pixelsPerSecond={pixelsPerSecond}
        maxTime={maxEndTime}
        handlePlayPause={handlePlayPause}
      />

      <TimelineContainer
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <TimelineIndicator style={{ left: `${currentTime}px` }}>
          <IndicatorHandle onMouseDown={handleIndicatorDragStart} />
        </TimelineIndicator>
        <TimelineRowWrapper>
          {elements.map((element, _index) => (
            <TimelineContextMenu element={element} key={element.id}>
              <TimelineItem
                element={element}
                handleDragStart={handleDragStart}
                handleTrimStart={handleTrimStart}
              />
            </TimelineContextMenu>
          ))}
        </TimelineRowWrapper>
      </TimelineContainer>
    </>
  );
});
