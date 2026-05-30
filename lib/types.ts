export type TriggerType = "MANUAL" | "WEBHOOK";
export type WorkflowStatus = "DRAFT" | "PUBLISHED";
export type StepType = "AI" | "CONDITION" | "ACTION";

export interface Workflow {
  id: string;
  name: string;
  status: WorkflowStatus;
  triggerType: TriggerType;
  createdAt: string;
  updatedAt: string;
  steps: WorkflowStep[];
  samplePayload?: string;
}

export interface WorkflowStep {
  id: string;
  workflowId: string;
  type: StepType;
  name: string;
  position: number;
  config: AIConfig | ConditionConfig | ActionConfig;
}

export interface AIConfig {
  prompt: string;
  inputKey: string;
  outputKeys: string[];
}

export interface ConditionConfig {
  field: string;
  operator: "equals" | "contains" | "gt" | "lt";
  value: string;
}

export interface ActionConfig {
  provider: "slack" | "hubspot" | "email";
  action: string;
  payloadTemplate: Record<string, string>;
}

export type NewStepType = "AI" | "CONDITION" | "ACTION";



export interface WorkflowRun {
  id: string;
  workflowId: string;
  workflowName?: string;
  status: string;
  input: any;
  steps: any[];
  output: any;
  createdAt: string;
}