type PageProps = {
  params: Promise<{
    workflowId: string;
    runId: string;
  }>;
};

async function getRun(workflowId: string, runId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/workflows/${workflowId}/runs/${runId}`,
    { cache: "no-store" },
  );

  if (!res.ok) {
    return null;
  }

  return res.json();
}

export default async function WorkflowRunPage({ params }: PageProps) {
  const { workflowId, runId } = await params;
  const run = await getRun(workflowId, runId);

  if (!run) {
    return (
      <div className="min-h-screen bg-[#0b1020] p-6 text-white">
        <div className="mx-auto max-w-4xl rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm font-medium text-red-100">Run not found</p>
          <p className="mt-1 text-xs text-red-200/80">
            This run could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1020] p-6 text-white">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">
            Workflow Run
          </p>
          <h1 className="mt-2 text-2xl font-semibold">{run.workflowName}</h1>
          <p className="mt-1 text-sm text-white/60">
            Status: {run.status}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">
            Sample output
          </p>
          <p className="mt-3 text-sm text-white/90">
            {run.output?.preview?.summary || "No preview summary available."}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">
              Input
            </p>
            <pre className="mt-3 overflow-x-auto text-xs text-white/80">
              {JSON.stringify(run.input, null, 2)}
            </pre>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">
              AI result
            </p>
            <pre className="mt-3 overflow-x-auto text-xs text-white/80">
              {JSON.stringify(run.output?.ai_result, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}