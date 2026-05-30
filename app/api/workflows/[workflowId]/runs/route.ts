import { NextRequest, NextResponse } from "next/server";
import { workflowRuns } from "@/lib/run-store";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> },
) {
  try {
    const { workflowId } = await params;
    const body = await request.json().catch(() => ({}));

    const run = {
      id: crypto.randomUUID(),
      workflowId,
      workflowName: body?.workflowName ?? "Untitled workflow",
      status: body?.status ?? "SUCCESS",
      input: body?.input ?? {},
      steps: body?.steps ?? [],
      output: body?.output ?? {},
      createdAt: new Date().toISOString(),
    };

    workflowRuns.set(run.id, run);

    return NextResponse.json(run, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to save run" },
      { status: 500 },
    );
  }
}