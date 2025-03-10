import { config } from "../constants";
import { TAny } from "../types/common";
import { TTranscriptDTO } from "../types/transcript";

export const TranscriptApi = {
  genTranscript: async (
    file: File,
    language = "en"
  ): Promise<TTranscriptDTO> => {
    const formdata = new FormData();
    formdata.append("file", file);
    formdata.append("language", language);

    const requestOptions = {
      method: "POST",
      body: formdata,
      redirect: "follow",
    };

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

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    const response = await fetch(
      `${config.apiURL}/api/translate`,
      requestOptions as any
    );
    const result = await response.json();
    return result;
  },

  downloadVideo: async (segments: TAny) => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify(segments);

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    const response = await fetch(
      `${config.apiURL}/api/download-video`,
      requestOptions as any
    );
    const result = await response.json();
    return result;
  },

  exportVideo: async (file: File, body: TAny) => {
    const formdata = new FormData();
    formdata.append("video", file);
    formdata.append("elements", JSON.stringify(body));

    const requestOptions = {
      method: "POST",
      body: formdata,
      redirect: "follow",
    };

    const response = await fetch(
      `${config.apiURL}/process-video`,
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

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    const response = await fetch(
      `${config.apiURL}/api/process-tts-text`,
      requestOptions as any
    );

    const result = await response.json();
    return result;
  },
};
