import { Divider, Switch } from "@blueprintjs/core";
import { useEffect } from "react";
import { TTranscriptElement } from "../../shared/types/transcript";
import { useLangStore } from "../../shared/zustand/language";
import { useTransitions } from "../../shared/zustand/transition";
import { FlexContainer, TranscriptContainer } from "./elements/CommonStyle";
import OriginalTranscriptItem from "./elements/OriginalTranscriptItem";
import TranslatedTranscriptItem from "./elements/TranslatedTranscriptItem";

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
  const { setSegmentTransition, segmentTransitions } = useTransitions();
  const originalTranscript = transcripts?.find((t) => t.custom?.isOriginal);
  const translatedTranscripts = transcripts?.filter(
    (t) => !t.custom?.isOriginal
  );
  const segmentId = transcripts[0]?.custom.id;
  const segmentStartAt = transcripts[0]?.custom?.startAt;
  const isTransitionActive = segmentTransitions.some(
    (s) => s.transitionForSegmentId === segmentId
  );

  const handleTransitionToggle = () => {
    setSegmentTransition({
      transitionForSegmentId: segmentId,
      time: segmentStartAt,
    });
  };

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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: "1.2rem", fontWeight: "500" }}> </div>
          <Switch
            alignIndicator="right"
            labelElement={<em>Transition</em>}
            style={{ marginBottom: 0 }}
            checked={isTransitionActive}
            onChange={handleTransitionToggle}
          />
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
