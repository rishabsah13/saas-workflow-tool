import { sampleWorkflow } from "@/lib/sample-data";
import { Workflow, WorkflowRun } from "@/lib/types";

const workflowStore = new Map<string, Workflow>();
const runStore = new Map<string, WorkflowRun[]>();

if (!workflowStore.has(sampleWorkflow.id)) {
  workflowStore.set(sampleWorkflow.id, sampleWorkflow);
}

export async function listWorkflows() {
  return Array.from(workflowStore.values()).sort(
    (a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt),
  );
}

export async function getWorkflowById(id: string) {
  return workflowStore.get(id) ?? null;
}

export async function saveWorkflow(workflow: Workflow) {
  const updated: Workflow = {
    ...workflow,
    updatedAt: new Date().toISOString(),
  };

  workflowStore.set(workflow.id, updated);
  return updated;
}

type CreateWorkflowInput = {
  name?: string;
  triggerType?: string;
  samplePayload?: string;
  steps?: Array<{
    id: string;
    type: string;
    name: string;
    config?: Record<string, string>;
  }>;
};

export async function createWorkflow(input?: CreateWorkflowInput) {
  const now = new Date().toISOString();

  const workflow: Workflow = {
    id: crypto.randomUUID(),
    name: input?.name?.trim() || "Untitled workflow",
    status: "DRAFT",
    triggerType: input?.triggerType || "MANUAL",
    samplePayload: input?.samplePayload || "{\n  \n}",
    steps:
      input?.steps?.map((step, index) => ({
        ...step,
        id: step.id || crypto.randomUUID(),
        workflowId: "",
        position: index + 1,
      })) ?? [],
    createdAt: now,
    updatedAt: now,
  };

  workflow.steps = workflow.steps.map((step) => ({
    ...step,
    workflowId: workflow.id,
  }));

  workflowStore.set(workflow.id, workflow);
  return workflow;
}

export async function deleteWorkflow(id: string) {
  runStore.delete(id);
  return workflowStore.delete(id);
}

export async function duplicateWorkflow(id: string) {
  const existing = workflowStore.get(id);
  if (!existing) return null;

  const now = new Date().toISOString();

  const duplicated: Workflow = {
    ...existing,
    id: crypto.randomUUID(),
    name: `${existing.name} Copy`,
    createdAt: now,
    updatedAt: now,
    steps: existing.steps.map((step, index) => ({
      ...step,
      id: crypto.randomUUID(),
      workflowId: "",
      position: index + 1,
    })),
  };

  duplicated.steps = duplicated.steps.map((step) => ({
    ...step,
    workflowId: duplicated.id,
  }));

  workflowStore.set(duplicated.id, duplicated);
  return duplicated;
}

export async function publishWorkflow(id: string) {
  const workflow = workflowStore.get(id);
  if (!workflow) return null;

  const updated: Workflow = {
    ...workflow,
    status: workflow.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED",
    updatedAt: new Date().toISOString(),
  };

  workflowStore.set(id, updated);
  return updated;
}

export async function listWorkflowRuns(workflowId: string) {
  return runStore.get(workflowId) ?? [];
}

export async function createWorkflowRun(workflowId: string) {
  const workflow = workflowStore.get(workflowId);
  if (!workflow) return null;

  const run: WorkflowRun = {
    id: crypto.randomUUID(),
    workflowId,
    workflowName: workflow.name,
    status: workflow.steps.length > 0 ? "SUCCESS" : "FAILED",
    input: workflow.samplePayload,
    steps: workflow.steps,
    output: {
      preview: {
        summary:
          workflow.steps.length > 0
            ? "Workflow executed successfully in mock mode."
            : "Workflow has no steps to execute.",
      },
    },
    createdAt: new Date().toISOString(),
  };

  const existing = runStore.get(workflowId) ?? [];
  runStore.set(workflowId, [run, ...existing]);

  return run;
}

export async function getWorkflowRun(workflowId: string, runId: string) {
  const runs = runStore.get(workflowId) ?? [];
  return runs.find((run) => run.id === runId) ?? null;
}