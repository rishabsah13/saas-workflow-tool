"use client";

import { GripVertical, Sparkles, Split, Send } from "lucide-react";
import { WorkflowStep } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type StepCardProps = {
  step: WorkflowStep;
  isSelected?: boolean;
  onClick?: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
};

function getStepIcon(type: WorkflowStep["type"]) {
  switch (type) {
    case "AI":
      return Sparkles;
    case "CONDITION":
      return Split;
    case "ACTION":
      return Send;
    default:
      return Sparkles;
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

export function StepCard({
  step,
  isSelected,
  onClick,
  dragHandleProps,
}: StepCardProps) {
  const Icon = getStepIcon(step.type);

 return (
  <Card
    onClick={onClick}
    className={cn(
      "group flex cursor-pointer items-start gap-4 rounded-2xl border border-white/10 bg-[#15171a] p-4 transition-all duration-200 hover:border-white/15 hover:bg-[#181b1f]",
      isSelected && "border-violet-500/40 bg-violet-500/[0.08] shadow-[0_0_0_1px_rgba(139,92,246,0.18)]"
    )}
  >
    <button
      type="button"
      aria-label="Drag step"
      className="mt-1 rounded-md p-1 text-slate-500 transition hover:bg-white/5 hover:text-slate-300"
      {...dragHandleProps}
    >
      <GripVertical className="h-4 w-4" />
    </button>

    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#101114]">
      <Icon className="h-4 w-4 text-white" />
    </div>

    <div className="min-w-0 flex-1">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white">{step.name}</p>
          <p className="mt-1 text-xs text-slate-400">
            {step.type === "AI" && "Analyze input and return structured output."}
            {step.type === "CONDITION" && "Evaluate a rule before moving forward."}
            {step.type === "ACTION" && "Send data to the selected destination."}
          </p>
        </div>

        <Badge
          variant="outline"
          className={cn(
            "rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
            getStepTone(step.type)
          )}
        >
          {step.type}
        </Badge>
      </div>
    </div>
  </Card>
);
}