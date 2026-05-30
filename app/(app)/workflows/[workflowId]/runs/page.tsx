import Link from "next/link";

async function getRuns(workflowId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/workflows/${workflowId}/runs`, {
    cache: "no-store",
  });

  if (!res.ok) return [];
  return res.json();
}

export default async function WorkflowRunsPage({
  params,
}: {
  params: Promise<{ workflowId: string }>;
}) {
  const { workflowId } = await params;
  const runs = await getRuns(workflowId);

  return (
    <main className="min-h-screen bg-[#0b0d10] text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Execution history</p>
            <h1 className="mt-1 text-2xl font-semibold">Workflow runs</h1>
          </div>

          <Link
            href={`/workflows/${workflowId}`}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-200 hover:bg-white/5"
          >
            Back to builder
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111318]">
          {runs.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-lg font-medium text-white">No runs yet</p>
              <p className="mt-2 text-sm text-slate-400">
                Trigger a test run from the builder to generate mock execution logs.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {runs.map((run: any) => (
                <div
                  key={run.id}
                  className="grid gap-3 px-6 py-4 md:grid-cols-[1.4fr_140px_120px_1fr]"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{run.message}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Trigger: {run.trigger}
                    </p>
                  </div>

                  <div className="text-sm text-slate-300">{run.stepsExecuted} steps</div>

                  <div>
                    <span
                      className={
                        run.status === "SUCCESS"
                          ? "rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-300"
                          : "rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-xs text-rose-300"
                      }
                    >
                      {run.status}
                    </span>
                  </div>

                  <div className="text-sm text-slate-400">{run.startedAt}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}