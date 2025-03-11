import { config } from "../constants";
import { TAny } from "../types/common";
import { TTranscriptDTO } from "../types/transcript";

const createPostRequestOptions = ({
  headers,
  body,
}: {
  headers?: HeadersInit;
  body: BodyInit;
}): RequestInit => {
  return {
    method: "POST",
    headers,
    body,
    redirect: "follow",
  };
};

export const TranscriptApi = {
  genTranscript: async (
    file: File,
    language = "en"
  ): Promise<TTranscriptDTO> => {
    const formdata = new FormData();
    formdata.append("file", file);
    formdata.append("language", language);

    const requestOptions = createPostRequestOptions({ body: formdata });

    const response = await fetch(
      `${config.apiURL}/api/upload`,
      requestOptions as any
    );
    const result = await response.json();
    return result;
  },

  translateTranscript: async (segments: TAny): Promise<TTranscriptDTO> => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify(segments);

    const requestOptions = createPostRequestOptions({
      headers: { "Content-Type": "application/json" },
      body: raw,
    });

    const response = await fetch(
      `${config.apiURL}/api/translate`,
      requestOptions as any
    );
    const result = await response.json();
    return result;
  },

  exportVideo: async (segments: TAny) => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify(segments);

    const requestOptions = createPostRequestOptions({
      headers: myHeaders,
      body: raw,
    });

    const response = await fetch(
      `${config.apiURL}/api/export-video`,
      requestOptions as any
    );
    const result = await response.json();
    return result;
  },

  downloadVideo: async (filepath: string) => {
    const requestOptions = createPostRequestOptions({
      body: JSON.stringify({ filepath }),
    });

    const response = await fetch(
      `${config.apiURL}/api/download-video`,
      requestOptions as any
    );
    const blob = await response.blob();

    // Convert the Blob to a File
    const video = new File(
      [blob],
      new Date().getTime() + "_exported_video.mp4",
      { type: "video/mp4" }
    );

    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(video);
    downloadLink.download = "video.mp4";
    downloadLink.click();

    setTimeout(() => {
      downloadLink.remove();
    }, 1000);
  },

  textToSpeech: async (segments: TAny) => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify(segments);

    const requestOptions = createPostRequestOptions({
      headers: myHeaders,
      body: raw,
    });

    const response = await fetch(
      `${config.apiURL}/api/process-tts-text`,
      requestOptions as any
    );

    const result = await response.json();
    return result;
  },
};
