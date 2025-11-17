import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";

import { streamText, UIMessage, convertToModelMessages } from "ai";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  // const result = streamText({
  //   model: openai("gpt-5-nano"),
  //   messages: convertToModelMessages(messages),
  // });
  const result = streamText({
    model: google("gemini-2.0-flash"),
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
