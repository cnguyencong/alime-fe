import { TextElementType } from "polotno/model/text-model";

export interface TTranscriptElement extends Partial<TextElementType> {
  custom: {
    startAt: number;
    duration: number;
    endAt: number;
    type: "transcript";
    start: number;
    end: number;
    id: number;
    lang: string;
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
