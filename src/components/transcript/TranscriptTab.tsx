import { SectionTab } from "polotno/side-panel";
import { observer } from "mobx-react-lite";
import { ButtonGroup } from "@blueprintjs/core";
import { FaRegListAlt } from "react-icons/fa";
import { TAny } from "../../shared/types/common";
import { PageType } from "polotno/model/page-model";
import { ElementType } from "polotno/model/group-model";
import GenTranscript from "./GenTranscript";
import { useEffect } from "react";
import { ClearTranscript } from "./ClearTranscript";
import TranslateTranscript from "./TranslateTranscript";
import { TranscriptApi } from "../../shared/services/transcript.api";
import { config } from "../../shared/constants";
import { useLangStore } from "../../shared/zustand/language";
import { useVideoStore } from "../../shared/zustand/video";
import EditAllTranscript from "./EditAllTranscript";
import { FlexContainer, TranscriptListContainer } from "./elements/CommonStyle";

import TranscriptItem from "./TranscriptItem";

export const TranscriptTab = {
  name: "transcript-panel",
  Tab: (props: TAny) => (
    <SectionTab name="Transcript" {...props}>
      <FaRegListAlt />
    </SectionTab>
  ),
  // we need observer to update component automatically on any store changes
  Panel: observer(({ store }: TAny) => {
    const setCurrentLang = useLangStore((state: TAny) => state.setLang);
    const currentLang = useLangStore((state: TAny) => state.selectedLang);

    const playRange = useVideoStore((state: any) => state.playRange);

    // Play video at the specifc duration
    const playVideoAtRange = async (transcript: TAny) => {
      const startTime = transcript?.custom?.start ?? 0;
      const endTime = transcript?.custom?.end ?? 0;
      playRange(startTime, endTime);
    };

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

    const checkActiveTranscript = (startAt: number, endAt: number) => {
      const isInRange =
        store.currentTime >= startAt && store.currentTime <= endAt;
      return isInRange && store.currentTime > 0;
    };

    useEffect(() => {
      const activeTranscript = document.querySelector(".active-transcript");
      if (activeTranscript) {
        activeTranscript.scrollIntoView({ behavior: "smooth" });
      }
    }, [store.currentTime]);

    const textToSpeech = async (transcript: TAny) => {
      const start = transcript?.custom?.start;
      const end = transcript?.custom?.end;
      const duration = (end - start) * 1000;
      const oldLang = currentLang;
      const transcriptLang = transcript?.custom?.lang;

      const segments = {
        segments: [
          {
            text: transcript.text,
            language: transcriptLang,
            id: transcript?.custom?.id,
            start,
            end,
          },
        ],
      };
      const response = await TranscriptApi.textToSpeech(segments);
      if (response?.outputFile) {
        const audioUrl = `${config.apiURL}/api/stream-audio/${response?.outputFile}`;
        const audio = new Audio();
        audio.src = audioUrl;

        // Play video and translated audio at the current range
        setCurrentLang(transcriptLang);
        playVideoAtRange(transcript);
        audio.play();

        audio.addEventListener("ended", () => {
          audio.remove();
        });

        // Set the original audio back after transcript done
        setTimeout(() => {
          setCurrentLang(oldLang);
        }, duration);
      }
    };

    return (
      <div>
        <FlexContainer>
          <h3>Transcript-based editing</h3>
        </FlexContainer>
        <ButtonGroup style={{ marginBottom: "0.8rem" }}>
          <GenTranscript store={store} />
          <TranslateTranscript store={store} />
          <EditAllTranscript store={store} />
          <ClearTranscript store={store} />
        </ButtonGroup>
        <TranscriptListContainer>
          {groupTranscripts?.map((transcripts: TAny) => (
            <TranscriptItem
              key={transcripts[0]?.id}
              isActive={checkActiveTranscript(
                transcripts[0]?.custom?.startAt,
                transcripts[0]?.custom?.endAt
              )}
              textToSpeech={textToSpeech}
              transcripts={transcripts}
            />
          ))}
        </TranscriptListContainer>
      </div>
    );
  }),
};
