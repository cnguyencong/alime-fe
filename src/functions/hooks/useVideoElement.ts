import { StoreType } from "polotno/model/store";
export const useVideoElement = ({ store }: { store: StoreType }) => {
  const storeJson = store.toJSON() as any;
  const videoElementJson = storeJson.pages[0].children?.find(
    (_) => _.type === "video"
  );

  const videoEl = store.getElementById(videoElementJson?.id);

  return { videoEl, videoElementJson };
};
