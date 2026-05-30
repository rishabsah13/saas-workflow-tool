import { WorkflowList } from "@/components/workflows/workflow-list";

async function getWorkflows() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/workflows`, {
    cache: "no-store",
  });

  if (!res.ok) return [];
  return res.json();
}

export default async function WorkflowsPage() {
  const workflows = await getWorkflows();

  return (
    <main className="min-h-screen bg-[#0b0d10] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <WorkflowList initialWorkflows={workflows} />
      </div>
    </main>
  );
}