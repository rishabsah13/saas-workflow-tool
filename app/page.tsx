import Link from "next/link";

const benefits = [
  {
    title: "Launch one useful workflow fast",
    text: "Start with support, sales, or ops templates instead of building from a blank canvas.",
  },
  {
    title: "Use AI without losing control",
    text: "Classify, summarize, and enrich data while keeping every run visible and reviewable.",
  },
  {
    title: "Show teams exactly what happened",
    text: "Open each run to inspect the input, executed steps, and final output in one place.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0b0d12] text-white">
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-24">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-cyan-400">
              AI workflow automation for startups
            </p>

            <h1 className="mt-4 text-5xl font-semibold leading-tight tracking-tight">
              Automate repetitive team workflows without building a complex ops stack.
            </h1>

            <p className="mt-6 max-w-2xl text-lg text-slate-400">
              Create AI-powered workflows for support, sales, and internal ops using
              starter templates, simple actions, and clear execution logs your team can trust.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/workflows"
                className="rounded-2xl bg-white px-5 py-3 text-sm font-medium text-black hover:bg-slate-200"
              >
                Book a demo
              </Link>

              <Link
                href="/workflows"
                className="rounded-2xl border border-white/10 px-5 py-3 text-sm text-slate-200 hover:bg-white/5"
              >
                Try the workflow demo
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-400">
              <div>Support triage</div>
              <div>Lead enrichment</div>
              <div>Daily summaries</div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="rounded-2xl border border-white/10 bg-[#111318] p-5">
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <p className="text-sm text-slate-400">Live workflow example</p>
                  <h2 className="mt-1 text-lg font-semibold text-white">
                    Support ticket triage
                  </h2>
                </div>

                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                  Run successful
                </span>
              </div>

              <div className="mt-5 grid gap-3">
                {[
                  "Webhook trigger",
                  "Analyze support ticket with AI",
                  "Send Slack alert",
                ].map((step, index) => (
                  <div
                    key={step}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  >
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                      Step {index + 1}
                    </p>
                    <p className="mt-1 text-sm font-medium text-white">{step}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-slate-400">Result</p>
                <div className="mt-3 space-y-3 text-sm text-slate-300">
                  <div>
                    <span className="text-slate-500">Category:</span>{" "}
                    Authentication
                  </div>
                  <div>
                    <span className="text-slate-500">Priority:</span> High
                  </div>
                  <div>
                    <span className="text-slate-500">Recommended action:</span>{" "}
                    Escalate to support and inspect auth logs.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {benefits.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-[#111318] p-6"
            >
              <h2 className="text-lg font-medium text-white">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-white/10 px-6 py-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 rounded-3xl border border-white/10 bg-[#111318] p-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-slate-400">See one workflow mapped to your team</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Book a short demo and pick your first workflow to automate.
            </h2>
          </div>

          <Link
            href="/workflows"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-medium text-black hover:bg-slate-200"
          >
            Book a demo
          </Link>
        </div>
      </section>
    </main>
  );
}