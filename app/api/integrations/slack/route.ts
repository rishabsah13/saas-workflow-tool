import { NextRequest, NextResponse } from "next/server";
import { sendSlackMessage } from "@/lib/integrations/slack";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = body.text;

    await sendSlackMessage(text);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to send Slack message" },
      { status: 500 }
    );
  }
}