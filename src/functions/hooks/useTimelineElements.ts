import { calcPixelsPerSecond } from "../../shared/utils/common";
import { StoreType } from "polotno/model/store";
import { ElementType } from "polotno/model/group-model";
import { PageType } from "polotno/model/page-model";
import { config } from "../../shared/constants";
import { useLangStore } from "../../shared/zustand/language";
import { TAny } from "../../shared/types/common";
export const useTimelineElements = (
  store: StoreType,
  currentTime: number,
  isPlaying: boolean
) => {
  const currentLang = useLangStore((state: TAny) => state.selectedLang);
  const elements: ElementType[] = [];
  const videoElIds: string[] = [];

  store.pages.forEach((page: PageType) => {
    page.children.forEach((element: ElementType) => {
      const elementDuration =
        element.custom?.duration ?? element?.duration ?? config.defaultDuration;
      const elementStartTime =
        page.startTime + (element.animations?.[0]?.delay || 0);

      const elementStartAt = element.custom?.startAt ?? element?.startTime ?? 0;
      const durationInPixels =
        calcPixelsPerSecond(elementDuration, config.pixelsPerSecond) ?? 50;
      const elementEndAt = element.custom?.endAt ?? elementDuration;
      const elementWidth = element.type === "video" ? durationInPixels : 50;

      let isInRange =
        currentTime >= elementStartAt && currentTime <= elementEndAt;
      const shouldPlay = isInRange && isPlaying;

      if (
        element.custom?.type === "transcript" &&
        element.custom?.lang !== currentLang
      ) {
        isInRange = false;
      }

      const customValue = {
        ...element?.custom,
        startAt: elementStartAt,
        endAt: elementEndAt,
        width: elementWidth,
        duration: elementDuration,
      };

      const timelineElement = {
        ...element,
        id: element.id,
        name: element.name || element.id,
        pageId: page.id,
        startTime: elementStartTime,
        duration: elementDuration,
        isPlaying: shouldPlay,
        src: element?.src,
        element: element,
        custom: customValue,
        visible: isInRange,
      };

      elements.push(timelineElement);

      if (shouldPlay && element.type === "video" && !element.store.isPlaying) {
        requestAnimationFrame(() => {
          element.store.play({
            startTime: elementStartAt,
            endTime: elementDuration,
          });
        });
      }

      if (element.type === "video") {
        videoElIds.push(element.id);
        // Only allow one video element to be played at a time
        if (videoElIds.length > 1) {
          requestAnimationFrame(() => {
            store.deleteElements([element.id]);
          });
        }
      }
      if (element.visible !== isInRange) {
        requestAnimationFrame(() => {
          element.set({ visible: isInRange });
        });
      }
    });
  });

  return elements;
};
