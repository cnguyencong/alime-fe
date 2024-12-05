import { create } from "zustand";

interface VideoStore {
  file: File | null;
  duration: number;
  currentTime: number;
  previewUrl: string;
  exportUrl: string;
  setFile: (file: File) => void;
  setDuration: (duration: number) => void;
  setCurrentTime: (currentTime: number) => void;
  setPreviewUrl: (previewUrl: string) => void;
}

export const useVideoStore = create<VideoStore>((set) => ({
  file: null,
  duration: 0,
  previewUrl: "",
  exportUrl: "",
  currentTime: 0,
  setFile: (file: File) => set({ file }),
  setDuration: (duration: number) => set({ duration }),
  setCurrentTime: (currentTime: number) => set({ currentTime }),
  setPreviewUrl: (previewUrl: string) => set({ previewUrl }),
}));
