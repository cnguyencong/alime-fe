import { observer } from "mobx-react-lite";
import { StoreType } from "polotno/model/store";
import { useVideoElement } from "../../functions/hooks/useVideoElement";
import VideoCanvas from "./VideoCanvas";
import styled from "styled-components";
import { useTimelineElements } from "../../functions/hooks/useTimelineElements";
import { useVideoStore } from "../../shared/zustand/video";
import { TextElementType } from "polotno/model/text-model";
import { TextElement } from "./elements/TextElement";

import { Stage, Layer } from "react-konva";
import { useState } from "react";
import ImageElement from "./elements/ImageElement";
import { ImageElementType } from "polotno/model/image-model";
import { ElementType } from "polotno/model/group-model";

interface TimelineControlProps {
  store: StoreType;
}

const MainWorkspaceContainer = styled.div<{ $width: number; $height: number }>`
  position: relative;
  margin: 0 auto;
  width: ${(props) => props.$width + "px"};
  height: ${(props) => props.$height + "px"};
`;

export const MainWorkspace = observer(({ store }: TimelineControlProps) => {
  const { videoEl } = useVideoElement({ store }) as any;
  const currentTime = useVideoStore((state) => state.currentTime);
  const { width, height } = store;

  const isPlaying = useVideoStore((state) => state.isPlaying);
  const visibleElements = useTimelineElements(
    store,
    currentTime * 1000,
    isPlaying
  ).filter((e) => e.visible && e.type !== "video");

  // Konva
  const [selectedId, setSelectedId] = useState(null);

  const checkDeselect = (e: any) => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedId(null);
    }
  };

  const updateLayerElement = (newAttrs: ElementType) => {
    const currentEl = store.getElementById(newAttrs.id);
    currentEl?.set({ ...newAttrs });
  };

  return (
    <MainWorkspaceContainer $width={width} $height={height}>
      {videoEl?.src && (
        <VideoCanvas
          currentTime={currentTime}
          width={width}
          height={height}
          src={videoEl?.src}
          trimStartTime={videoEl.startTime}
          trimEndTime={videoEl.endTime}
        />
      )}
      <Stage
        width={width}
        height={height}
        onMouseDown={checkDeselect}
        onTouchStart={checkDeselect}
        style={{ position: "absolute", left: "0", top: "0" }}
      >
        <Layer>
          {visibleElements.map((e) => {
            if (e.type === "text") {
              return (
                <TextElement
                  key={e.id}
                  onSelect={() => {
                    setSelectedId(e.id);
                  }}
                  onChange={(newAttrs: TextElementType) => {
                    updateLayerElement(newAttrs);
                  }}
                  isSelected={e.id === selectedId}
                  textEl={e as TextElementType}
                />
              );
            } else if (e.type === "image") {
              return (
                <ImageElement
                  key={e.id}
                  onSelect={() => {
                    setSelectedId(e.id);
                  }}
                  onChange={(newAttrs: ImageElementType) => {
                    updateLayerElement(newAttrs);
                  }}
                  isSelected={e.id === selectedId}
                  imageEl={e as ImageElementType}
                />
              );
            } else {
              return "";
            }
          })}
        </Layer>
      </Stage>
    </MainWorkspaceContainer>
  );
});
