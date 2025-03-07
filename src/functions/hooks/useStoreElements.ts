import { ElementType } from "polotno/model/group-model";
import { PageType } from "polotno/model/page-model";
import { StoreType } from "polotno/model/store";

export const useStoreElements = (store: StoreType) => {
  const elements: ElementType[] = [];
  store.pages.forEach((page: PageType) => {
    page.children.forEach((element: ElementType) => {
      elements.push(element);
    });
  });

  return elements;
};
