import { create } from "zustand";

export const useLangStore = create((set) => ({
  selectedLang: "vi",
  setLang: (lang: string) => set(() => ({ selectedLang: lang })),
}));
