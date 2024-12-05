export interface BaseOverlay {
  id: string;
  type: "image" | "text";
  startTime: number;
  endTime: number;
  position: { x: number; y: number };
  size: {
    width: number;
    height: number;
  };
  transform: {
    translateX: number;
    translateY: number;
  };
}

export interface ImageOverlay extends BaseOverlay {
  type: "image";
  image: string;
  width: number;
  height: number;
}

export interface TextOverlay extends BaseOverlay {
  type: "text";
  text: string;
  fontSize: number;
  color: string;
}

export type Overlay = ImageOverlay | TextOverlay;
