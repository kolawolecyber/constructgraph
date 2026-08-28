"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowDown,
  GitBranch,
  Loader2,
  Search,
} from "lucide-react";

import { getProjectTasks } from "@/lib/api/projects";
import { getTaskImpact } from "@/lib/api/tasks";

import type {
  ProjectTask,
  TaskImpact,
} from "@/types/constructgraph";

interface TaskImpactPanelProps {
  projectId: string;
}

export function TaskImpactPanel({
  projectId,
}: TaskImpactPanelProps) {
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [selectedTaskId, setSelectedTaskId] =
    useState("");

  const [impact, setImpact] =
    useState<TaskImpact | null>(null);

  const [loadingTasks, setLoadingTasks] =
    useState(true);

  const [analyzing, setAnalyzing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadTasks() {
      try {
        setLoadingTasks(true);
        setError(null);

        const data = await getProjectTasks(projectId);

        if (!cancelled) {
          setTasks(data);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load construction tasks.");
        }
      } finally {
        if (!cancelled) {
          setLoadingTasks(false);
        }
      }
    }

    loadTasks();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  async function analyzeImpact() {
    if (!selectedTaskId || analyzing) {
      return;
    }

    try {
      setAnalyzing(true);
      setError(null);
      setImpact(null);

      const result = await getTaskImpact(
        selectedTaskId
      );

      setImpact(result);
    } catch {
      setError(
        "Unable to analyze task impact right now."
      );
    } finally {
      setAnalyzing(false);
    }
  }

  const maximumDepth =
    impact?.affectedTasks.reduce(
      (maximum, task) =>
        Math.max(maximum, task.depth),
      0
    ) ?? 0;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <GitBranch className="h-5 w-5 text-primary" />
          </div>

          <div>
            <h2 className="font-semibold tracking-tight">
              Analyze task impact
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Select a construction activity to discover
              downstream tasks connected through dependency
              relationships.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <select
            value={selectedTaskId}
            onChange={(event) => {
              setSelectedTaskId(event.target.value);
              setImpact(null);
            }}
            disabled={loadingTasks || analyzing}
            className="h-11 min-w-0 flex-1 rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">
              {loadingTasks
                ? "Loading construction tasks..."
                : "Select a construction task"}
            </option>

            {tasks.map((task) => (
              <option
                key={task.id}
                value={task.id}
              >
                {task.name} — {task.phaseName}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={analyzeImpact}
            disabled={
              !selectedTaskId ||
              loadingTasks ||
              analyzing
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Analyze impact
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
      </section>

      {impact && (
        <ImpactResult
          impact={impact}
          maximumDepth={maximumDepth}
        />
      )}

      {!impact &&
        !loadingTasks &&
        !error && (
          <EmptyImpactState />
        )}
    </div>
  );
}

function ImpactResult({
  impact,
  maximumDepth,
}: {
  impact: TaskImpact;
  maximumDepth: number;
}) {
  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-3">
        <ImpactStat
          label="Direct task"
          value={impact.task.name}
        />

        <ImpactStat
          label="Affected activities"
          value={impact.affectedTasks.length}
        />

        <ImpactStat
          label="Maximum depth"
          value={`${maximumDepth} ${
            maximumDepth === 1 ? "hop" : "hops"
          }`}
        />
      </section>

      <section className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border p-5">
          <h2 className="font-semibold tracking-tight">
            Dependency impact path
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Activities ordered by their relationship
            distance from the selected task.
          </p>
        </div>

        <div className="p-5">
          <ImpactNode
            name={impact.task.name}
            depth={0}
            root
          />

          {impact.affectedTasks.map(
            (task, index) => (
              <div key={task.id}>
                <div className="flex justify-center py-2">
                  <ArrowDown className="h-4 w-4 text-muted-foreground" />
                </div>

                <ImpactNode
                  name={task.name}
                  depth={task.depth}
                  isLast={
                    index ===
                    impact.affectedTasks.length - 1
                  }
                />
              </div>
            )
          )}

          {impact.affectedTasks.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No downstream task dependencies were found.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function ImpactStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <p className="mt-3 truncate text-xl font-semibold tracking-tight">
        {value}
      </p>
    </div>
  );
}

function ImpactNode({
  name,
  depth,
  root = false,
}: {
  name: string;
  depth: number;
  root?: boolean;
  isLast?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-background p-4">
      <div
        className={[
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
          root
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground",
        ].join(" ")}
      >
        {depth}
      </div>

      <div className="min-w-0">
        <p className="truncate font-medium">
          {name}
        </p>

        <p className="mt-0.5 text-xs text-muted-foreground">
          {root
            ? "Selected task"
            : `Dependency depth: ${depth}`}
        </p>
      </div>
    </div>
  );
}

function EmptyImpactState() {
  return (
    <section className="flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-border bg-card p-6 text-center">
      <div className="max-w-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
          <GitBranch className="h-5 w-5 text-muted-foreground" />
        </div>

        <h2 className="mt-4 font-semibold">
          Explore dependency impact
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Choose a construction task and ConstructGraph
          will traverse the dependency graph to identify
          potentially affected downstream activities.
        </p>
      </div>
    </section>
  );
}