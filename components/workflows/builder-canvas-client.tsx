"use client";

import dynamic from "next/dynamic";
import { Workflow } from "@/lib/types";

const BuilderCanvasNoSSR = dynamic(
  () => import("./builder-canvas").then((mod) => mod.BuilderCanvas),
  { ssr: false }
);

export function BuilderCanvasClient({
  initialWorkflow,
}: {
  initialWorkflow: Workflow;
}) {
  return <BuilderCanvasNoSSR initialWorkflow={initialWorkflow} />;
}