import { create } from "zustand";

export const useLangStore = create((set) => ({
  selectedLang: "en",
  setLang: (lang: string) => set(() => ({ selectedLang: lang })),
}));
