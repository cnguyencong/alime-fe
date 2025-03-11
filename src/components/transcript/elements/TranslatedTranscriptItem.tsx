import React, { useEffect, useState } from "react";
import { Button, EditableText, HTMLSelect, Tooltip } from "@blueprintjs/core";
import { FlexContainer, TextContainer } from "./CommonStyle";
import { getLangByCode } from "../../../shared/utils/common";
import { TranscriptTime } from "./TranscriptTime";
import EditTranscript from "../EditTranscript";
import { TTranscriptElement } from "../../../shared/types/transcript";

interface TranslatedTranscriptItemProps {
  transcripts: TTranscriptElement[];
  textToSpeech: (transcript: TTranscriptElement) => void;
  selectedLang: string;
  setSelectedLang: (lang: string) => void;
}

const saveEdit = (value: string, transcript: TTranscriptElement) => {
  if (!value || !transcript?.set) return;

  transcript.set({
    text: value,
    custom: {
      ...transcript.custom,
      isTranscriptModified: true,
    },
  });
};

const TranslatedTranscriptItem: React.FC<TranslatedTranscriptItemProps> = ({
  transcripts,
  textToSpeech,
  setSelectedLang,
  selectedLang,
}) => {
  const [hasAudioWarning, setHasAudioWarning] = useState<boolean>(false);
  const [showWarning, setShowWarning] = useState<boolean>(false);

  const [selectedTranscript, setSelectedTranscript] =
    useState<TTranscriptElement>();
  const [transcriptText, setTranscriptText] = useState<string>("");

  const updateCurrentLang = () => {
    const transcript = transcripts.find((t) => t.custom?.lang === selectedLang);
    if (!transcript?.text) return;

    setSelectedTranscript(transcript);
    setTranscriptText(transcript.text);

    const audioLength = transcript?.custom?.audioLength ?? 0;
    const audioLengthInSec = audioLength * 1000;
    const transcriptDuration = transcript?.custom?.duration;
    // Check length gap between original audio and translated audio bigger than 1s
    const timeGapInMillisecond = 1000;
    const shouldWarning =
      audioLengthInSec - transcriptDuration > timeGapInMillisecond;

    setHasAudioWarning(shouldWarning);
  };

  useEffect(() => {
    updateCurrentLang();
  }, [selectedLang, transcripts]);

  return (
    selectedTranscript && (
      <React.Fragment>
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
              setSelectedLang(e.target.value);
            }}
            value={selectedLang}
          >
            {transcripts.map((transcript: TTranscriptElement) => (
              <option key={transcript?.id} value={transcript?.custom?.lang}>
                {getLangByCode(transcript?.custom?.lang)?.name ?? ""}
              </option>
            ))}
          </HTMLSelect>
        </FlexContainer>
        <TextContainer
          onMouseEnter={() => hasAudioWarning && setShowWarning(true)}
          onMouseLeave={() => setShowWarning(false)}
          $warning={hasAudioWarning}
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
              value={transcriptText}
              multiline={true}
              minLines={3}
              maxLines={12}
              onChange={(value) => setTranscriptText(value)}
              onConfirm={(value) => saveEdit(value, selectedTranscript)}
            />
          </Tooltip>
        </TextContainer>
      </React.Fragment>
    )
  );
};

export default TranslatedTranscriptItem;
