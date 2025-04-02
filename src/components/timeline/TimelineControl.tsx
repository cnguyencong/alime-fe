import { observer } from "mobx-react-lite";
import React, { useEffect, useRef, useState } from "react";

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

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Handle time indicator
  const wrapperRef = useRef<TAny>(null);
  const [wrapperScrollLeft, setWrapperScrollLeft] = useState(0);
  const [wrapperScrollTop, setWrapperScrollTop] = useState(0);

  const currentTimeInSec = useVideoStore((state) => state.currentTime);
  const setCurrentTime = useVideoStore((state) => state.setCurrentTime);

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

    const startAt = element?.custom?.startAt ?? 0;
    const elementStartAtInSec = startAt / 1000;

    setDragging({
      element,
      offsetX: elementX - elementStartAtInSec,
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
    e.preventDefault();
    const id = trimming?.element?.id ?? dragging?.element?.id;
    const element = store.getElementById(id) as TAny;

    const customVal = element?.custom ?? {};

    if (dragging) {
      const container = containerRef.current.getBoundingClientRect();
      const elementDuration =
        element?.duration ?? customVal?.duration ?? config.defaultDuration;
      const newX = Math.max(0, e.clientX - container.left);

      const startAtInMilisecond = (newX * 1000) / config.pixelsPerSecond;
      const endAtInMilisecond = elementDuration + startAtInMilisecond;

      // Prevent dragging element out of bound
      const endTime = Math.min(endAtInMilisecond, maxEndTime);
      const maxStartTime = endTime - elementDuration;
      const startTime = Math.min(startAtInMilisecond, maxStartTime);

      element?.set({
        custom: {
          ...customVal,
          startAt: startTime,
          endAt: endTime,
          duration: elementDuration,
          // In second unit
          start: startTime / 1000,
          end: endTime / 1000,
        },
      });
    } else if (trimming) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const offsetX = e.clientX - containerRect.left + wrapperScrollLeft;
      const newTime = Math.max(
        0,
        Math.min(trimming.originalDuration, offsetX / config.pixelsPerSecond)
      );

      function normalize(value: number, max: number): number {
        return value / max;
      }

      const scaleTime = normalize(newTime, trimming.originalDuration / 1000);
      if (trimming.type === "video") {
        if (trimming.side === "left") {
          element?.set({
            startTime: Math.max(scaleTime, 0),
          });
        } else {
          element?.set({
            endTime: Math.min(scaleTime, 1),
          });
        }
      } else {
        const timeInSec = scaleTime * trimming.originalDuration;

        if (trimming.side === "left") {
          const startTime = Math.max(timeInSec, 0);
          const endTime = trimming.originalEndTime;
          element?.set({
            custom: {
              ...customVal,
              // In milisecond unit
              startAt: startTime,
              duration: endTime - startTime,
              endAt: endTime,
              // In second unit
              start: startTime / 1000,
              end: endTime / 1000,
            },
          });
        } else {
          const startTime = trimming.originalStartTime;
          const endTime = Math.min(timeInSec, maxEndTime);
          element?.set({
            custom: {
              ...customVal,
              // In milisecond unit
              startAt: startTime,
              duration: endTime - startTime,
              endAt: endTime,
              // In second unit
              end: endTime / 1000,
              start: startTime / 1000,
            },
          });
        }
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
    // We use video duration as max scale
    const duration = maxEndTime;
    const startTime = element?.custom?.startAt ?? 0;
    const endTime = element?.custom?.endAt ?? config.defaultDuration;

    setTrimming({
      element,
      side,
      startX: e.clientX,
      originalStartTime: startTime,
      originalEndTime: endTime,
      originalDuration: duration,
      type: element.type,
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

  const handleScroll = (e: TAny) => {
    const scrollY = e.target.scrollTop;
    const scrollX = e.target.scrollLeft;
    setWrapperScrollLeft(scrollX);
    setWrapperScrollTop(scrollY);
  };

  return (
    <>
      <TimelineHeader currentTime={currentTimeInSec} maxTime={maxEndTime} />

      <TimelineContainer
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <TimelineRowWrapper ref={wrapperRef} onScroll={handleScroll}>
          {elements.length > 0 && (
            <TimelineRuler duration={maxEndTime / 1000} />
          )}
          <TimelineIndicator
            style={{
              left: `${currentTimeInSec * config.pixelsPerSecond}px`,
              top: `${wrapperScrollTop}px`,
            }}
          >
            <IndicatorHandle onMouseDown={handleIndicatorDragStart} />
          </TimelineIndicator>
          {elements.map((element: TAny) => (
            <TimelineItem
              key={element.id}
              element={{
                id: element.id,
                type: element.type,
                custom: element.custom,
                text: element?.text,
                src: element?.src,
              }}
              selectedItemId={selectedItemId}
              setSelectedItemId={setSelectedItemId}
              handleDragStart={handleDragStart}
              handleTrimStart={handleTrimStart}
            />
          ))}
        </TimelineRowWrapper>
      </TimelineContainer>
    </>
  );
});
