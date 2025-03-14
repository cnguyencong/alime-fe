import { SectionTab } from "polotno/side-panel";
import { observer } from "mobx-react-lite";
import { ButtonGroup } from "@blueprintjs/core";
import { FaRegListAlt } from "react-icons/fa";
import { TAny } from "../../shared/types/common";
import { PageType } from "polotno/model/page-model";
import { ElementType } from "polotno/model/group-model";
import GenTranscript from "./actions/GenTranscript";
import { useEffect } from "react";
import { ClearTranscript } from "./actions/ClearTranscript";
import TranslateTranscript from "./actions/TranslateTranscript";
import { TranscriptApi } from "../../shared/services/transcript.api";
import { useLangStore } from "../../shared/zustand/language";
import { useVideoStore } from "../../shared/zustand/video";
import EditAllTranscript from "./actions/EditAllTranscript";
import { FlexContainer, TranscriptListContainer } from "./elements/CommonStyle";

import TranscriptItem from "./TranscriptItem";
import {
  TTextToSpeechDTO,
  TTranscriptElement,
} from "../../shared/types/transcript";
import { StoreType } from "polotno/model/store";

export const TranscriptTab = {
  name: "transcript-panel",
  Tab: (props: TAny) => (
    <SectionTab name="Transcript" {...props}>
      <FaRegListAlt />
    </SectionTab>
  ),
  // we need observer to update component automatically on any store changes
  Panel: observer(({ store }: { store: StoreType }) => {
    const setCurrentLang = useLangStore((state) => state.setLang);
    const currentLang = useLangStore((state) => state.selectedLang);

    const playRange = useVideoStore((state) => state.playRange);
    const currentTime = useVideoStore((state) => state.currentTime);
    const mute = useVideoStore((state) => state.mute);
    const unmute = useVideoStore((state) => state.unmute);

    // Play video at the specifc duration
    const playVideoAtRange = async (transcript: TTranscriptElement) => {
      const startTime = transcript?.custom?.start ?? 0;
      const endTime = transcript?.custom?.end ?? 0;
      playRange(startTime, endTime);
    };

    const transcriptData: TTranscriptElement[] = [];
    store.pages.forEach((page: PageType) => {
      page.children.forEach((element: ElementType) => {
        if (element.custom?.type === "transcript") {
          transcriptData.push(element as TTranscriptElement);
        }
      });
    });

    const transcriptElements = transcriptData.sort(
      (a: TTranscriptElement, b: TTranscriptElement) =>
        a.custom?.start - b.custom?.start
    );

    const groupTranscripts = transcriptElements.reduce(
      (acc: TAny, item: TTranscriptElement) => {
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
      const isInRange = currentTime >= startAt && currentTime <= endAt;
      return isInRange && currentTime > 0;
    };

    useEffect(() => {
      const activeTranscript = document.querySelector(".active-transcript");
      if (activeTranscript) {
        activeTranscript.scrollIntoView({ behavior: "smooth" });
      }
    }, [currentTime]);

    const textToSpeech = async (transcript: TTranscriptElement) => {
      if (!transcript.text) return;

      const customVal = transcript?.custom;
      const start = customVal?.start;
      const end = customVal?.end;
      const duration = (end - start) * 1000;
      const oldLang = currentLang;
      const transcriptLang = customVal?.lang;

      let audioPath = customVal?.audioPath;

      if (customVal?.isTranscriptModified || !audioPath) {
        const request = {
          text: transcript.text,
          language: transcriptLang,
        };

        const response = await TranscriptApi.textToSpeech(request);
        audioPath = response.outputFile;
        updateTranscript(transcript, response);
      }

      const audioBlob = await TranscriptApi.getTranscriptAudio(audioPath);
      const audioUrl = URL.createObjectURL(audioBlob);
      playTranslatedVoice(
        audioUrl,
        duration,
        transcriptLang,
        transcript,
        oldLang
      );
    };

    const updateTranscript = (
      transcript: TTranscriptElement,
      response: TTextToSpeechDTO
    ) => {
      if (!transcript?.set) return;

      transcript.set({
        custom: {
          ...transcript.custom,
          audioLength: response?.length,
          audioPath: response?.outputFile,
          isTranscriptModified: false, // We reset it back since we got new generated audio
        },
      });
    };

    const playTranslatedVoice = (
      audioUrl: string,
      duration: number,
      transcriptLang: string,
      transcript: TTranscriptElement,
      oldLang: string
    ) => {
      try {
        mute(); // We mute the original video sound

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
          unmute();
        }, duration);
      } catch (error) {
        unmute();
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
          {groupTranscripts?.map(
            (transcripts: TTranscriptElement[], index: number) => (
              <TranscriptItem
                key={index}
                isActive={checkActiveTranscript(
                  transcripts[0]?.custom?.start,
                  transcripts[0]?.custom?.end
                )}
                textToSpeech={textToSpeech}
                transcripts={transcripts}
              />
            )
          )}
        </TranscriptListContainer>
      </div>
    );
  }),
};
