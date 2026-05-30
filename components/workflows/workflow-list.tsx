"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Plus, Trash2, Workflow as WorkflowIcon } from "lucide-react";

import { Workflow } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { workflowTemplates } from "@/lib/workflow-templates";
export function WorkflowList({
  initialWorkflows,
}: {
  initialWorkflows: Workflow[];
}) {
  const router = useRouter();
  const [workflows, setWorkflows] = useState(initialWorkflows);
  const [newName, setNewName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleCreate() {
    try {
      setIsCreating(true);

      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newName }),
      });

      if (!res.ok) throw new Error("Failed to create workflow");

      const workflow = await res.json();
      router.push(`/workflows/${workflow.id}`);
    } finally {
      setIsCreating(false);
    }
  }

  async function handleCreateFromTemplate(templateId: string) {
    try {
      setBusyId(templateId);

      const template = workflowTemplates.find((item) => item.id === templateId);
      if (!template) return;

      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: template.name,
          triggerType: template.triggerType,
          samplePayload: template.samplePayload,
          steps: template.steps,
        }),
      });

      if (!res.ok) throw new Error("Failed to create workflow from template");

      const workflow = await res.json();
      router.push(`/workflows/${workflow.id}`);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDuplicate(id: string) {
    try {
      setBusyId(id);

      const res = await fetch(`/api/workflows/${id}/duplicate`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to duplicate workflow");

      const duplicated = await res.json();
      setWorkflows((prev) => [duplicated, ...prev]);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    try {
      setBusyId(id);

      const res = await fetch(`/api/workflows/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete workflow");

      setWorkflows((prev) => prev.filter((workflow) => workflow.id !== id));
    } finally {
      setBusyId(null);
    }
  }

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "DRAFT" | "PUBLISHED"
  >("ALL");

  const filteredWorkflows = workflows.filter((workflow) => {
    const matchesQuery = workflow.name
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" ? true : workflow.status === statusFilter;

    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-[#111318] p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex-1">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search workflows..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-2">
            {["ALL", "DRAFT", "PUBLISHED"].map((status) => (
              <button
                key={status}
                onClick={() =>
                  setStatusFilter(status as "ALL" | "DRAFT" | "PUBLISHED")
                }
                className={`rounded-xl px-3 py-2 text-sm transition ${
                  statusFilter === status
                    ? "bg-white text-black"
                    : "border border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/5"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <div>
            <p className="text-sm text-slate-400">AI automation workspace</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">
              Workflows
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Create and manage automation flows, then open each workflow to
              edit steps, prompts, conditions, and actions.
            </p>
          </div>

          <div className="flex w-full max-w-xl gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New workflow name"
              className="border-white/10 bg-[#171a20] text-white placeholder:text-slate-500"
            />
            <Button
              onClick={handleCreate}
              disabled={isCreating}
              className="bg-violet-600 text-white hover:bg-violet-500"
            >
              <Plus className="mr-2 h-4 w-4" />
              {isCreating ? "Creating..." : "New workflow"}
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#111318] p-5 md:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">Starter templates</p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Start faster with proven workflow patterns
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Pick a ready-made flow for support, sales, or ops, then customize
              the steps and payload.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {workflowTemplates.map((template) => (
            <div
              key={template.id}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-medium text-white">
                    {template.name}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    {template.description}
                  </p>
                </div>

                <Badge className="border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
                  {template.category}
                </Badge>
              </div>

              <div className="mt-4 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                <p className="text-xs text-slate-500">
                  {template.steps.length} steps • {template.triggerType}
                </p>
              </div>

              <Button
                onClick={() => handleCreateFromTemplate(template.id)}
                disabled={busyId === template.id}
                className="mt-5 w-full bg-violet-600 text-white hover:bg-violet-500"
              >
                {busyId === template.id ? "Creating..." : "Use template"}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {filteredWorkflows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-[#111318] px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
            <WorkflowIcon className="h-6 w-6 text-violet-300" />
          </div>
          <h2 className="mt-5 text-lg font-medium text-white">
            No workflows yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
            Start with one workflow and keep the flow simple: trigger, AI step,
            condition, and one action.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredWorkflows.map((workflow) => (
            <div
              key={workflow.id}
              className="rounded-2xl border border-white/10 bg-[#111318] p-5 transition hover:border-white/15 hover:bg-[#151922]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-base font-medium text-white">
                    {workflow.name}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    {workflow.steps.length} steps • {workflow.triggerType}
                  </p>
                </div>

                <Badge
                  className={cn(
                    "border",
                    workflow.status === "PUBLISHED"
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                      : "border-amber-500/20 bg-amber-500/10 text-amber-300",
                  )}
                >
                  {workflow.status}
                </Badge>
              </div>

              <div className="mt-5 flex gap-2">
                <Button
                  asChild
                  className="flex-1 bg-white text-black hover:bg-slate-200"
                >
                  <Link href={`/workflows/${workflow.id}`}>Open</Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="border-white/10 bg-transparent text-slate-200 hover:bg-white/5"
                >
                  <Link href={`/workflows/${workflow.id}/runs`}>Runs</Link>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleDuplicate(workflow.id)}
                  disabled={busyId === workflow.id}
                  className="border-white/10 bg-transparent text-slate-200 hover:bg-white/5"
                >
                  <Copy className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleDelete(workflow.id)}
                  disabled={busyId === workflow.id}
                  className="border-white/10 bg-transparent text-rose-300 hover:bg-rose-500/10 hover:text-rose-200"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
