import {
  Button,
  Menu,
  MenuDivider,
  MenuItem,
  Popover,
  Position,
} from "@blueprintjs/core";
import { StoreType } from "polotno/model/store";
import { genTextElement } from "../../shared/utils/text";
import { TranscriptApi } from "../../shared/services/transcript.api";

import { useState } from "react";
import { TAny } from "../../shared/types/common";
import { LocaleConfig } from "../../shared/constants/locale";
import { PageType } from "polotno/model/page-model";
import { ElementType } from "polotno/model/group-model";

const TranslateTranscript = ({ store }: { store: StoreType }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [language, setLanguage] = useState("en");
  const segments = store?.custom?.langSegment ?? [];

  const handleTranslateSubtitles = async () => {
    if (segments.length === 0) return;

    setIsGenerating(true);
    try {
      const body = {
        segments,
        targetLanguage: language,
      };
      const response = await TranscriptApi.translateTranscript(body);
      if (response.success && response.segments.length > 0) {
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

  const addTranscriptElement = (segments: TAny) => {
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
        textY
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
          {LocaleConfig.map((locale: TAny) => (
            <MenuItem
              key={locale.code}
              icon={locale.code === language ? "tick" : ""}
              text={locale.name}
              onClick={() => setLanguage(locale.code)}
              shouldDismissPopover={false}
            />
          ))}

          <Button
            fill
            intent="primary"
            loading={isGenerating}
            onClick={async () => handleTranslateSubtitles()}
            style={{ marginTop: "1rem" }}
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
        disabled={segments.length === 0}
      />
    </Popover>
  );
};

export default TranslateTranscript;
