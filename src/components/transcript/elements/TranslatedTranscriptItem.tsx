import { useState } from "react";
import { TAny } from "../../../shared/types/common";
import { Button, EditableText, HTMLSelect, Tooltip } from "@blueprintjs/core";
import { FlexContainer, TextContainer } from "./CommonStyle";
import { getLangByCode } from "../../../shared/utils/common";
import { TranscriptTime } from "./TranscriptTime";
import EditTranscript from "../EditTranscript";

const saveEdit = (value: string, transcript: TAny) => {
  if (!value) return;
  transcript.set({
    text: value,
  });
};

const TranslatedTranscriptItem = ({
  transcripts,
  textToSpeech,
}: {
  transcripts: TAny[];
  textToSpeech: TAny;
}) => {
  const [showWarning, setShowWarning] = useState(false);

  const [selectedTranscript, setSelectedTranscript] = useState(transcripts[0]);
  const [transcriptText, setTranscriptText] = useState(
    selectedTranscript?.text
  );

  const selectLang = (id: string) => {
    const item = transcripts.find((t) => t.id === id);
    setSelectedTranscript(item);
    setTranscriptText(item?.text);
  };

  return (
    <div>
      {transcriptText}
      <FlexContainer>
        <span style={{ fontSize: "1rem", fontWeight: "500" }}>
          Translated:&nbsp;
        </span>
        <TranscriptTime transcript={selectedTranscript} />
        <Button
          onClick={() => textToSpeech(selectedTranscript)}
          icon="volume-up"
          outlined={true}
          aria-label="share"
        />
        <EditTranscript transcript={selectedTranscript} />
      </FlexContainer>

      <FlexContainer style={{ marginTop: "5px" }}>
        <HTMLSelect
          fill
          onChange={(e) => {
            selectLang(e.target.value);
          }}
          defaultValue={selectedTranscript?.custom?.lang}
        >
          {transcripts.map((transcript: TAny) => (
            <option key={transcript?.id} value={transcript.id}>
              {getLangByCode(transcript?.custom?.lang)?.name ?? ""}
            </option>
          ))}
        </HTMLSelect>
      </FlexContainer>
      <TextContainer
        onMouseEnter={() => setShowWarning(true)}
        onMouseLeave={() => setShowWarning(false)}
        $warning={true}
      >
        <Tooltip
          content={
            <div style={{ maxWidth: "15rem" }}>
              <p>
                This transcript may not match the original audio duration when
                converted to speech. Consider shortening it for better
                alignment!
              </p>
              <p>
                Ignore this warning if you want to keep the original vocals.
              </p>
            </div>
          }
          compact={true}
          isOpen={showWarning}
        >
          <EditableText
            placeholder="Edit subtitle..."
            defaultValue={transcriptText}
            multiline={true}
            minLines={3}
            maxLines={12}
            onConfirm={(value) => saveEdit(value, selectedTranscript)}
          />
        </Tooltip>
      </TextContainer>
    </div>
  );
};

export default TranslatedTranscriptItem;
