import { create } from "zustand";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { Overlay } from "../types/Overlay";

interface ProcessorState {
  ffmpeg: FFmpeg | null;
  loading: boolean;
  progress: number;
  processedVideoUrl: string | null;
  initFFmpeg: () => Promise<void>;
  processVideo: (params: {
    videoUrl: string;
    overlays: Overlay[];
    audio: File | null;
  }) => Promise<void>;
  setProgress: (progress: number) => void;
}

export const useProcessorStore = create<ProcessorState>((set, get) => ({
  ffmpeg: null,
  loading: false,
  progress: 0,
  processedVideoUrl: null,

  initFFmpeg: async () => {
    const ffmpeg = new FFmpeg();
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd";
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });

    // Load and write the Roboto font file
    const fontResponse = await fetch("/fonts/Roboto/Roboto-Regular.ttf"); // Adjust path if needed
    const fontData = await fontResponse.arrayBuffer();
    await ffmpeg.writeFile("font.ttf", new Uint8Array(fontData));

    set({ ffmpeg });
  },

  setProgress: (progress) => set({ progress }),

  processVideo: async ({ videoUrl, overlays, audio }) => {
    const { ffmpeg } = get();
    if (!videoUrl || !ffmpeg) return;

    set({ loading: true, progress: 0, processedVideoUrl: null });

    try {
      ffmpeg.on("progress", ({ progress }) => {
        set({ progress: Math.round(progress * 100) });
      });

      // Get video dimensions and calculate scaling ratio
      const tempVideo = document.createElement("video");
      tempVideo.src = videoUrl;
      await new Promise((resolve) => {
        tempVideo.onloadedmetadata = resolve;
      });
      const videoWidth = tempVideo.videoWidth;
      const videoHeight = tempVideo.videoHeight;

      const videoCanvas = document.getElementById("video-canvas");
      const canvasWidth = videoCanvas?.clientWidth ?? videoWidth;
      const canvasHeight = videoCanvas?.clientHeight ?? videoHeight;

      // Write input video
      const videoResponse = await fetch(videoUrl);
      const videoArrayBuffer = await videoResponse.arrayBuffer();
      await ffmpeg.writeFile("input.mp4", new Uint8Array(videoArrayBuffer));

      // Process overlays
      for (let i = 0; i < overlays.length; i++) {
        if ("image" in overlays[i]) {
          const response = await fetch(overlays[i].image);
          const arrayBuffer = await response.arrayBuffer();
          await ffmpeg.writeFile(
            `overlay_${i}.png`,
            new Uint8Array(arrayBuffer)
          );
        }
      }

      // Process audio if exists
      if (audio) {
        const audioArrayBuffer = await audio.arrayBuffer();
        await ffmpeg.writeFile("audio.mp3", new Uint8Array(audioArrayBuffer));
      }

      // Create complex filter for overlays
      let filterComplex = "";
      let lastOutput = "0:v";

      overlays.forEach((overlay, index) => {
        const x = overlay.position.x * videoWidth;
        const y = overlay.position.y * videoHeight;

        if (overlay.type === "image") {
          const originalWidthRatio = overlay.size?.width / canvasWidth;
          const originalHeightRatio = overlay.size?.height / canvasHeight;

          const scaleWidth = Math.round(originalWidthRatio * videoWidth);
          const scaleHeight = Math.round(originalHeightRatio * videoHeight);

          const centeredX = x;
          const centeredY = y;

          filterComplex += `[${
            index + 1
          }:v]scale=${scaleWidth}:${scaleHeight}[scaled${index}];`;

          if (index === overlays.length - 1) {
            filterComplex += `[${lastOutput}][scaled${index}]overlay=${centeredX}:${centeredY}:enable='between(t,${overlay.startTime},${overlay.endTime})'[v${index}]`;
          } else {
            filterComplex += `[${lastOutput}][scaled${index}]overlay=${centeredX}:${centeredY}:enable='between(t,${overlay.startTime},${overlay.endTime})'[v${index}];`;
            lastOutput = `v${index}`;
          }
        } else if (overlay.type === "text") {
          const scalingFactor = videoWidth / canvasWidth;
          const fontSize = overlay.fontSize * scalingFactor;

          const fontColor = overlay.color || "white";
          const text = overlay.text.replace(/:/g, "\\:").replace(/'/g, "\\'");

          if (index === overlays.length - 1) {
            filterComplex += `[${lastOutput}]drawtext=text='${text}':fontfile=font.ttf:x=${x}:y=${y}:fontsize=${fontSize}:fontcolor=${fontColor}:enable='between(t,${overlay.startTime},${overlay.endTime})'[v${index}]`;
          } else {
            filterComplex += `[${lastOutput}]drawtext=text='${text}':fontfile=font.ttf:x=${x}:y=${y}:fontsize=${fontSize}:fontcolor=${fontColor}:enable='between(t,${overlay.startTime},${overlay.endTime})'[v${index}];`;
            lastOutput = `v${index}`;
          }
        }
      });

      // Build FFmpeg command
      const command = [
        "-i",
        "input.mp4",
        ...overlays
          .filter((o) => o.type === "image")
          .flatMap((_, i) => ["-i", `overlay_${i}.png`]),
        ...(audio ? ["-i", "audio.mp3"] : []),
        ...(overlays.length > 0
          ? [
              "-filter_complex",
              filterComplex,
              "-map",
              `[v${overlays.length - 1}]`,
            ]
          : ["-c:v", "copy"]),
        ...(audio ? ["-map", `${overlays.length + 1}:a`] : ["-map", "0:a"]),
        "-c:a",
        "aac",
        "output.mp4",
      ];

      await ffmpeg.exec(command);

      const data = await ffmpeg.readFile("output.mp4");
      const outputBlob = new Blob([data], { type: "video/mp4" });
      const outputUrl = URL.createObjectURL(outputBlob);

      set({ processedVideoUrl: outputUrl });
    } catch (error) {
      console.error("Error processing video:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message);
        console.error("Error stack:", error.stack);
      }
    } finally {
      set({ loading: false, progress: 0 });
    }
  },
}));
