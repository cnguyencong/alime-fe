import { Button, EditableText } from "@blueprintjs/core";
import { TAny } from "../../../shared/types/common";
import { useVideoStore } from "../../../shared/zustand/video";
import EditTranscript from "../EditTranscript";
import { FlexContainer, TextContainer } from "./CommonStyle";
import { TranscriptTime } from "./TranscriptTime";
import { getLangByCode } from "../../../shared/utils/common";

const saveEdit = (value: string, transcript: TAny) => {
  if (!value) return;
  transcript.set({
    text: value,
  });
};

const OriginalTranscriptItem = ({ transcript }: { transcript: TAny }) => {
  const playRange = useVideoStore((state: any) => state.playRange);

  // Play video at the specifc duration
  const playVideoAtRange = async (transcript: TAny) => {
    const startTime = transcript?.custom?.start ?? 0;
    const endTime = transcript?.custom?.end ?? 0;

    playRange(startTime, endTime);
  };

  return (
    <div>
      <FlexContainer>
        <span style={{ fontSize: "1rem", fontWeight: "500" }}>
          Original
          <small>
            &nbsp;({getLangByCode(transcript?.custom?.lang ?? "")?.name})
          </small>
        </span>
        <TranscriptTime transcript={transcript} />
        <Button
          onClick={() => playVideoAtRange(transcript)}
          icon="volume-up"
          outlined={true}
          aria-label="share"
        />
        <EditTranscript transcript={transcript} />
      </FlexContainer>
      <TextContainer>
        <EditableText
          placeholder="Edit subtitle..."
          defaultValue={transcript?.text}
          multiline={true}
          minLines={3}
          maxLines={12}
          onConfirm={(value) => saveEdit(value, transcript)}
        />
      </TextContainer>
    </div>
  );
};

export default OriginalTranscriptItem;
