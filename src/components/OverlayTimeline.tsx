"use client";
import React, { useState, useCallback } from "react";
import { useOverlayStore } from "@/shared/store/overlay";
import { useVideoStore } from "@/shared/store/video";

const OverlayTimeline: React.FC = () => {
  const { duration, setCurrentTime } = useVideoStore();
  const currentTime = useVideoStore((state) => state.currentTime);
  const [isDraggingIndicator, setIsDraggingIndicator] = useState(false);

  const overlays = useOverlayStore((state) => state.overlays);
  const updateOverlay = useOverlayStore((state) => state.updateOverlay);
  const [draggingOverlayId, setDraggingOverlayId] = useState<string | null>(
    null
  );
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [resizing, setResizing] = useState<{
    overlayId: string;
    edge: "start" | "end";
  } | null>(null);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleMouseDown = (e: React.MouseEvent, overlayId: string) => {
    setDraggingOverlayId(overlayId);
    setDragStartX(e.clientX);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!draggingOverlayId || dragStartX === null) return;

    const timelineElement = document.querySelector(".timeline-grid");
    if (!timelineElement) return;

    const rect = timelineElement.getBoundingClientRect();
    const deltaX = e.clientX - dragStartX;
    const timelineWidth = rect.width;
    const deltaTime = (deltaX / timelineWidth) * duration;

    const overlay = overlays.find((o) => o.id === draggingOverlayId);
    if (overlay) {
      const overlayDuration = overlay.endTime - overlay.startTime;
      const newStartTime = Math.max(
        0,
        Math.min(overlay.startTime + deltaTime, duration - overlayDuration)
      );
      const newEndTime = newStartTime + overlayDuration;

      updateOverlay(draggingOverlayId, {
        startTime: newStartTime,
        endTime: newEndTime,
      });
    }
  };

  const handleMouseUp = () => {
    setDraggingOverlayId(null);
    setDragStartX(null);
  };

  const handleResize = (
    overlayId: string,
    edge: "start" | "end",
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    setResizing({ overlayId, edge });
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!resizing) return;

    const timelineElement = document.querySelector(".timeline-grid");
    if (!timelineElement) return;

    const rect = timelineElement.getBoundingClientRect();
    const position = e.clientX - rect.left;
    const timelineWidth = rect.width;
    const newTime = Math.max(
      0,
      Math.min((position / timelineWidth) * duration, duration)
    );

    const overlay = overlays.find((o) => o.id === resizing.overlayId);
    if (overlay) {
      if (resizing.edge === "start") {
        updateOverlay(resizing.overlayId, {
          startTime: Math.min(newTime, overlay.endTime - 0.1),
        });
      } else {
        updateOverlay(resizing.overlayId, {
          endTime: Math.max(newTime, overlay.startTime + 0.1),
        });
      }
    }
  };

  const handleResizeEnd = () => {
    setResizing(null);
  };

  React.useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingOverlayId, dragStartX]);

  React.useEffect(() => {
    if (resizing) {
      document.addEventListener("mousemove", handleResizeMove);
      document.addEventListener("mouseup", handleResizeEnd);

      return () => {
        document.removeEventListener("mousemove", handleResizeMove);
        document.removeEventListener("mouseup", handleResizeEnd);
      };
    }
  }, [resizing]);

  const handleTimelineClick = (e: React.MouseEvent) => {
    const timelineElement = e.currentTarget as HTMLDivElement;
    const rect = timelineElement.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const newTime = (clickPosition / rect.width) * duration;
    setCurrentTime(Math.max(0, Math.min(newTime, duration)));
  };

  const handleIndicatorDragStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingIndicator(true);
  };

  const handleIndicatorDrag = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingIndicator) return;

      const timelineElement = document.querySelector(".timeline-grid");
      if (!timelineElement) return;

      const rect = timelineElement.getBoundingClientRect();
      const position = e.clientX - rect.left;
      const newTime = (position / rect.width) * duration;
      setCurrentTime(Math.max(0, Math.min(newTime, duration)));
    },
    [isDraggingIndicator, duration, setCurrentTime]
  );

  const handleIndicatorDragEnd = useCallback(() => {
    setIsDraggingIndicator(false);
  }, []);

  React.useEffect(() => {
    if (isDraggingIndicator) {
      document.addEventListener("mousemove", handleIndicatorDrag);
      document.addEventListener("mouseup", handleIndicatorDragEnd);

      return () => {
        document.removeEventListener("mousemove", handleIndicatorDrag);
        document.removeEventListener("mouseup", handleIndicatorDragEnd);
      };
    }
  }, [isDraggingIndicator, handleIndicatorDrag, handleIndicatorDragEnd]);

  return (
    <div className="p-4">
      <div className="p-4 bg-gray-800 rounded-lg">
        {/* Timeline header */}
        <div className="flex justify-between mb-2 text-gray-400 text-sm">
          <span>{formatTime(0)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Timeline grid */}
        <div
          className="relative h-[15rem] bg-gray-700 rounded timeline-grid"
          onClick={handleTimelineClick}
        >
          {/* Time markers */}
          <div className="absolute w-full h-full">
            {[...Array(Math.ceil(duration))].map((_, i) => (
              <div
                key={i}
                className="absolute h-full w-px bg-gray-600"
                style={{ left: `${(i / duration) * 100}%` }}
              />
            ))}
          </div>

          {/* Updated timeline indicator */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 cursor-ew-resize group"
            style={{
              left: `${(currentTime / duration) * 100}%`,
              transition: isDraggingIndicator ? "none" : "left 0.1s linear",
            }}
            onMouseDown={handleIndicatorDragStart}
          >
            {/* Add drag handle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-red-500 rounded-full opacity-0 group-hover:opacity-100" />
          </div>

          {/* Overlay bars */}
          {overlays.map((overlay, index) => {
            const left = (overlay.startTime / duration) * 100;
            const width =
              ((overlay.endTime - overlay.startTime) / duration) * 100;

            return (
              <div
                key={overlay.id}
                onMouseDown={(e) => handleMouseDown(e, overlay.id)}
                className={`absolute h-8 rounded cursor-move flex items-center px-2 text-xs text-white
                ${overlay.type === "text" ? "bg-blue-500" : "bg-green-500"}`}
                style={{
                  left: `${left}%`,
                  width: `${width}%`,
                  top: `${index * 40 + 10}px`,
                }}
              >
                {/* Left resize handle */}
                <div
                  className="absolute left-0 w-2 h-full cursor-ew-resize bg-white bg-opacity-20 hover:bg-opacity-40"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleResize(overlay.id, "start", e);
                  }}
                />

                {/* Overlay label */}
                <span className="truncate">
                  {overlay.type === "text" ? overlay.text : "Image"}
                </span>

                {/* Right resize handle */}
                <div
                  className="absolute right-0 w-2 h-full cursor-ew-resize bg-white bg-opacity-20 hover:bg-opacity-40"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleResize(overlay.id, "end", e);
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Timeline ruler */}
        <div className="h-6 mt-2 relative">
          {[...Array(Math.ceil(duration / 5))].map((_, i) => (
            <div
              key={i}
              className="absolute text-xs text-gray-400"
              style={{ left: `${(i * 5 * 100) / duration}%` }}
            >
              {formatTime(i * 5)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverlayTimeline;
