import { NextRequest, NextResponse } from "next/server";
import { deleteWorkflow, getWorkflowById, saveWorkflow } from "@/lib/mock-db";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ workflowId: string }> }
) {
  const { workflowId } = await context.params;
  const workflow = await getWorkflowById(workflowId);

  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  return NextResponse.json(workflow);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ workflowId: string }> }
) {
  const { workflowId } = await context.params;
  const body = await request.json();

  if (!body || body.id !== workflowId) {
    return NextResponse.json({ error: "Invalid workflow payload" }, { status: 400 });
  }

  const saved = await saveWorkflow(body);
  return NextResponse.json(saved);
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ workflowId: string }> }
) {
  const { workflowId } = await context.params;
  const deleted = await deleteWorkflow(workflowId);

  if (!deleted) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}