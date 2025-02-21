import { SectionTab } from "polotno/side-panel";
import { observer } from "mobx-react-lite";
import {
  Tag,
  Button,
  EditableText,
  ButtonGroup,
  Divider,
} from "@blueprintjs/core";
import { FaRegListAlt } from "react-icons/fa";
import { formatTime, getLangByCode } from "../../shared/utils/common";
import styled from "styled-components";
import { TAny } from "../../shared/types/common";
import { PageType } from "polotno/model/page-model";
import { ElementType } from "polotno/model/group-model";
import GenTranscript from "./GenTranscript";
import { useEffect } from "react";
import { ClearTranscript } from "./ClearTranscript";
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

export const TranscriptTab = {
  name: "transcript-panel",
  Tab: (props: TAny) => (
    <SectionTab name="Transcript" {...props}>
      <FaRegListAlt />
    </SectionTab>
  ),
  // we need observer to update component automatically on any store changes
  Panel: observer(({ store }: TAny) => {
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

    const formatTranscriptTime = (time: number) => {
      return formatTime(time);
    };

    // Play video at the specifc duration
    const playVideo = (transcript: TAny) => {
      const startTime = transcript.custom?.startAt ?? 0;
      const endTime = transcript.custom?.endAt ?? 0;
      transcript.store.play({ startTime: startTime, endTime: endTime });
    };

    const saveEdit = (value: string, transcript: TAny) => {
      if (!value) return;

      const element = store.getElementById(transcript.id);
      element.set({
        text: value,
      });
    };

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
                <span style={{ fontSize: "1.2rem", fontWeight: "500" }}>
                  Speaker:
                </span>
                <div>
                  <Tag onClick={() => playVideo(transcripts[0])} round={true}>
                    {formatTranscriptTime(transcripts[0].custom?.start)}
                  </Tag>
                  -
                  <Tag round={true}>
                    {formatTranscriptTime(transcripts[0].custom?.end)}
                  </Tag>
                </div>
              </FlexContainer>
              <Divider />
              {transcripts.map((transcript: TAny) => (
                <div key={`sub-${transcript?.id}`}>
                  <FlexContainer>
                    <div>
                      <span style={{ fontSize: "1rem", fontWeight: "500" }}>
                        {getLangByCode(transcript?.custom?.lang ?? "")?.name}
                      </span>
                    </div>
                  </FlexContainer>
                  <div style={{ padding: "0.5rem 0" }}>
                    <EditableText
                      placeholder="Edit subtitle..."
                      defaultValue={transcript.text}
                      multiline={true}
                      minLines={3}
                      maxLines={12}
                      onConfirm={(value) => saveEdit(value, transcript)}
                    />
                  </div>
                </div>
              ))}
            </TranscriptContainer>
          ))}
        </TranscriptListContainer>
      </div>
    );
  }),
};
