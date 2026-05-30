// lib/mock-db.ts
import {
  Workflow,
  WorkflowRun,
  WorkflowStep,
  TriggerType,
  WorkflowStatus,
  StepType,
  AIConfig,
  ActionConfig,
  ConditionConfig,
} from "@/lib/types";

// -------- Type-safe input shapes --------

export type CreateWorkflowStepInput = {
  id?: string;
  type: StepType;
  name: string;
  config: AIConfig | ActionConfig | ConditionConfig;
};

export type CreateWorkflowInput = {
  name?: string;
  triggerType?: TriggerType;
  status?: WorkflowStatus;
  samplePayload?: string;
  steps?: CreateWorkflowStepInput[];
};

export type CreateWorkflowRunInput = Omit<
  WorkflowRun,
  "id" | "createdAt"
>;

// -------- In-memory mock storage --------

const workflows: Workflow[] = [];
const workflowRuns: WorkflowRun[] = [];

// -------- Helpers & type guards --------

const TRIGGER_TYPES = ["MANUAL", "WEBHOOK"] as const;
const STEP_TYPES = ["AI", "CONDITION", "ACTION"] as const;

function isTriggerType(value: unknown): value is TriggerType {
  return (
    typeof value === "string" &&
    (TRIGGER_TYPES as readonly string[]).includes(value)
  );
}

function isStepType(value: unknown): value is StepType {
  return (
    typeof value === "string" &&
    (STEP_TYPES as readonly string[]).includes(value)
  );
}

// Default configs – tweak as needed
const defaultAIConfig: AIConfig = {
  inputKey: "ticket_text",
  prompt: "Summarize the ticket and extract category and priority.",
  outputKeys: ["summary", "category", "priority"],
};

const defaultConditionConfig: ConditionConfig = {
  field: "priority",
  operator: "equals",
  value: "high",
};

const defaultActionConfig: ActionConfig = {
  provider: "slack",
  action: "send_message",
  payloadTemplate: {
    channel: "#support",
    text: "High priority ticket detected: {{summary}}",
  },
};

// -------- Core helpers (internal) --------

function _buildStep(
  workflowId: string,
  step: CreateWorkflowStepInput,
  index: number,
): WorkflowStep {
  const stepId = step.id ?? crypto.randomUUID();
  const type: StepType = isStepType(step.type) ? step.type : "AI";

  let config: AIConfig | ActionConfig | ConditionConfig = step.config;
  if (type === "AI") {
    config = {
      ...defaultAIConfig,
      ...(step.config as AIConfig | undefined),
    };
  } else if (type === "CONDITION") {
    config = {
      ...defaultConditionConfig,
      ...(step.config as ConditionConfig | undefined),
    };
  } else {
    config = {
      ...defaultActionConfig,
      ...(step.config as ActionConfig | undefined),
    };
  }

  return {
    id: stepId,
    workflowId,
    type,
    name: step.name || "Untitled step",
    position: index + 1,
    config,
  };
}

// -------- Workflow CRUD --------

export function createWorkflow(input: CreateWorkflowInput = {}): Workflow {
  const now = new Date().toISOString();
  const workflowId = crypto.randomUUID();

  const status: WorkflowStatus = input.status ?? "DRAFT";
  const triggerType: TriggerType = isTriggerType(input.triggerType)
    ? input.triggerType
    : "MANUAL";

  const steps: WorkflowStep[] =
    input.steps?.map((step, index) => _buildStep(workflowId, step, index)) ??
    [];

  const workflow: Workflow = {
    id: workflowId,
    name: input.name?.trim() || "Untitled workflow",
    status,
    triggerType,
    createdAt: now,
    updatedAt: now,
    samplePayload: input.samplePayload || "{\n  \n}",
    steps,
  };

  workflows.push(workflow);
  return workflow;
}

export function listWorkflows(): Workflow[] {
  return workflows;
}

export function getWorkflow(id: string): Workflow | undefined {
  return workflows.find((w) => w.id === id);
}

// alias to match route import
export function getWorkflowById(id: string): Workflow | undefined {
  return getWorkflow(id);
}

export function updateWorkflow(
  id: string,
  patch: CreateWorkflowInput = {},
): Workflow | undefined {
  const idx = workflows.findIndex((w) => w.id === id);
  if (idx === -1) return undefined;

  const existing = workflows[idx];
  const now = new Date().toISOString();

  const status: WorkflowStatus = patch.status ?? existing.status;
  const triggerType: TriggerType = isTriggerType(patch.triggerType)
    ? patch.triggerType
    : existing.triggerType;

  let steps: WorkflowStep[] = existing.steps;

  if (patch.steps) {
    steps = patch.steps.map((step, index) =>
      _buildStep(existing.id, step, index),
    );
  }

  const updated: Workflow = {
    ...existing,
    name: patch.name?.trim() || existing.name,
    status,
    triggerType,
    samplePayload: patch.samplePayload ?? existing.samplePayload,
    steps,
    updatedAt: now,
  };

  workflows[idx] = updated;
  return updated;
}

// matches import { saveWorkflow } from "@/lib/mock-db"
export function saveWorkflow(
  id: string,
  patch: CreateWorkflowInput = {},
): Workflow | undefined {
  // simple semantics: update existing workflow by id
  return updateWorkflow(id, patch);
}

// matches import { deleteWorkflow } from "@/lib/mock-db"
export function deleteWorkflow(id: string): boolean {
  const idx = workflows.findIndex((w) => w.id === id);
  if (idx === -1) return false;
  workflows.splice(idx, 1);
  return true;
}

// matches import { duplicateWorkflow } from "@/lib/mock-db"
export function duplicateWorkflow(id: string): Workflow | undefined {
  const existing = getWorkflow(id);
  if (!existing) return undefined;

  const now = new Date().toISOString();
  const newId = crypto.randomUUID();

  const duplicatedSteps: WorkflowStep[] = existing.steps.map((step, index) => ({
    ...step,
    id: crypto.randomUUID(),
    workflowId: newId,
    position: index + 1,
  }));

  const copy: Workflow = {
    ...existing,
    id: newId,
    name: existing.name + " (Copy)",
    status: "DRAFT",
    createdAt: now,
    updatedAt: now,
    steps: duplicatedSteps,
  };

  workflows.push(copy);
  return copy;
}

// matches import { publishWorkflow } from "@/lib/mock-db"
export function publishWorkflow(id: string): Workflow | undefined {
  const existing = getWorkflow(id);
  if (!existing) return undefined;
  return updateWorkflow(id, { status: "PUBLISHED" });
}

// -------- Workflow runs --------

export function createWorkflowRun(
  input: CreateWorkflowRunInput,
): WorkflowRun {
  const now = new Date().toISOString();

  const run: WorkflowRun = {
    id: crypto.randomUUID(),
    createdAt: now,
    ...input,
  };

  workflowRuns.push(run);
  return run;
}

export function listWorkflowRuns(workflowId?: string): WorkflowRun[] {
  if (!workflowId) return workflowRuns;
  return workflowRuns.filter((run) => run.workflowId === workflowId);
}

export function getWorkflowRun(id: string): WorkflowRun | undefined {
  return workflowRuns.find((run) => run.id === id);
}