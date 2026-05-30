import { NextRequest, NextResponse } from "next/server";
import { workflowRuns } from "@/lib/run-store";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ workflowId: string; runId: string }> },
) {
  const { workflowId, runId } = await params;

  const run = workflowRuns.get(runId);

  if (!run || run.workflowId !== workflowId) {
    return NextResponse.json(
      { error: "Run not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(run, { status: 200 });
}