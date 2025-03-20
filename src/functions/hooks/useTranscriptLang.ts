import { ElementType } from "polotno/model/group-model";
import { PageType } from "polotno/model/page-model";
import { StoreType } from "polotno/model/store";

export const useTranscriptLang = (store: StoreType) => {
  const listLangs: string[] = [];
  store.pages.forEach((page: PageType) => {
    page.children.forEach((element: ElementType) => {
      const lang = element.custom?.lang;
      if (element.custom?.type === "transcript" && !listLangs.includes(lang)) {
        listLangs.push(lang);
      }
    });
  });

  return listLangs;
};
