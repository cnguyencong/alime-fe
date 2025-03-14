import { DownloadButton } from "./components/topbar/download-button";

// Hide or create new custom tool for toolbar
// See docs: https://polotno.com/docs/toolbar
export const ToolbarControls = {
  ActionControls: DownloadButton,
  PageDuration: () => null,

  // text element:
  // TextFontFamily
  // TextFontSize
  // TextFontVariant
  TextFilters: () => null,
  // TextFill
  // TextSpacing
  TextAnimations: () => null,
  TextAiWrite: () => null,

  // Image elements
  ImageFlip: () => null,
  ImageFilters: () => null,
  ImageFitToBackground: () => null,
  ImageCrop: () => null,
  ImageClip: () => null,
  ImageRemoveBackground: () => null,
  ImageAnimations: () => null,

  // video element:
  VideoTrim: () => null,
  VideoAnimations: () => null,

  // common:
  History: () => null,
  Group: () => null,
  Position: () => null,
  Opacity: () => null,
  CopyStyle: () => null,
  // Lock: () => null,
  // Duplicate
  // Remove
};
