import { create } from "zustand";

interface VideoFrames {
  id: string;
  frames: string[];
}

interface ImageThumbnail {
  id: string;
  url: string;
}

interface ElementStoreProps {
  videoFrames: VideoFrames[];
  imageThumbnails: ImageThumbnail[];
  saveVideoFrames: (id: string, frames: string[]) => void;
  getVideoFrames: (id: string) => VideoFrames | null;
  //   saveImageThumnail: (id: string, url: string) => void;
  //   getImageThumnail: (id: string) => void;
}

export const useElementStore = create<ElementStoreProps>((set, get) => ({
  videoFrames: [],
  imageThumbnails: [],
  saveVideoFrames: (id: string, frames: string[]) =>
    set(() => {
      const listFrames = get().videoFrames;
      const frameExist = listFrames.find((f) => f.id === id);
      if (!frameExist) {
        listFrames.push({ id, frames });
      }

      return { videoFrames: listFrames };
    }),
  getVideoFrames: (id: string) => {
    const listFrames = get().videoFrames;
    const frameExist = listFrames.find((f) => f.id === id);
    return frameExist ?? null;
  },
}));
