import { notFound } from "next/navigation";
import { BuilderCanvasClient } from "@/components/workflows/builder-canvas-client";

async function getWorkflow(workflowId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/workflows/${workflowId}`, {
    cache: "no-store",
  });

  if (!res.ok) return null;
  return res.json();
}

export default async function WorkflowBuilderPage({
  params,
}: {
  params: Promise<{ workflowId: string }>;
}) {
  const { workflowId } = await params;
  const workflow = await getWorkflow(workflowId);

  if (!workflow) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#0b0d10] text-white">
      <div className="mx-auto max-w-[1500px] px-4 py-4 md:px-6 md:py-6">
        <BuilderCanvasClient initialWorkflow={workflow} />
      </div>
    </main>
  );
}