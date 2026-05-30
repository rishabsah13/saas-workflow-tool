const globalForRuns = globalThis as typeof globalThis & {
  workflowRuns?: Map<string, any>;
};

export const workflowRuns =
  globalForRuns.workflowRuns ?? new Map<string, any>();

if (!globalForRuns.workflowRuns) {
  globalForRuns.workflowRuns = workflowRuns;
}