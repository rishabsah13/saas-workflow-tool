 export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: "Support" | "Sales" | "Ops";
  samplePayload: string;
  steps: Array<{
    id: string;
    type: "TRIGGER" | "AI" | "ACTION";
    name: string;
    config?: Record<string, string>;
  }>;
};

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: "support-triage",
    name: "Support ticket triage",
    description: "Classify urgent tickets and send action-ready summaries.",
    category: "Support",
    samplePayload: `{
  "ticket_text": "Customer cannot log in after resetting password and is getting a 403 error.",
  "customer_email": "sarah@acme.com",
  "plan": "pro",
  "priority_hint": "high"
}`,
    steps: [
      { id: "step_trigger", type: "TRIGGER", name: "Webhook trigger" },
      { id: "step_ai", type: "AI", name: "Analyze support ticket" },
      {
        id: "step_action",
        type: "ACTION",
        name: "Send Slack alert",
        config: { provider: "slack" },
      },
    ],
  },
  {
    id: "lead-enrichment",
    name: "Lead enrichment",
    description: "Summarize inbound lead data and recommend next action.",
    category: "Sales",
    samplePayload: `{
  "name": "Aman Gupta",
  "company": "Acme Growth",
  "role": "Founder",
  "message": "Looking for a workflow automation tool for customer support and sales ops."
}`,
    steps: [
      { id: "step_trigger", type: "TRIGGER", name: "Form submission" },
      { id: "step_ai", type: "AI", name: "Enrich lead" },
      {
        id: "step_action",
        type: "ACTION",
        name: "Send follow-up email",
        config: { provider: "email" },
      },
    ],
  },
  {
    id: "daily-summary",
    name: "Daily summary report",
    description: "Summarize events and send a clean internal update.",
    category: "Ops",
    samplePayload: `{
  "date": "2026-05-29",
  "new_signups": 18,
  "churned": 2,
  "tickets_open": 7,
  "important_note": "Two enterprise demos scheduled for tomorrow."
}`,
    steps: [
      { id: "step_trigger", type: "TRIGGER", name: "Scheduled trigger" },
      { id: "step_ai", type: "AI", name: "Generate daily summary" },
      {
        id: "step_action",
        type: "ACTION",
        name: "Send summary to Slack",
        config: { provider: "slack" },
      },
    ],
  },
];