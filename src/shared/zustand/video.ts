import { create } from "zustand";

interface VideoStoreProps {
  currentTime: number;
  startTime: number;
  isPlaying: boolean;
  isPlayingRange: boolean;
  muted: boolean;
  setCurrentTime: (time: number) => void;
  setStartTime: (time: number) => void;
  play: () => void;
  stop: () => void;
  ended: () => void;
  playRange: (startTime: number, endTime: number) => void;
  mute: () => void;
  unmute: () => void;
  startPlayAtRange: () => void;
  stopPlayAtRange: () => void;
}

export const useVideoStore = create<VideoStoreProps>((set, get) => ({
  isPlaying: false,
  muted: false,
  currentTime: 0, // in seconds
  startTime: 0,
  isPlayingRange: false,
  play: () => set(() => ({ isPlaying: true })),
  stop: () => set(() => ({ isPlaying: false })),
  setCurrentTime: (time: number) => set(() => ({ currentTime: time })),
  setStartTime: (time: number) => set(() => ({ startTime: time })),
  playRange: (startTime: number, endTime: number) => {
    const video = get(); // Access current state
    video.startPlayAtRange();
    video.setStartTime(startTime);
    video.play();

    const timeoutInMil = (endTime - startTime) * 1000;

    setTimeout(() => {
      video.stopPlayAtRange();
      video.stop();
      video.setStartTime(0);
    }, timeoutInMil);
  },
  ended: () => {
    const video = get();
    video.stop();
    video.setStartTime(0);
    video.setCurrentTime(0);
  },
  mute: () => set(() => ({ muted: true })),
  unmute: () => set(() => ({ muted: false })),
  startPlayAtRange: () => set(() => ({ isPlayingRange: true })),
  stopPlayAtRange: () => set(() => ({ isPlayingRange: false })),
}));
