import { Divider } from "@blueprintjs/core";
import { FlexContainer, TranscriptContainer } from "./elements/CommonStyle";
import OriginalTranscriptItem from "./elements/OriginalTranscriptItem";
import TranslatedTranscriptItem from "./elements/TranslatedTranscriptItem";
import { TAny } from "../../shared/types/common";

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
  const originalTranscript = transcripts?.find((t) => t.custom?.isOriginal);
  const translatedTranscripts = transcripts?.filter(
    (t) => !t.custom?.isOriginal
  );

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
        />
      )}
    </TranscriptContainer>
  );
};

export default TranscriptItem;
