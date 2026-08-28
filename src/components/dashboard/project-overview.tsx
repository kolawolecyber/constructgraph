import {
  MapPin,
  Network,
  ShieldCheck,
} from "lucide-react";

import type { ProjectOverview as ProjectOverviewData } from "@/types/constructgraph";

interface ProjectOverviewProps {
  project: ProjectOverviewData;
}

export function ProjectOverview({
  project,
}: ProjectOverviewProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="relative p-6 md:p-8">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium">
              <ShieldCheck className="h-3.5 w-3.5" />
              {project.status}
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground">
              <Network className="h-3.5 w-3.5" />
              Graph connected
            </span>
          </div>

          <h2 className="mt-5 max-w-3xl text-2xl font-semibold tracking-tight md:text-3xl">
            {project.name}
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
            {project.description}
          </p>

          <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{project.location}</span>
          </div>
        </div>
      </div>
    </section>
  );
}