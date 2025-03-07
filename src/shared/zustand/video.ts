import { create } from "zustand";

interface VideoStoreProps {
  currentTime: number;
  isPlaying: boolean;
  setCurrentTime: (time: number) => void;
  play: () => void;
  stop: () => void;
  playRange: (startTime: number, endTime: number) => void;
}

export const useVideoStore = create<VideoStoreProps>((set, get) => ({
  isPlaying: false,
  currentTime: 0, // in seconds
  play: () => set(() => ({ isPlaying: true })),
  stop: () => set(() => ({ isPlaying: false })),
  setCurrentTime: (time: number) => set(() => ({ currentTime: time })),
  playRange: (startTime: number, endTime: number) => {
    const video = get(); // Access current state

    video.setCurrentTime(startTime);
    video.play();

    setTimeout(() => {
      video.stop();
    }, endTime - startTime);
  },
}));
