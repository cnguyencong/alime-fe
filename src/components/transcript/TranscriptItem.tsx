import { Divider } from "@blueprintjs/core";
import { FlexContainer, TranscriptContainer } from "./elements/CommonStyle";
import OriginalTranscriptItem from "./elements/OriginalTranscriptItem";
import TranslatedTranscriptItem from "./elements/TranslatedTranscriptItem";
import { TTranscriptElement } from "../../shared/types/transcript";
import { useEffect, useState } from "react";
import { useLangStore } from "../../shared/zustand/language";

interface TranscriptItemProps {
  isActive: boolean;
  textToSpeech: (transcript: TTranscriptElement) => void;
  transcripts: TTranscriptElement[];
}

const TranscriptItem: React.FC<TranscriptItemProps> = ({
  isActive,
  textToSpeech,
  transcripts,
}) => {
  const originalTranscript = transcripts?.find((t) => t.custom?.isOriginal);
  const translatedTranscripts = transcripts?.filter(
    (t) => !t.custom?.isOriginal
  );

  useEffect(() => {
    const latestLangItem =
      translatedTranscripts[translatedTranscripts.length - 1]?.custom?.lang ??
      "en";
    setCurrentLang(latestLangItem);
  }, [translatedTranscripts.length]);

  const currentLang = useLangStore((state) => state.selectedLang);
  const setCurrentLang = useLangStore((state) => state.setLang);

  return (
    <TranscriptContainer
      $activeBg={isActive ? "#72CA9B" : ""}
      className={isActive ? "active-transcript" : ""}
    >
      <FlexContainer>
        <div>
          <span style={{ fontSize: "1rem", fontWeight: "500" }}>Speaker</span>
        </div>
      </FlexContainer>
      <Divider />
      {originalTranscript && (
        <OriginalTranscriptItem transcript={originalTranscript} />
      )}
      {translatedTranscripts?.length > 0 && (
        <TranslatedTranscriptItem
          textToSpeech={textToSpeech}
          transcripts={translatedTranscripts}
          selectedLang={currentLang}
          setSelectedLang={setCurrentLang}
        />
      )}
    </TranscriptContainer>
  );
};

export default TranscriptItem;
