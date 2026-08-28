import {
  ArrowRight,
  CheckCircle2,
  CircleDot,
  Layers3,
} from "lucide-react";

import type { ProjectOverview } from "@/types/constructgraph";

interface PhaseListProps {
  project: ProjectOverview;
}

export function PhaseList({ project }: PhaseListProps) {
  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border p-5">
        <div>
          <h2 className="font-semibold tracking-tight">
            Construction phases
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Current structure of the project graph.
          </p>
        </div>

        <Layers3 className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="divide-y divide-border">
        {project.phases.map((phase) => (
          <div
            key={phase.id}
            className="flex items-center gap-4 p-5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
              <span className="text-sm font-semibold">
                {phase.sequence}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-medium">
                {phase.name}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {phase.taskCount}{" "}
                {phase.taskCount === 1 ? "task" : "tasks"} tracked
              </p>
            </div>

            {phase.taskCount > 0 ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-muted-foreground" />
            ) : (
              <CircleDot className="h-5 w-5 shrink-0 text-muted-foreground" />
            )}

            <ArrowRight className="hidden h-4 w-4 text-muted-foreground sm:block" />
          </div>
        ))}
      </div>
    </section>
  );
}