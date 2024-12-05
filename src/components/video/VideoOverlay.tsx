"use client";
import React, { useEffect, useRef, useState } from "react";
import { useVideoStore } from "@/shared/store/video";
import Draggable from "react-draggable";
import { Overlay } from "@/shared/types/Overlay";
import { Resizable } from "re-resizable";

interface VideoOverlayProps {
  overlay: Overlay;
  containerRef: React.RefObject<HTMLDivElement>;
  onPositionChange: (
    id: string,
    position: { x: number; y: number },
    transform: { translateX: number; translateY: number }
  ) => void;
  onSizeChange: (id: string, size: { width: number; height: number }) => void;
}

const VideoOverlay: React.FC<VideoOverlayProps> = ({
  overlay,
  containerRef,
  onPositionChange,
  onSizeChange,
}) => {
  const currentTime = useVideoStore((state) => state.currentTime);
  const [isVisible, setIsVisible] = useState(false);
  const nodeRef = useRef(null);
  const imageRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setIsVisible(
      currentTime >= overlay.startTime && currentTime <= overlay.endTime
    );
  }, [currentTime, overlay.startTime, overlay.endTime]);

  const calculatePosition = () => ({
    x: overlay?.transform?.translateX ?? 0,
    y: overlay?.transform?.translateY ?? 0,
  });

  const handleDragStop = (event: any, data: { x: number; y: number }) => {
    if (!containerRef.current) return;

    const translateX = data.x;
    const translateY = data.y;

    const containerElement = document.getElementById(
      "video-canvas"
    ) as HTMLDivElement;

    // Get container dimensions
    const containerWidth = containerElement.offsetWidth;
    const containerHeight = containerElement.offsetHeight;

    // Calculate center-relative position (0.5 is center)
    const x = 0.5 + translateX / containerWidth;
    const y = 0.5 + translateY / containerHeight;

    // Clamp values between 0 and 1
    const newPosition = {
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y)),
    };

    const newTransform = {
      translateX: translateX,
      translateY: translateY,
    };

    onPositionChange(overlay.id, newPosition, newTransform);
  };

  if (!isVisible) return null;

  const containerStyle = {
    position: "absolute" as const,
    left: "50%",
    top: "50%",
    transform: `translate(-50%, -50%)`,
    cursor: "move",
    userSelect: "none" as const,
    zIndex: 20,
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      defaultPosition={calculatePosition()}
      onStop={handleDragStop}
      bounds="parent"
    >
      <div ref={nodeRef} style={containerStyle}>
        {overlay.type === "text" ? (
          <div
            style={{
              color: overlay.color || "#ffffff",
              fontSize: `${overlay.fontSize || 24}px`,
              textShadow: "2px 2px 2px rgba(0,0,0,0.5)",
            }}
          >
            {overlay.text}
          </div>
        ) : (
          <Resizable
            size={size}
            onResizeStop={(e, direction, ref, d) => {
              const newSize = {
                width: size.width + d.width,
                height: size.height + d.height,
              };
              setSize(newSize);
              onSizeChange?.(overlay.id, newSize);
            }}
            minWidth={50}
            minHeight={50}
            maxWidth={containerRef.current?.clientWidth || 500}
            maxHeight={containerRef.current?.clientHeight || 500}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imageRef}
              onClick={(e) => e.preventDefault()}
              onDrag={(e) => e.preventDefault()}
              onMouseDown={(e) => e.preventDefault()}
              onMouseUp={(e) => e.preventDefault()}
              src={overlay.image}
              alt="overlay"
              style={{
                width: "100%",
                height: "100%",
              }}
            />
          </Resizable>
        )}
      </div>
    </Draggable>
  );
};

export default VideoOverlay;
