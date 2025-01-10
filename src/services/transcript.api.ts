export const TranscriptApi = {
  genTranscript: async (file: File, language = "en") => {
    const formdata = new FormData();
    formdata.append("file", file);
    formdata.append("language", language);

    const requestOptions = {
      method: "POST",
      body: formdata,
      redirect: "follow",
    };

    console.log(requestOptions);

    const response = await fetch(
      "https://7753-117-2-155-123.ngrok-free.app/api/upload",
      requestOptions
    );
    const result = await response.json();
    return result;
  },
};
