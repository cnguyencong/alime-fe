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
  const [selectedId, selectShape] = useState(null);

  const checkDeselect = (e: any) => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      selectShape(null);
    }
  };

  const updateLayerElement = (newAttrs: TextElementType) => {
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
            switch (e.type) {
              case "text":
                const textEl = e as TextElementType;
                return (
                  <TextElement
                    onSelect={() => {
                      selectShape(e.id);
                    }}
                    onChange={(newAttrs: TextElementType) => {
                      updateLayerElement(newAttrs);
                    }}
                    isSelected={e.id === selectedId}
                    textEl={textEl}
                  />
                );
              default:
                return "";
            }
          })}
        </Layer>
      </Stage>
    </MainWorkspaceContainer>
  );
});
