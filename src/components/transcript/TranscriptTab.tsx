import {
  Button,
  ButtonGroup,
  Divider,
  EditableText,
  HTMLSelect,
  Switch,
  Tag,
} from "@blueprintjs/core";
import { observer } from "mobx-react-lite";
import { ElementType } from "polotno/model/group-model";
import { PageType } from "polotno/model/page-model";
import { SectionTab } from "polotno/side-panel";
import { useEffect, useState } from "react";
import { FaRegListAlt } from "react-icons/fa";
import styled from "styled-components";
import { useVideoElement } from "../../functions/hooks/useVideoElement";
import { config } from "../../shared/constants";
import { TranscriptApi } from "../../shared/services/transcript.api";
import { TAny } from "../../shared/types/common";
import { formatTime, getLangByCode } from "../../shared/utils/common";
import { useLangStore } from "../../shared/zustand/language";
import { useTransitions } from "../../shared/zustand/transitions";
import { ClearTranscript } from "./ClearTranscript";
import EditTranscript from "./EditTranscript";
import GenTranscript from "./GenTranscript";
import TranslateTranscript from "./TranslateTranscript";

const TranscriptListContainer = styled.div`
  max-height: calc(100dvh - 160px);
  overflow: auto;
`;

const TranscriptContainer = styled.div<{ $activeBg?: string }>`
  margin-bottom: 10px;
  border: 1px solid #e0e0e0;
  padding: 10px;
  border-radius: 5px;
  background-color: ${(props) => props.$activeBg || "#f0f0f0"};
`;

const FlexContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const saveEdit = (value: string, transcript: TAny) => {
  if (!value) return;

  transcript.store.set({
    text: value,
  });
};

const formatTranscriptTime = (time: number) => {
  return formatTime(time);
};

// Play video at the specifc duration
const playVideo = async (transcript: TAny) => {
  const startTime = transcript.custom?.startAt ?? 0;
  const endTime = transcript.custom?.endAt ?? 0;

  transcript.store.play({
    startTime: startTime,
    endTime: endTime,
  });
};

const TranscriptTime = ({ transcript }: TAny) => {
  return (
    <div>
      <Tag round={true}>{formatTranscriptTime(transcript.custom?.start)}</Tag>-
      <Tag round={true}>{formatTranscriptTime(transcript.custom?.end)}</Tag>
    </div>
  );
};

const OriginalTranscriptItem = ({
  transcripts,
  store,
}: {
  transcripts: TAny[];
  store: TAny;
}) => {
  const original = transcripts?.filter((t) => t.custom?.isOriginal);
  if (original.length === 0) return <></>;

  const originalTranscript = original[0];

  return (
    <div>
      <FlexContainer>
        <span style={{ fontSize: "1rem", fontWeight: "500" }}>
          Original
          <small>
            &nbsp;({getLangByCode(originalTranscript?.custom?.lang ?? "")?.name}
            )
          </small>
        </span>
        <TranscriptTime transcript={originalTranscript} />
        <Button
          onClick={() => playVideo(originalTranscript)}
          icon="volume-up"
          outlined={true}
          aria-label="share"
        />
        <EditTranscript transcript={originalTranscript} />
      </FlexContainer>
      <div style={{ padding: "0.5rem 0" }}>
        <EditableText
          placeholder="Edit subtitle..."
          defaultValue={originalTranscript?.text}
          multiline={true}
          minLines={3}
          maxLines={12}
          onConfirm={(value) => saveEdit(value, originalTranscript)}
        />
      </div>
    </div>
  );
};

const OtherTranscriptItem = ({
  transcripts,
  textToSpeech,
  store,
}: {
  transcripts: TAny[];
  textToSpeech: TAny;
  store: TAny;
}) => {
  const others = transcripts?.filter((t) => !t.custom?.isOriginal);
  if (others.length === 0) return <></>;

  const [selectedTranscript, setSelectedTranscript] = useState(others[0]);
  const [transcriptText, setTranscriptText] = useState(
    selectedTranscript?.text
  );

  const selectLang = (id: string) => {
    const item = others.find((t) => t.id === id);
    setSelectedTranscript(item);
    setTranscriptText(item?.text);
  };

  return (
    <div>
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
          {others.map((transcript: TAny) => (
            <option key={transcript?.id} value={transcript.id}>
              {getLangByCode(transcript?.custom?.lang)?.name ?? ""}
            </option>
          ))}
        </HTMLSelect>
      </FlexContainer>
      <div style={{ padding: "0.5rem 0" }}>
        <EditableText
          placeholder="Edit subtitle..."
          value={transcriptText}
          multiline={true}
          minLines={3}
          maxLines={12}
          onChange={(value) => setTranscriptText(value)}
          onConfirm={(value) => saveEdit(value, selectedTranscript)}
        />
      </div>
    </div>
  );
};

