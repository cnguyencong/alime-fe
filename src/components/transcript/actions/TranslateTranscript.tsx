import {
  Button,
  Menu,
  MenuDivider,
  Popover,
  Position,
} from "@blueprintjs/core";
import { StoreType } from "polotno/model/store";
import { genTextElement } from "../../../shared/utils/text";
import { TranscriptApi } from "../../../shared/services/transcript.api";
import { useTranscriptLang } from "../../../functions/hooks/useTranscriptLang";

import { useState } from "react";
import { LocaleConfig } from "../../../shared/constants/locale";
import { PageType } from "polotno/model/page-model";
import { ElementType } from "polotno/model/group-model";
import { TTranscriptItemDTO } from "../../../shared/types/transcript";
import LanguageItem from "../../common/LanguageItem";

const TranslateTranscript = ({ store }: { store: StoreType }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [language, setLanguage] = useState("en");
  const processId = store.custom?.processId;
  const selectedTranscripts = useTranscriptLang(store);

  const handleTranslateSubtitles = async () => {
    if (!processId) return;

    setIsGenerating(true);
    try {
      const body = {
        processId,
        targetLanguage: language,
      };
      const response = await TranscriptApi.translateTranscript(body);
      if (response.segments.length > 0) {
        removeOldTranscript();
        addTranscriptElement(response.segments);
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

  const addTranscriptElement = (segments: TTranscriptItemDTO[]) => {
    const canvasWidth = store.width;
    const canvasHeight = store.height;
    const fontSize = 30;
    const lineHeight = 1.2;
    const textWidth = canvasWidth;
    const textX = 0;
    const textYOffset = 10;
    for (const transcript of segments) {
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
        textY,
        transcript?.audioLength,
        transcript?.audioPath
      );
      store.activePage.addElement({
        ...textEl,
        custom: { ...textEl?.custom, lang: language },
      });
    }
    store.openSidePanel("transcript-panel");
  };

  return (
    <Popover
      content={
        <Menu>
          <MenuDivider title="Select language:" />
          <LanguageItem
            languages={LocaleConfig.map((locale) => locale.code)}
            selectedLang={language}
            onClick={setLanguage}
          />

          <Button
            fill
            intent="primary"
            loading={isGenerating}
            onClick={async () => handleTranslateSubtitles()}
            style={{ marginTop: "1rem" }}
            disabled={selectedTranscripts?.includes(language)}
          >
            Translate
          </Button>
        </Menu>
      }
      position={Position.BOTTOM_RIGHT}
    >
      <Button
        icon="globe"
        text={`Translate`}
        intent="success"
        loading={isGenerating}
        disabled={!processId}
      />
    </Popover>
  );
};

export default TranslateTranscript;
