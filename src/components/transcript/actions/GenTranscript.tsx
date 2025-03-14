import { Button } from "@blueprintjs/core";
import { StoreType } from "polotno/model/store";
import { dataURLtoBlob } from "../../../shared/utils/blob";
import { genTextElement } from "../../../shared/utils/text";
import { TranscriptApi } from "../../../shared/services/transcript.api";

import { useState } from "react";
import { TAny } from "../../../shared/types/common";
import { PageType } from "polotno/model/page-model";
import { ElementType } from "polotno/model/group-model";
import { TTranscriptDTO } from "../../../shared/types/transcript";

const GenTranscript = ({ store }: { store: StoreType }) => {
  const storeJson = store.toJSON() as TAny;
  const videoEl = storeJson.pages[0].children?.find(
    (_: TAny) => _.type === "video"
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const language = "en";

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
          removeOldTranscript();
          addTranscriptElement(response);
        }
      }
    } catch (error) {
      console.error("Error processing video:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const removeOldTranscript = () => {
    const oldIds: string[] = [];
    store.pages.forEach((page: PageType) => {
      page.children.forEach((element: ElementType) => {
        if (
          element.custom?.type === "transcript" &&
          element.custom?.lang === language
        ) {
          oldIds.push(element.id);
        }
      });
    });

    store.deleteElements(oldIds);
  };

  const addTranscriptElement = (response: TTranscriptDTO) => {
    const canvasWidth = store.width;
    const canvasHeight = store.height;
    const fontSize = 30;
    const lineHeight = 1.2;
    const textWidth = canvasWidth;
    const textX = 0;
    const textYOffset = 10;
    for (const transcript of response.segments) {
      // Calculate how many characters can fit in one line
      const charsPerLine = Math.floor(canvasWidth / (fontSize * 0.6)); // Approximate character width
      const lines = Math.ceil(transcript.text.length / charsPerLine);
      const textHeight = fontSize * lineHeight * lines;
      const textY = canvasHeight - textHeight - textYOffset;
      const textEl = genTextElement(
        transcript.id,
        transcript.text,
        transcript.start,
        transcript.end,
        textWidth,
        textHeight,
        textX,
        textY
      );
      store.activePage.addElement({
        ...textEl,
        custom: { ...textEl?.custom, lang: language, isOriginal: true },
      });
    }

    store.set({
      custom: { langSegment: response.segments, processId: response.processId },
    });

    store.openSidePanel("transcript-panel");
  };

  return (
    <Button
      icon="add"
      text={`Generate`}
      intent="primary"
      loading={isGenerating}
      onClick={() => handleGenerateSubtitles()}
    />
  );
};

export default GenTranscript;
