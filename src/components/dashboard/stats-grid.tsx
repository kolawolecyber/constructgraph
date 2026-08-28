import {
  CheckCircle2,
  Layers3,
  ListTodo,
  Network,
} from "lucide-react";

import type { ProjectOverview } from "@/types/constructgraph";

interface StatsGridProps {
  project: ProjectOverview;
}

export function StatsGrid({ project }: StatsGridProps) {
  const taskCount = project.phases.reduce(
    (total, phase) => total + phase.taskCount,
    0
  );

  const stats = [
    {
      label: "Project phases",
      value: project.phases.length,
      icon: Layers3,
    },
    {
      label: "Tracked tasks",
      value: taskCount,
      icon: ListTodo,
    },
    {
      label: "Active status",
      value: project.status === "active" ? "Active" : project.status,
      icon: CheckCircle2,
    },
    {
      label: "Graph model",
      value: "Connected",
      icon: Network,
    },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {stat.label}
              </p>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <p className="mt-4 text-2xl font-semibold tracking-tight">
              {stat.value}
            </p>
          </div>
        );
      })}
    </section>
  );
}