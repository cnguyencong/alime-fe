import { calcPixelsPerSecond } from "../utils/common";
import { StoreType } from "polotno/model/store";
import { ElementType } from "polotno/model/group-model";
import { PageType } from "polotno/model/page-model";

export const useTimelineElements = (
  store: StoreType,
  currentTime: number,
  isPlaying: boolean,
  pixelsPerSecond: number
) => {
  const elements: ElementType[] = [];
  store.pages.forEach((page: PageType) => {
    page.children.forEach((element: ElementType) => {
      const elementDuration = element.duration || page.duration;
      const elementStartTime =
        page.startTime + (element.animations?.[0]?.delay || 0);

      const elementStartAt = element.custom?.startAt || elementStartTime;
      const elementEndAt =
        elementStartAt + calcPixelsPerSecond(elementDuration, pixelsPerSecond);
      const elementWidth =
        element.type === "video"
          ? calcPixelsPerSecond(elementDuration, pixelsPerSecond)
          : 50;

      const isInRange =
        currentTime >= elementStartAt && currentTime <= elementEndAt;
      const shouldPlay = isInRange && isPlaying;

      const timelineElement = {
        ...element,
        id: element.id,
        name: element.name || element.id,
        pageId: page.id,
        startTime: elementStartTime,
        duration: elementDuration,
        isPlaying: shouldPlay,
        src: element.src,
        element: element,
        custom: {
          startAt: elementStartAt,
          endAt: elementEndAt,
          width: elementWidth,
        },
        visible: isInRange,
      };

      elements.push(timelineElement);

      if (shouldPlay && element.type === "video" && !element.store.isPlaying) {
        element.store.play();
      }

      element.set({ visible: isInRange });
    });
  });

  return elements;
};
