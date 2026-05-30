import { NextRequest, NextResponse } from "next/server";
import { publishWorkflow } from "@/lib/mock-db";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ workflowId: string }> }
) {
  const { workflowId } = await context.params;
  const updated = await publishWorkflow(workflowId);

  if (!updated) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}