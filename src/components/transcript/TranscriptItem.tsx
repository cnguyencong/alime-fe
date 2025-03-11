import { Divider, Switch } from "@blueprintjs/core";
import { TAny } from "../../shared/types/common";
import { useTransitions } from "../../shared/zustand/transition";
import { FlexContainer, TranscriptContainer } from "./elements/CommonStyle";
import OriginalTranscriptItem from "./elements/OriginalTranscriptItem";
import TranslatedTranscriptItem from "./elements/TranslatedTranscriptItem";

interface TranscriptItemProps {
  isActive: boolean;
  textToSpeech: TAny;
  transcripts: TAny[];
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
        />
      )}
    </TranscriptContainer>
  );
};

export default TranscriptItem;
