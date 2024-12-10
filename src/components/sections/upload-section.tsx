import React from "react";
import { observer } from "mobx-react-lite";
import { Button } from "@blueprintjs/core";
import {
  ImagesGrid,
  UploadSection as DefaultUploadSection,
} from "polotno/side-panel";
import { getImageSize, getCrop } from "polotno/utils/image";
import { getVideoSize, getVideoPreview } from "polotno/utils/video";
import { dataURLtoBlob } from "@/utils/blob";

import { CloudWarning } from "../cloud-warning";

import { useProject } from "@/utils/project";
import { listAssets, uploadAsset, deleteAsset } from "@/utils/api";
import { StoreType } from "polotno/model/store";
import { TAny } from "@/types/common";

function getType(file: File) {
  const { type } = file;
  if (type.indexOf("svg") >= 0) {
    return "svg";
  }
  if (type.indexOf("image") >= 0) {
    return "image";
  }
  if (type.indexOf("video") >= 0) {
    return "video";
  }
  return "image";
}

const getImageFilePreview = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = (e.target?.result || "") as string;
      // now we need to render that image into smaller canvas and get data url
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = 200;
        canvas.height = (200 * img.height) / img.width;
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL());
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  });
};

type Props = Readonly<{
  store: StoreType;
}>;

export const UploadPanel = observer(({ store }: Props) => {
  const [images, setImages] = React.useState<TAny[]>([]);
  const [isUploading, setUploading] = React.useState(false);
  const [isLoading, setLoading] = React.useState(false);
  const project = useProject();

  const load = async () => {
    setLoading(true);
    const images = await listAssets();
    setImages(images);
    setLoading(false);
  };

  const handleFileInput = async (e: TAny) => {
    const { target } = e;
    setUploading(true);
    for (const file of target.files) {
      const type = getType(file);
      let previewDataURL = "";
      if (type === "video") {
        previewDataURL = await getVideoPreview(URL.createObjectURL(file));
      } else {
        previewDataURL = await getImageFilePreview(file);
      }
      const preview = dataURLtoBlob(previewDataURL);
      await uploadAsset({ file, preview, type });
    }
    await load();
    setUploading(false);
    target.value = null;
  };

  const handleDelete = async (image: TAny) => {
    if (window.confirm("Are you sure you want to delete the image?")) {
      setImages(images.filter((i) => i.id !== image.id));
      await deleteAsset({ id: image.id });
      await load();
    }
  };

  React.useEffect(() => {
    load();
  }, []);

  React.useEffect(() => {
    load();
  }, [project.cloudEnabled]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="input-file">
          <Button
            icon="upload"
            style={{ width: "100%" }}
            onClick={() => {
              (
                document.querySelector("#input-file") as HTMLInputElement
              ).click();
            }}
            loading={isUploading}
            intent="primary"
          >
            Upload
          </Button>
          <input
            type="file"
            id="input-file"
            style={{ display: "none" }}
            onChange={handleFileInput}
            multiple
          />
        </label>
      </div>
      <CloudWarning />
      <ImagesGrid
        images={images}
        getPreview={(image) => image.preview}
        crossOrigin={undefined}
        isLoading={isLoading}
        getCredit={(image) => (
          <div>
            <Button
              icon="trash"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(image);
              }}
            ></Button>
          </div>
        )}
        onSelect={async (item, pos, element) => {
          const image = item.src;
          const type = item.type;

          const getSizeFunc = type === "video" ? getVideoSize : getImageSize;

          let { width, height } = await getSizeFunc(image);

          if (
            element &&
            element.type === "svg" &&
            element.contentEditable &&
            type === "image"
          ) {
            element.set({ maskSrc: image });
            return;
          }

          if (
            element &&
            element.type === "image" &&
            element.contentEditable &&
            type == "image"
          ) {
            const crop = getCrop(element, {
              width,
              height,
            });
            element.set({ src: image, ...crop });
            return;
          }

          const scale = Math.min(store.width / width, store.height / height, 1);
          width = width * scale;
          height = height * scale;

          const x = (pos?.x || store.width / 2) - width / 2;
          const y = (pos?.y || store.height / 2) - height / 2;

          store.activePage?.addElement({
            type,
            src: image,
            x,
            y,
            width,
            height,
          });
        }}
      />
    </div>
  );
});

DefaultUploadSection.Panel = UploadPanel;

export const UploadSection = DefaultUploadSection;
