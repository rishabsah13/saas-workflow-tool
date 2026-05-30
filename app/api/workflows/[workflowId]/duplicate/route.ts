import { NextRequest, NextResponse } from "next/server";
import { duplicateWorkflow } from "@/lib/mock-db";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ workflowId: string }> }
) {
  const { workflowId } = await context.params;
  const workflow = await duplicateWorkflow(workflowId);

  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  return NextResponse.json(workflow, { status: 201 });
}