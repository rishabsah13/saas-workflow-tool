import { Workflow } from "./types";

export const sampleWorkflow: Workflow = {
  id: "wf_demo_1",
  name: "Support ticket triage",
  status: "DRAFT",
  triggerType: "MANUAL",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  steps: [
    {
      id: "step_1",
      workflowId: "wf_demo_1",
      type: "AI",
      name: "Classify ticket",
      position: 1,
      config: {
        prompt: "Classify the support ticket by urgency and category",
        inputKey: "ticket_text",
        outputKeys: ["summary", "priority", "category"],
      },
    },
    {
      id: "step_2",
      workflowId: "wf_demo_1",
      type: "ACTION",
      name: "Notify Slack",
      position: 2,
      config: {
        provider: "slack",
        action: "send_message",
        payloadTemplate: {
          channel: "#support",
          text: "New {{priority}} ticket: {{summary}}",
        },
      },
    },
  ],
};