export const TranscriptTab = {
  name: "transcript-panel",
  Tab: (props: TAny) => (
    <SectionTab name="Transcript" {...props}>
      <FaRegListAlt />
    </SectionTab>
  ),
  // we need observer to update component automatically on any store changes
  Panel: observer(({ store }: TAny) => {
    const { videoEl } = useVideoElement({ store });
    const setCurrentLang = useLangStore((state: TAny) => state.setLang);
    const currentLang = useLangStore((state: TAny) => state.selectedLang);
    const [genId, setGenId] = useState("");
    const { updateSegmentTransitions } = useTransitions();

    const transcriptData: TAny = [];
    store.pages.forEach((page: PageType) => {
      page.children.forEach((element: ElementType) => {
        if (element.custom?.type === "transcript") {
          transcriptData.push(element);
        }
      });
    });

    const transcriptElements = transcriptData.sort(
      (a: TAny, b: TAny) => a.custom?.start - b.custom?.start
    );

    const groupTranscripts = transcriptElements.reduce(
      (acc: TAny, item: TAny) => {
        const key = `${item.custom?.id}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(item);
        return acc;
      },
      []
    );

    const checkActiveTranscript = (transcript: TAny) => {
      const isInRange =
        store.currentTime >= transcript?.startAt &&
        store.currentTime <= transcript?.endAt;
      return isInRange && store.currentTime > 0;
    };

    useEffect(() => {
      const activeTranscript = document.querySelector(".active-transcript");
      if (activeTranscript) {
        activeTranscript.scrollIntoView({ behavior: "smooth" });
      }
    }, [store.currentTime]);

    const textToSpeech = async (transcript: TAny) => {
      setGenId(transcript.id);
      // Mute original audio
      adjustVideoVolumn(0);

      const start = transcript.custom?.start;
      const end = transcript.custom?.end;
      const duration = (end - start) * 1000;
      const oldLang = currentLang;
      const transcriptLang = transcript.custom?.lang;

      const segments = {
        segments: [
          {
            text: transcript.text,
            language: transcriptLang,
            id: transcript.custom?.id,
            start,
            end,
          },
        ],
      };
      const response = await TranscriptApi.textToSpeech(segments);
      if (response?.outputFile) {
        setGenId("");
        const audioUrl = `${config.apiURL}/api/stream-audio/${response?.outputFile}`;
        const audio = new Audio();
        audio.src = audioUrl;

        // Play video and translated audio at the current range
        setCurrentLang(transcriptLang);
        playVideo(transcript);
        audio.play();

        audio.addEventListener("ended", () => {
          audio.remove();
        });

        // Set the original audio back after transcript done
        setTimeout(() => {
          adjustVideoVolumn(1);
          setCurrentLang(oldLang);
        }, duration);
      }
    };

    const adjustVideoVolumn = (volume: number) => {
      videoEl?.set({
        custom: {
          ...videoEl?.custom,
          volume,
        },
      });
    };

    return (
      <div>
        <FlexContainer>
          <h3>Transcript-based editing</h3>
        </FlexContainer>
        <ButtonGroup style={{ marginBottom: "0.8rem" }}>
          <GenTranscript store={store} />
          <TranslateTranscript store={store} />
          <ClearTranscript store={store} />
        </ButtonGroup>
        <TranscriptListContainer>
          {groupTranscripts?.map((transcripts: TAny) => (
            <TranscriptContainer
              $activeBg={
                checkActiveTranscript(transcripts[0]?.custom) ? "#72CA9B" : ""
              }
              className={
                checkActiveTranscript(transcripts[0]?.custom)
                  ? "active-transcript"
                  : ""
              }
              key={transcripts[0]?.id}
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
                  <div style={{ fontSize: "1.2rem", fontWeight: "500" }}>
                    Speaker
                  </div>
                  <Switch
                    alignIndicator="right"
                    labelElement={<em>Transition</em>}
                    style={{ marginBottom: 0 }}
                    onChange={() => {
                      updateSegmentTransitions({
                        transitionForSegmentId: transcripts[0]?.custom.id,
                        time: transcripts[0]?.custom?.startAt,
                      });
                    }}
                  />
                </div>
              </FlexContainer>
              <Divider />
              <OriginalTranscriptItem store={store} transcripts={transcripts} />
              <OtherTranscriptItem
                textToSpeech={textToSpeech}
                transcripts={transcripts}
                store={store}
              />
            </TranscriptContainer>
          ))}
        </TranscriptListContainer>
      </div>
    );
  }),
};
