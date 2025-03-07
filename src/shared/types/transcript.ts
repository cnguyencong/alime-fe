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
