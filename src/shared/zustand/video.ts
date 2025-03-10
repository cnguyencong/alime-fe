import { create } from "zustand";

interface VideoStoreProps {
  currentTime: number;
  startTime: number;
  isPlaying: boolean;
  setCurrentTime: (time: number) => void;
  setStartTime: (time: number) => void;
  play: () => void;
  stop: () => void;
  playRange: (startTime: number, endTime: number) => void;
}

export const useVideoStore = create<VideoStoreProps>((set, get) => ({
  isPlaying: false,
  currentTime: 0, // in seconds
  startTime: 0,
  play: () => set(() => ({ isPlaying: true })),
  stop: () => set(() => ({ isPlaying: false })),
  setCurrentTime: (time: number) => set(() => ({ currentTime: time })),
  setStartTime: (time: number) => set(() => ({ startTime: time })),
  playRange: (startTime: number, endTime: number) => {
    const video = get(); // Access current state
    video.setStartTime(startTime);
    video.play();

    const timeoutInMil = (endTime - startTime) * 1000;

    setTimeout(() => {
      video.stop();
      video.setStartTime(0);
    }, timeoutInMil);
  },
}));
