import { TextElementType } from "polotno/model/text-model";

export interface TTranscriptElement extends Partial<TextElementType> {
  custom: {
    // In milisecond unit
    startAt: number;
    duration: number;
    endAt: number;
    // In second unit
    start: number;
    end: number;

    // Other
    type: "transcript";
    id: number;
    lang: string;
    isOriginal?: boolean;
    isTranscriptModified: boolean;
    audioLength?: number;
    audioPath?: string;
  };
}

export interface TTranscriptItemDTO {
  audioLength?: number;
  audioPath?: string;
  end: number;
  id: number;
  start: number;
  text: string;
}

export interface TTranscriptDTO {
  segments: TTranscriptItemDTO[];
  success: boolean;
  processId?: string;
}

export interface TTextToSpeechDTO {
  length: number;
  outputFile: string;
}
