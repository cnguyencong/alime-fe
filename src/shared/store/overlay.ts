import { create } from "zustand";
import { Overlay } from "../types/Overlay";

interface OverlayStore {
  overlays: Overlay[];
  addOverlay: (overlay: Overlay) => void;
  updateOverlay: (id: string, updates: Partial<Overlay>) => void;
  removeOverlay: (id: string) => void;
}

export const useOverlayStore = create<OverlayStore>((set) => ({
  overlays: [],

  addOverlay: (overlay: Overlay) =>
    set((state) => ({
      overlays: [...state.overlays, overlay],
    })),

  updateOverlay: (id: string, updates: Partial<Overlay>) =>
    set((state) => ({
      overlays: state.overlays.map((overlay) =>
        overlay.id === id ? { ...overlay, ...updates } : overlay
      ),
    })),

  removeOverlay: (id: string) =>
    set((state) => ({
      overlays: state.overlays.filter((overlay) => overlay.id !== id),
    })),
}));
