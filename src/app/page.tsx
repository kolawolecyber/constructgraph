"use client";

import { useEffect, useState } from "react";

import { AppHeader } from "@/components/layout/app-header";
import {
  AppSidebar,
  type View,
} from "@/components/layout/app-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

import { ProjectGraphWorkspace } from "@/components/graph/project-graph-workspace";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { PhaseList } from "@/components/dashboard/phase-list";
import { ProjectOverview } from "@/components/dashboard/project-overview";
import { TaskImpactPanel } from "@/components/impact/task-impact-panel";
import { SupplierImpactPanel } from "@/components/impact/supplier-impact-panel";

import { getProjectOverview } from "@/lib/api/projects";
import type { ProjectOverview as ProjectOverviewData } from "@/types/constructgraph";

const PROJECT_ID = "project-lagos-office-001";

export default function HomePage() {
  const [activeView, setActiveView] =
    useState<View>("overview");

  const [project, setProject] =
    useState<ProjectOverviewData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProject() {
      try {
        setLoading(true);
        setError(null);

        const data = await getProjectOverview(PROJECT_ID);

        if (!cancelled) {
          setProject(data);
        }
      } catch {
        if (!cancelled) {
          setError("We couldn't load the project right now.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProject();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <AppSidebar
          activeView={activeView}
          onViewChange={setActiveView}
        />

        <div className="flex min-w-0 flex-1 flex-col">
         <AppHeader
  title={
    activeView === "overview"
      ? "Project Overview"
      : activeView === "impact"
        ? "Task Impact"
        : activeView === "suppliers"
          ? "Supply Impact"
          : "Graph Explorer"
  }
  description="Understand how construction activities are connected."
/>

          <main className="flex-1 px-4 py-6 pb-24 md:px-8 md:py-8 md:pb-8">
            <div className="mx-auto max-w-7xl">
              {loading ? (
                <DashboardSkeleton />
              ) : error ? (
                <ErrorState message={error} />
              ) : project ? (
              activeView === "overview" ? (
  <div className="space-y-6">
    <ProjectOverview project={project} />

    <StatsGrid project={project} />

    <PhaseList project={project} />
  </div>
) : activeView === "impact" ? (
  <TaskImpactPanel
    projectId={PROJECT_ID}
  />
) : activeView === "suppliers" ? (
  <SupplierImpactPanel
    projectId={PROJECT_ID}
  />
) : (
  <ProjectGraphWorkspace
    projectId={PROJECT_ID}
  />
)
              ) : (
                <ErrorState message="Project data is unavailable." />
              )}
            </div>
          </main>
        </div>
      </div>

      <MobileNav
        activeView={activeView}
        onViewChange={setActiveView}
      />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-56 rounded-2xl bg-muted" />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-32 rounded-2xl bg-muted"
          />
        ))}
      </div>

      <div className="h-96 rounded-2xl bg-muted" />
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex min-h-72 items-center justify-center rounded-2xl border border-border bg-card p-6 text-center">
      <div>
        <h2 className="font-semibold">
          Something went wrong
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          {message}
        </p>
      </div>
    </div>
  );
}
