"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Bot,
  ChevronRight,
  FlaskConical,
  GripVertical,
  Play,
  Plus,
  Send,
  Split,
  Sparkles,
  Zap,
} from "lucide-react";

import {
  Workflow,
  WorkflowStep,
  AIConfig,
  ActionConfig,
  ConditionConfig,
  NewStepType,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
type BuilderCanvasProps = {
  initialWorkflow: Workflow;
};

const defaultSamplePayload = `{
  "ticket_text": "Customer cannot log in after resetting password and is getting a 403 error.",
  "customer_email": "sarah@acme.com",
  "plan": "pro",
  "priority_hint": "high"
}`;

function getStepIcon(type: WorkflowStep["type"]) {
  switch (type) {
    case "AI":
      return Sparkles;
    case "CONDITION":
      return Split;
    case "ACTION":
      return Send;
    default:
      return Bot;
  }
}

function getStepTone(type: WorkflowStep["type"]) {
  switch (type) {
    case "AI":
      return "border-violet-500/20 bg-violet-500/10 text-violet-300";
    case "CONDITION":
      return "border-amber-500/20 bg-amber-500/10 text-amber-300";
    case "ACTION":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
    default:
      return "border-slate-500/20 bg-slate-500/10 text-slate-300";
  }
}

function stepDescription(step: WorkflowStep) {
  switch (step.type) {
    case "AI":
      return "Analyze input and return structured output.";
    case "CONDITION":
      return "Evaluate a rule before moving forward.";
    case "ACTION":
      return "Send data to the selected destination.";
    default:
      return "Workflow step.";
  }
}

function buildNewStep(
  type: NewStepType,
  workflowId: string,
  position: number,
): WorkflowStep {
  if (type === "AI") {
    return {
      id: crypto.randomUUID(),
      workflowId,
      type: "AI",
      name: "AI analysis",
      position,
      config: {
        prompt: "Summarize the ticket and extract category and priority.",
        inputKey: "ticket_text",
        outputKeys: ["summary", "category", "priority"],
      },
    };
  }

  if (type === "CONDITION") {
    return {
      id: crypto.randomUUID(),
      workflowId,
      type: "CONDITION",
      name: "Check priority",
      position,
      config: {
        field: "priority",
        operator: "equals",
        value: "high",
      },
    };
  }

  return {
    id: crypto.randomUUID(),
    workflowId,
    type: "ACTION",
    name: "Send notification",
    position,
    config: {
      provider: "slack",
      action: "send_message",
      payloadTemplate: {
        channel: "#support",
        text: "High priority ticket detected: {{summary}}",
      },
    },
  };
}

function SortableStep({
  step,
  isSelected,
  onSelect,
}: {
  step: WorkflowStep;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: step.id,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = getStepIcon(step.type);
  return (
    <div ref={setNodeRef} style={style}>
      <div
        onClick={onSelect}
        className={cn(
          "group cursor-pointer rounded-2xl border border-white/10 bg-[#171a20] p-4 transition-all duration-200 hover:border-white/15 hover:bg-[#1b1f26]",
          isSelected &&
            "border-violet-500/40 bg-violet-500/[0.07] shadow-[0_0_0_1px_rgba(139,92,246,0.16)]",
        )}
      >
        <div className="flex items-start gap-4">
          <button
            type="button"
            aria-label="Drag step"
            className="mt-1 rounded-md p-1 text-slate-500 transition hover:bg-white/5 hover:text-slate-300"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#101114]">
            <Icon className="h-4 w-4 text-white" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {step.name}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {stepDescription(step)}
                </p>
              </div>

              <Badge
                variant="outline"
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                  getStepTone(step.type),
                )}
              >
                {step.type}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BuilderCanvas({ initialWorkflow }: BuilderCanvasProps) {
  const [workflow, setWorkflow] = useState(initialWorkflow);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(
    initialWorkflow.steps[0]?.id ?? null,
  );
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testRunStage, setTestRunStage] = useState<string | null>(null);
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [draftStep, setDraftStep] = useState<WorkflowStep | null>(null);
  const [lastTestOutput, setLastTestOutput] = useState(`{
  "status": "idle",
  "message": "Run a test to preview workflow output."
}`);
  const [samplePayload, setSamplePayload] = useState(
    initialWorkflow.samplePayload || defaultSamplePayload,
  );

  const sensors = useSensors(useSensor(PointerSensor));
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">(
    "idle",
  );
  const steps = useMemo(
    () => [...workflow.steps].sort((a, b) => a.position - b.position),
    [workflow.steps],
  );

  const selectedStep = steps.find((step) => step.id === selectedStepId) ?? null;

  async function handleSaveWorkflow() {
    try {
      setIsSaving(true);
      setSaveStatus("idle");

      const payload = {
        ...workflow,
        samplePayload,
      };

      const res = await fetch(`/api/workflows/${workflow.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to save workflow");
      }

      const saved = await res.json();
      setWorkflow(saved);
      setSaveStatus("saved");
    } catch (error) {
      console.error(error);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  }

  useEffect(() => {
    if (selectedStep) {
      setDraftStep(selectedStep);
    }
  }, [selectedStep]);

  async function handleTogglePublish() {
    try {
      setIsPublishing(true);

      const res = await fetch(`/api/workflows/${workflow.id}/publish`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to update workflow status");
      }

      const updated = await res.json();
      setWorkflow(updated);
    } catch (error) {
      console.error(error);
    } finally {
      setIsPublishing(false);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = steps.findIndex((step) => step.id === active.id);
    const newIndex = steps.findIndex((step) => step.id === over.id);

    const reordered = arrayMove(steps, oldIndex, newIndex).map(
      (step, index) => ({
        ...step,
        position: index + 1,
      }),
    );

    setWorkflow((prev) => ({
      ...prev,
      steps: reordered,
    }));
  }

  function handleSelectStep(stepId: string) {
    setSelectedStepId(stepId);
    setEditorOpen(true);
  }

  function handleAddStep(type: NewStepType) {
    const newStep = buildNewStep(type, workflow.id, steps.length + 1);

    setWorkflow((prev) => ({
      ...prev,
      steps: [...prev.steps, newStep],
    }));

    setSelectedStepId(newStep.id);
    setDraftStep(newStep);
    setEditorOpen(true);
  }

  function updateDraftName(name: string) {
    if (!draftStep) return;
    setDraftStep({ ...draftStep, name });
  }

  function updateAIConfig(patch: Partial<AIConfig>) {
    if (!draftStep || draftStep.type !== "AI") return;
    setDraftStep({
      ...draftStep,
      config: {
        ...(draftStep.config as AIConfig),
        ...patch,
      },
    });
  }

  function updateActionConfig(patch: Partial<ActionConfig>) {
    if (!draftStep || draftStep.type !== "ACTION") return;
    setDraftStep({
      ...draftStep,
      config: {
        ...(draftStep.config as ActionConfig),
        ...patch,
      },
    });
  }

  function updateConditionConfig(patch: Partial<ConditionConfig>) {
    if (!draftStep || draftStep.type !== "CONDITION") return;
    setDraftStep({
      ...draftStep,
      config: {
        ...(draftStep.config as ConditionConfig),
        ...patch,
      },
    });
  }

  function handleSaveStep() {
    if (!draftStep) return;

    setWorkflow((prev) => ({
      ...prev,
      steps: prev.steps.map((step) =>
        step.id === draftStep.id ? draftStep : step,
      ),
    }));

    setEditorOpen(false);
  }
  const [testRunResult, setTestRunResult] = useState<any>(null);
  const [testRunError, setTestRunError] = useState<string | null>(null);

async function handleTestRun() {
  if (isTestRunning) return;

  try {
    setIsTestRunning(true);
    setTestRunStage("Preparing payload");

    let parsed: any = {};
    try {
      parsed = samplePayload ? JSON.parse(samplePayload) : {};
    } catch {
      throw new Error("Sample payload is not valid JSON");
    }

    let aiResult: any = null;

    const aiStep = steps.find((step) => step.type === "AI");

    if (aiStep) {
      const prompt = aiStep.config?.prompt?.trim();

      if (!prompt) {
        aiResult = {
          ok: false,
          skipped: true,
          error: "AI step skipped because no prompt was configured.",
        };
      } else {
        setTestRunStage("Generating AI result");

        const aiRes = await fetch("/api/ai/enrich", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt,
            input: parsed,
          }),
        });

        const aiData = await aiRes.json().catch(() => null);

        if (!aiRes.ok) {
          throw new Error(
            aiData?.error || aiData?.message || "Failed to run AI enrichment",
          );
        }

        aiResult = aiData;
      }
    }

    setTestRunStage("Saving run");

    const runRes = await fetch(`/api/workflows/${workflow.id}/runs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        workflowName: workflow.name,
        status: "SUCCESS",
        input: parsed,
        steps,
        output: {
          ai_result: aiResult,
          preview: {
            summary:
              aiResult?.result?.summary || "Workflow executed successfully.",
          },
        },
      }),
    });

    const runData = await runRes.json().catch(() => null);

    if (!runRes.ok) {
      throw new Error(
        runData?.error || runData?.message || "Failed to save run",
      );
    }

    if (!runData?.id) {
      throw new Error("Run saved response is missing id");
    }

    const targetUrl = `/workflows/${workflow.id}/runs/${runData.id}`;
    console.log("Navigating to:", targetUrl, runData);

    router.push(targetUrl);
  } catch (error: any) {
    console.error("handleTestRun error", error);
    alert(error?.message || "Failed to run workflow");
  } finally {
    setIsTestRunning(false);
    setTestRunStage(null);
  }
}

  console.log("steps", steps);
  console.log(
    "step types",
    steps.map((step) => step.type),
  );
  return (
    <>
      <div className="grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-white/10 bg-[#111318] p-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-violet-500/10">
              <Zap className="h-4 w-4 text-violet-300" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {workflow.name}
              </p>
              <p className="text-xs text-slate-400">
                Fast MVP workflow builder
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border border-white/10 bg-[#171a20] p-3">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
                Trigger
              </p>
              <div className="rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-sm text-white">
                {workflow.triggerType}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#171a20] p-3">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
                Steps
              </p>

              <div className="space-y-1.5">
                {steps.map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => handleSelectStep(step.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition",
                      selectedStepId === step.id
                        ? "border border-violet-500/20 bg-violet-500/10 text-white"
                        : "border border-transparent text-slate-300 hover:bg-white/5",
                    )}
                  >
                    <span className="truncate">
                      {index + 1}. {step.name}
                    </span>
                    <span className="text-[10px] uppercase tracking-wide text-slate-500">
                      {step.type}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="w-full bg-white text-black hover:bg-slate-200">
                  <Plus className="mr-2 h-4 w-4" />
                  Add step
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-56 border-white/10 bg-[#171a20] text-white"
              >
                <DropdownMenuItem
                  className="cursor-pointer focus:bg-white/5"
                  onClick={() => handleAddStep("AI")}
                >
                  <Sparkles className="mr-2 h-4 w-4 text-violet-300" />
                  AI step
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer focus:bg-white/5"
                  onClick={() => handleAddStep("CONDITION")}
                >
                  <Split className="mr-2 h-4 w-4 text-amber-300" />
                  Condition step
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer focus:bg-white/5"
                  onClick={() => handleAddStep("ACTION")}
                >
                  <Send className="mr-2 h-4 w-4 text-emerald-300" />
                  Action step
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        <section className="space-y-5">
          <div className="rounded-2xl border border-white/10 bg-[#111318] p-5 md:p-6">
            <div className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
                    <Zap className="h-4 w-4 text-violet-300" />
                  </div>

                  <div>
                    <h1 className="text-[22px] font-semibold tracking-tight text-white">
                      {workflow.name}
                    </h1>
                    <p className="text-sm text-slate-400">
                      Build, test, and publish AI automations without
                      complexity.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge className="border border-amber-500/20 bg-amber-500/10 text-amber-300 hover:bg-amber-500/10">
                  {workflow.status}
                </Badge>

                <Button
                  variant="outline"
                  onClick={handleSaveWorkflow}
                  disabled={isSaving}
                  className="border-white/10 bg-transparent text-slate-200 hover:bg-white/5 hover:text-white"
                >
                  {isSaving ? "Saving..." : "Save draft"}
                </Button>

                <Button
                  type="button"
                  onClick={handleTestRun}
                  disabled={isTestRunning}
                  className="bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-60"
                >
                  {isTestRunning ? "Running..." : "Test run"}
                </Button>
                <Button
                  onClick={handleTogglePublish}
                  disabled={isPublishing}
                  className={
                    workflow.status === "PUBLISHED"
                      ? "bg-amber-500 text-black hover:bg-amber-400"
                      : "bg-emerald-500 text-black hover:bg-emerald-400"
                  }
                >
                  {isPublishing
                    ? "Updating..."
                    : workflow.status === "PUBLISHED"
                      ? "Unpublish"
                      : "Publish"}
                </Button>

                {isTestRunning && (
                  <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-violet-300 border-t-transparent" />
                      <div>
                        <p className="text-sm font-medium text-violet-100">
                          Workflow in progress
                        </p>
                        <p className="text-xs text-violet-200/80">
                          {testRunStage || "Running..."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {saveStatus === "saved" && (
                  <p className="text-xs text-emerald-400">Draft saved</p>
                )}
                {saveStatus === "error" && (
                  <p className="text-xs text-rose-400">Could not save draft</p>
                )}
              </div>
            </div>

            <div className="mb-5 rounded-2xl border border-white/10 bg-[#171a20] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
                    Trigger
                  </p>
                  <h2 className="text-sm font-medium text-white">
                    Manual trigger
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Start this workflow manually using a sample payload while
                    building.
                  </p>
                </div>

                <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-300">
                  Demo mode
                </div>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-2 px-1">
              <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
                Workflow steps
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
              <span className="text-xs text-slate-400">
                {steps.length} steps
              </span>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={steps.map((step) => step.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {steps.map((step) => (
                    <SortableStep
                      key={step.id}
                      step={step}
                      isSelected={selectedStepId === step.id}
                      onSelect={() => handleSelectStep(step.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="mt-4 flex w-full items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-4 text-sm font-medium text-slate-300 transition hover:border-violet-500/30 hover:bg-violet-500/[0.05] hover:text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Add another step
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                className="w-56 border-white/10 bg-[#171a20] text-white"
              >
                <DropdownMenuItem
                  className="cursor-pointer focus:bg-white/5"
                  onClick={() => handleAddStep("AI")}
                >
                  <Sparkles className="mr-2 h-4 w-4 text-violet-300" />
                  AI step
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer focus:bg-white/5"
                  onClick={() => handleAddStep("CONDITION")}
                >
                  <Split className="mr-2 h-4 w-4 text-amber-300" />
                  Condition step
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer focus:bg-white/5"
                  onClick={() => handleAddStep("ACTION")}
                >
                  <Send className="mr-2 h-4 w-4 text-emerald-300" />
                  Action step
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#111318] p-5">
              <div className="mb-4 flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-violet-300" />
                <h3 className="text-sm font-medium text-white">
                  Sample payload
                </h3>
              </div>

              <p className="mb-3 text-sm text-slate-400">
                Edit the JSON input used during test runs.
              </p>

              <Textarea
                value={samplePayload}
                onChange={(e) => setSamplePayload(e.target.value)}
                className="min-h-[260px] border-white/10 bg-[#171a20] font-mono text-xs text-white"
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#111318] p-5">
              <div className="mb-4 flex items-center gap-2">
                <Play className="h-4 w-4 text-emerald-300" />
                <h3 className="text-sm font-medium text-white">Test output</h3>
              </div>

              <p className="mb-3 text-sm text-slate-400">
                Preview the workflow result without calling real integrations.
              </p>

              <pre className="min-h-[260px] overflow-auto rounded-xl border border-white/10 bg-[#171a20] p-4 font-mono text-xs text-slate-300">
                {lastTestOutput}
              </pre>
            </div>
          </div>
        </section>
      </div>

      <Sheet open={editorOpen} onOpenChange={setEditorOpen}>
        <SheetContent
          side="right"
          className="w-full border-white/10 bg-[#0f1115] text-slate-100 sm:max-w-xl"
        >
          <SheetHeader>
            <SheetTitle className="text-white">
              {draftStep?.name ?? "Step editor"}
            </SheetTitle>
            <SheetDescription className="text-slate-400">
              Configure this step and save changes back to the workflow.
            </SheetDescription>
          </SheetHeader>

          {draftStep ? (
            <div className="mt-6 space-y-6">
              <div className="rounded-2xl border border-white/10 bg-[#171a20] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-white">
                    Step settings
                  </p>
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                      getStepTone(draftStep.type),
                    )}
                  >
                    {draftStep.type}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="step-name" className="text-slate-300">
                      Step name
                    </Label>
                    <Input
                      id="step-name"
                      value={draftStep.name}
                      onChange={(e) => updateDraftName(e.target.value)}
                      className="border-white/10 bg-[#0f1115] text-white placeholder:text-slate-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="step-type" className="text-slate-300">
                      Step type
                    </Label>
                    <Input
                      id="step-type"
                      value={draftStep.type}
                      readOnly
                      className="border-white/10 bg-[#0f1115] text-slate-400"
                    />
                  </div>
                </div>
              </div>

              {draftStep.type === "AI" && (
                <div className="rounded-2xl border border-white/10 bg-[#171a20] p-4">
                  <p className="mb-4 text-sm font-medium text-white">
                    AI configuration
                  </p>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="ai-input-key" className="text-slate-300">
                        Input key
                      </Label>
                      <Input
                        id="ai-input-key"
                        value={(draftStep.config as AIConfig).inputKey}
                        onChange={(e) =>
                          updateAIConfig({ inputKey: e.target.value })
                        }
                        className="border-white/10 bg-[#0f1115] text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="ai-output-keys"
                        className="text-slate-300"
                      >
                        Output keys
                      </Label>
                      <Input
                        id="ai-output-keys"
                        value={(draftStep.config as AIConfig).outputKeys.join(
                          ", ",
                        )}
                        onChange={(e) =>
                          updateAIConfig({
                            outputKeys: e.target.value
                              .split(",")
                              .map((item) => item.trim())
                              .filter(Boolean),
                          })
                        }
                        className="border-white/10 bg-[#0f1115] text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ai-prompt" className="text-slate-300">
                        Prompt
                      </Label>
                      <Textarea
                        id="ai-prompt"
                        value={(draftStep.config as AIConfig).prompt}
                        onChange={(e) =>
                          updateAIConfig({ prompt: e.target.value })
                        }
                        className="min-h-[160px] border-white/10 bg-[#0f1115] text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {draftStep.type === "ACTION" && (
                <div className="rounded-2xl border border-white/10 bg-[#171a20] p-4">
                  <p className="mb-4 text-sm font-medium text-white">
                    Action configuration
                  </p>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="action-provider"
                        className="text-slate-300"
                      >
                        Provider
                      </Label>
                      <Input
                        id="action-provider"
                        value={(draftStep.config as ActionConfig).provider}
                        onChange={(e) =>
                          updateActionConfig({
                            provider: e.target
                              .value as ActionConfig["provider"],
                          })
                        }
                        className="border-white/10 bg-[#0f1115] text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="action-name" className="text-slate-300">
                        Action
                      </Label>
                      <Input
                        id="action-name"
                        value={(draftStep.config as ActionConfig).action}
                        onChange={(e) =>
                          updateActionConfig({ action: e.target.value })
                        }
                        className="border-white/10 bg-[#0f1115] text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="action-payload"
                        className="text-slate-300"
                      >
                        Payload template
                      </Label>
                      <Textarea
                        id="action-payload"
                        value={JSON.stringify(
                          (draftStep.config as ActionConfig).payloadTemplate,
                          null,
                          2,
                        )}
                        onChange={(e) => {
                          try {
                            updateActionConfig({
                              payloadTemplate: JSON.parse(e.target.value),
                            });
                          } catch {}
                        }}
                        className="min-h-[180px] border-white/10 bg-[#0f1115] font-mono text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {draftStep.type === "CONDITION" && (
                <div className="rounded-2xl border border-white/10 bg-[#171a20] p-4">
                  <p className="mb-4 text-sm font-medium text-white">
                    Condition configuration
                  </p>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="condition-field"
                        className="text-slate-300"
                      >
                        Field
                      </Label>
                      <Input
                        id="condition-field"
                        value={(draftStep.config as ConditionConfig).field}
                        onChange={(e) =>
                          updateConditionConfig({ field: e.target.value })
                        }
                        className="border-white/10 bg-[#0f1115] text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="condition-operator"
                        className="text-slate-300"
                      >
                        Operator
                      </Label>
                      <Input
                        id="condition-operator"
                        value={(draftStep.config as ConditionConfig).operator}
                        onChange={(e) =>
                          updateConditionConfig({
                            operator: e.target
                              .value as ConditionConfig["operator"],
                          })
                        }
                        className="border-white/10 bg-[#0f1115] text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="condition-value"
                        className="text-slate-300"
                      >
                        Value
                      </Label>
                      <Input
                        id="condition-value"
                        value={(draftStep.config as ConditionConfig).value}
                        onChange={(e) =>
                          updateConditionConfig({ value: e.target.value })
                        }
                        className="border-white/10 bg-[#0f1115] text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <Separator className="bg-white/10" />

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-white/10 bg-transparent text-slate-200 hover:bg-white/5"
                  onClick={() => setEditorOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-violet-600 text-white hover:bg-violet-500"
                  onClick={handleSaveStep}
                >
                  Save changes
                </Button>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
