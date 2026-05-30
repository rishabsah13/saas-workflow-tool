// app/api/ai/enrich/route.ts
import { NextRequest, NextResponse } from "next/server";
import { runAiEnrichment } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: "JSON payload is required" },
        { status: 400 },
      );
    }

    const prompt = body.prompt?.trim();
    const input = body.input;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    if (input == null) {
      return NextResponse.json(
        { error: "Input is required" },
        { status: 400 },
      );
    }

    try {
      const result = await runAiEnrichment({ prompt, input });

      return NextResponse.json(
        {
          ok: true,
          source: "openai",
          result,
        },
        { status: 200 },
      );
    } catch (error: any) {
      console.error("OpenAI enrich error", error);

      return NextResponse.json(
        {
          ok: true,
          source: "fallback",
          result: {
            summary: "AI provider unavailable, using fallback enrichment.",
            category: "General",
            priority: "medium",
            suggestedAction: "Review this workflow run manually.",
            inputPreview: input,
          },
        },
        { status: 200 },
      );
    }
  } catch (error: any) {
    console.error("AI enrich route error", error);

    return NextResponse.json(
      { error: error?.message || "Failed to run AI enrichment" },
      { status: 500 },
    );
  }
}