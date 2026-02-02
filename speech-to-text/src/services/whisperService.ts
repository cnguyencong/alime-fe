import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(apiKey || "dummy-key-for-ui-render");

export interface TranscriptionResult {
  text: string;
  language?: string;
}

/**
 * Convert Blob to Gemini audio part format
 */
const fileToGenerativePart = async (blob: Blob) => {
  return new Promise<{ inlineData: { data: string; mimeType: string } }>(
    (resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = (reader.result as string).split(",")[1];
        resolve({
          inlineData: {
            data: base64Data,
            mimeType: blob.type || "audio/webm",
          },
        });
      };
      reader.readAsDataURL(blob);
    },
  );
};

/**
 * Transcribe audio using Gemini 2.0 Flash API
 * @param audioBlob - Recorded audio blob
 * @returns Transcribed text
 */
export async function transcribeAudio(
  audioBlob: Blob,
): Promise<TranscriptionResult> {
  try {
    // Check if API key is configured
    if (!apiKey) {
      throw new Error(
        "Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env.local file.",
      );
    }

    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    // Convert blob to Gemini format
    const audioPart = await fileToGenerativePart(audioBlob);

    // Create the prompt
    const prompt =
      "Transcribe the following audio. Only return the transcribed text, nothing else.";

    // Send audio to Gemini
    const result = await model.generateContent([prompt, audioPart]);
    const response = result.response;
    const text = response.text();

    return {
      text: text.trim(),
      language: undefined,
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to transcribe audio",
    );
  }
}
