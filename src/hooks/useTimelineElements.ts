import { calcPixelsPerSecond } from "../utils/common";
import { StoreType } from "polotno/model/store";
import { ElementType } from "polotno/model/group-model";
import { PageType } from "polotno/model/page-model";
import { pixelsPerSecond } from "../constants";
export const useTimelineElements = (
  store: StoreType,
  currentTime: number,
  isPlaying: boolean
) => {
  const elements: ElementType[] = [];
  const videoElIds: string[] = [];
  store.pages.forEach((page: PageType) => {
    page.children.forEach((element: ElementType) => {
      // store.deleteElements([element.id]);
      const elementDuration =
        element.custom?.duration ?? element.duration ?? page.duration;
      const elementStartTime =
        page.startTime + (element.animations?.[0]?.delay || 0);

      const elementStartAt = element.custom?.startAt || elementStartTime;
      const durationInPixels =
        calcPixelsPerSecond(elementDuration, pixelsPerSecond) ?? 50;
      const elementEndAt = elementStartAt + durationInPixels;
      const elementWidth = element.type === "video" ? durationInPixels : 50;

      const isInRange =
        currentTime >= elementStartAt && currentTime <= elementEndAt;
      const shouldPlay = isInRange && isPlaying;

      const customValue = {
        ...element.custom,
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
        element.store.play();
      }

      if (element.type === "video") {
        videoElIds.push(element.id);

        // Only allow one video element to be played at a time
        if (videoElIds.length > 1) {
          store.deleteElements([element.id]);
        }
      }

      element.set({ visible: isInRange });
    });
  });

  return elements;
};
