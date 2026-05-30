// lib/ai.ts
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

type RunAiEnrichmentArgs = {
  prompt: string;
  input: any;
};

export async function runAiEnrichment({ prompt, input }: RunAiEnrichmentArgs) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini", // or your chosen model
    messages: [
      {
        role: "system",
        content:
          "You are an AI that enriches workflow test runs. Return a concise JSON object describing the result.",
      },
      {
        role: "user",
        content: `${prompt}\n\nHere is the input JSON:\n${JSON.stringify(
          input,
          null,
          2,
        )}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const message = completion.choices[0]?.message;

  // message.content should be a JSON string because of response_format
  const rawContent = message?.content ?? "";

  let parsed: any;
  try {
    parsed = typeof rawContent === "string" ? JSON.parse(rawContent) : rawContent;
  } catch {
    // Fallback: wrap raw content
    parsed = { summary: rawContent };
  }

  return parsed;
}