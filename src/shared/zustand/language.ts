import { create } from "zustand";
interface LangStoreProps {
  selectedLang: string;
  setLang: (lang: string) => void;
}

export const useLangStore = create<LangStoreProps>((set) => ({
  selectedLang: "vi",
  setLang: (lang: string) => set(() => ({ selectedLang: lang })),
}));
