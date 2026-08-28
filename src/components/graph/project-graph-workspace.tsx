"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Network,
} from "lucide-react";

import { getProjectGraph } from "@/lib/api/graph";

import type {
  ProjectGraph as ProjectGraphData,
} from "@/types/constructgraph";

import { ProjectGraph } from "./project-graph";

interface ProjectGraphWorkspaceProps {
  projectId: string;
}

export function ProjectGraphWorkspace({
  projectId,
}: ProjectGraphWorkspaceProps) {
  const [graph, setGraph] =
    useState<ProjectGraphData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadGraph() {
      try {
        setLoading(true);
        setError(null);

        const data =
          await getProjectGraph(projectId);

        if (!cancelled) {
          setGraph(data);
        }
      } catch {
        if (!cancelled) {
          setError(
            "Unable to load the project graph."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadGraph();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex h-[650px] items-center justify-center rounded-2xl border border-border bg-card">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />

          <p className="mt-4 text-sm text-muted-foreground">
            Loading project graph...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[650px] items-center justify-center rounded-2xl border border-border bg-card p-6">
        <div className="max-w-sm text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10">
            <AlertCircle className="h-5 w-5 text-destructive" />
          </div>

          <h2 className="mt-4 font-semibold">
            Graph unavailable
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!graph || graph.nodes.length === 0) {
    return (
      <div className="flex h-[650px] items-center justify-center rounded-2xl border border-dashed border-border bg-card p-6">
        <div className="max-w-sm text-center">
          <Network className="mx-auto h-8 w-8 text-muted-foreground" />

          <h2 className="mt-4 font-semibold">
            No graph data
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            There are currently no connected entities
            available for this project.
          </p>
        </div>
      </div>
    );
  }

  return (
  <ProjectGraph
    projectId={projectId}
    graph={graph}
  />
);
}