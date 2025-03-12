import { ContextMenu, Menu, MenuItem } from "@blueprintjs/core";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";

// Components
import TimelineHeader from "./TimelineHeader";
import TimelineItem from "./TimelineItem";

//Hooks
import { ElementType } from "polotno/model/group-model";
import { StoreType } from "polotno/model/store";
import { useTimelineElements } from "../../functions/hooks/useTimelineElements";
import { config } from "../../shared/constants";
import { TAny } from "../../shared/types/common";
import { useVideoStore } from "../../shared/zustand/video";

import TimelineRuler from "./TimelineRuler";
import {
  IndicatorHandle,
  TimelineContainer,
  TimelineIndicator,
  TimelineRowWrapper,
} from "./styles/TimelineControlStyle";

interface TimelineControlProps {
  store: StoreType;
}

export const TimelineControl = observer(({ store }: TimelineControlProps) => {
  const [dragging, setDragging] = useState<TAny | null>(null);
  const containerRef = useRef<TAny | null>(null);
  const [isDraggingIndicator, setIsDraggingIndicator] = useState(false);
  const [trimming, setTrimming] = useState<TAny | null>(null);

  const currentTimeInSec = useVideoStore((state) => state.currentTime);
  const setCurrentTime = useVideoStore((state) => state.setCurrentTime);

  // Maximize video duration to avoid playback issues
  const currentPage = store.activePage;
  currentPage.set({ duration: 99999999999999 });

  const elements = useTimelineElements(store, 0, false).filter(
    (e) => e.custom?.type !== "transcript"
  );

  const maxEndTime =
    elements.length > 0
      ? Math.max(...elements.map((el) => el.custom.endAt))
      : 0;

  const handleDragStart = (
    e: React.MouseEvent<HTMLDivElement>,
    element: ElementType
  ) => {
    if (element.type === "video") return;

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
    setCurrentTime(offsetX / config.pixelsPerSecond);
  };

  const handleIndicatorDragMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDraggingIndicator) {
      const container = containerRef.current.getBoundingClientRect();
      const newX = Math.max(0, e.clientX - container.left);
      setCurrentTime(newX / config.pixelsPerSecond);
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
      const containerRect = containerRef.current.getBoundingClientRect();
      const offsetX = e.clientX - containerRect.left;
      const newTime = Math.max(
        0,
        Math.min(trimming.originalDuration, offsetX / config.pixelsPerSecond)
      );

      function normalize(value: number, max: number): number {
        return value / max;
      }
      const scaleTime = normalize(newTime, trimming.originalDuration / 1000);

      if (trimming.side === "left") {
        element?.set({
          startTime: Math.max(scaleTime, 0),
        });
      } else {
        element?.set({
          endTime: Math.min(scaleTime, 1),
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
      originalStartTime: element?.custom?.startAt,
      originalEndTime: element?.custom?.endAt,
      originalDuration: element?.custom?.duration,
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
      <TimelineHeader currentTime={currentTimeInSec} maxTime={maxEndTime} />
      <TimelineRuler duration={maxEndTime / 1000} />
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
          {elements.map((element, _index) => (
            <TimelineContextMenu elementId={element.id} key={element.id}>
              <TimelineItem
                element={{
                  id: element.id,
                  type: element.type,
                  custom: element.custom,
                  text: element?.text,
                }}
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
