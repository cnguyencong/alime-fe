import { StoreType } from "polotno/model/store";
import { TAny } from "../../shared/types/common";
export const useVideoElement = ({ store }: { store: StoreType }) => {
  const storeJson = store.toJSON() as TAny;
  const videoElementJson = storeJson.pages[0].children?.find(
    (_: TAny) => _.type === "video"
  );

  const videoEl = store.getElementById(videoElementJson?.id);

  return { videoEl, videoElementJson };
};
