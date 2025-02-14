import { useEffect } from "react";
import { ElementType } from "polotno/model/group-model";
import { pixelsPerSecond } from "../constants";

export const usePlayback = (
  isPlaying: boolean,
  elements: ElementType[],
  setCurrentTime: (time: number) => void,
  setIsPlaying: (isPlaying: boolean) => void,
  maxEndTime: number
) => {
  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;

    if (isPlaying) {
      intervalId = setInterval(() => {
        const pixelsPerFrame = pixelsPerSecond / 60;
        setCurrentTime((time: number) => {
          const newTime = time + pixelsPerFrame;

          if (newTime >= maxEndTime) {
            setIsPlaying(false);
            return 0;
          }
          return newTime;
        });
      }, 1000 / 60);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPlaying, elements, setCurrentTime, setIsPlaying]);
};
