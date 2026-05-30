import { NextRequest, NextResponse } from "next/server";
import { createWorkflow, listWorkflows } from "@/lib/mock-db";

export async function GET() {
  const workflows = await listWorkflows();
  return NextResponse.json(workflows);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  const workflow = await createWorkflow({
    name: body?.name,
    triggerType: body?.triggerType,
    samplePayload: body?.samplePayload,
    steps: body?.steps,
  });

  return NextResponse.json(workflow, { status: 201 });
}