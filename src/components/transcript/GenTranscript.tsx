import { Button } from "@blueprintjs/core";
import { StoreType } from "polotno/model/store";
import { dataURLtoBlob } from "../../utils/blob";
import { genTextElement } from "../../utils/text";
import { TranscriptApi } from "../../services/transcript.api";

import { useState } from "react";
const GenTranscript = ({ store }: { store: StoreType }) => {
  const storeJson = store.toJSON() as any;
  const videoEl = storeJson.pages[0].children?.find((_) => _.type === "video");

  const [isGenerating, setIsGenerating] = useState(false);
  const handleGenerateSubtitles = async () => {
    if (!videoEl) return;

    setIsGenerating(true);
    const isBase64Video = videoEl?.src?.startsWith("data:video");
    const isVideoLink =
      videoEl?.src?.startsWith("http") || videoEl?.src?.startsWith("https");

    try {
      let videoBlob;

      if (isBase64Video) {
        videoBlob = dataURLtoBlob(videoEl.src);
      } else if (isVideoLink) {
        // Fetch video from URL and convert to blob
        const response = await fetch(videoEl.src);
        videoBlob = await response.blob();
      }

      if (videoBlob) {
        const videoFile = new File([videoBlob], "video.mp4", {
          type: "video/mp4",
        });
        const response = await TranscriptApi.genTranscript(videoFile);
        if (response.success && response.segments.length > 0) {
          // Remove old transcript elements
          const currentTranscriptElements =
            store.custom?.transcriptElements ?? [];
          store.deleteElements(currentTranscriptElements.map((el) => el.id));

          const canvasWidth = store.width;
          const canvasHeight = store.height;
          const fontSize = 30;
          const lineHeight = 1.2;
          const textWidth = canvasWidth;
          const textX = 0;
          const textYOffset = 10;
          const transcriptElements = [];
          for (const transcript of response.segments) {
            // Calculate how many characters can fit in one line
            const charsPerLine = Math.floor(canvasWidth / (fontSize * 0.6)); // Approximate character width
            const lines = Math.ceil(transcript.text.length / charsPerLine);
            const textHeight = fontSize * lineHeight * lines;
            const textY = canvasHeight - textHeight - textYOffset;
            const textEl = genTextElement(
              transcript.text,
              transcript.start,
              transcript.end,
              textWidth,
              textHeight,
              textX,
              textY
            );
            transcriptElements.push(textEl);
            store.activePage.addElement(textEl);
          }

          store.set({ custom: { transcriptElements } });
          store.openSidePanel("transcript-panel");
        }
      }
    } catch (error) {
      console.error("Error processing video:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      disabled={!videoEl || isGenerating}
      intent="primary"
      onClick={handleGenerateSubtitles}
    >
      {isGenerating ? "Generating ..." : "Generate subtitles"}
    </Button>
  );
};

export default GenTranscript;
