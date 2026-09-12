"use client";

import type { ReactNode } from "react";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowDown,
  Boxes,
  Loader2,
  Search,
  Truck,
} from "lucide-react";

import {
  getProjectSuppliers,
  getSupplierImpact,
} from "@/lib/api/suppliers";

import type {
  ProjectSupplier,
  SupplierImpact,
} from "@/types/constructgraph";

interface SupplierImpactPanelProps {
  projectId: string;
}

export function SupplierImpactPanel({
  projectId,
}: SupplierImpactPanelProps) {
  const [suppliers, setSuppliers] = useState<
    ProjectSupplier[]
  >([]);

  const [selectedSupplierId, setSelectedSupplierId] =
    useState("");

  const [impact, setImpact] =
    useState<SupplierImpact | null>(null);

  const [loadingSuppliers, setLoadingSuppliers] =
    useState(true);

  const [analyzing, setAnalyzing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSuppliers() {
      try {
        setLoadingSuppliers(true);
        setError(null);

        const data = await getProjectSuppliers(
          projectId
        );

        if (!cancelled) {
          setSuppliers(data);
        }
      } catch {
        if (!cancelled) {
          setError(
            "Unable to load project suppliers."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingSuppliers(false);
        }
      }
    }

    loadSuppliers();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  async function analyzeImpact() {
    if (!selectedSupplierId || analyzing) {
      return;
    }

    try {
      setAnalyzing(true);
      setError(null);
      setImpact(null);

      const result = await getSupplierImpact(
         projectId,
        selectedSupplierId
      );

      setImpact(result);
    } catch {
      setError(
        "Unable to analyze supplier impact right now."
      );
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Truck className="h-5 w-5 text-primary" />
          </div>

          <div>
            <h2 className="font-semibold tracking-tight">
              Analyze supplier disruption
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Explore how a supplier disruption can
              propagate through materials, construction
              activities, and downstream dependencies.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <select
            value={selectedSupplierId}
            onChange={(event) => {
              setSelectedSupplierId(
                event.target.value
              );
              setImpact(null);
            }}
            disabled={loadingSuppliers || analyzing}
            className="h-11 min-w-0 flex-1 rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">
              {loadingSuppliers
                ? "Loading suppliers..."
                : "Select a supplier"}
            </option>

            {suppliers.map((supplier) => (
              <option
                key={supplier.id}
                value={supplier.id}
              >
                {supplier.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={analyzeImpact}
            disabled={
              !selectedSupplierId ||
              loadingSuppliers ||
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

      {impact ? (
        <SupplierImpactResult impact={impact} />
      ) : (
        !loadingSuppliers &&
        !error && <EmptySupplierState />
      )}
    </div>
  );
}

function SupplierImpactResult({
  impact,
}: {
  impact: SupplierImpact;
}) {
  const maximumDepth =
    impact.affectedTasks.reduce(
      (maximum, task) =>
        Math.max(maximum, task.depth),
      0
    );

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-3">
        <SupplierStat
          label="Supplier"
          value={impact.supplier.name}
        />

        <SupplierStat
          label="Materials affected"
          value={impact.materials.length}
        />

        <SupplierStat
          label="Activities affected"
          value={impact.affectedTasks.length}
        />
      </section>

      <section className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border p-5">
          <h2 className="font-semibold tracking-tight">
            Supply disruption path
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Maximum downstream dependency depth:{" "}
            {maximumDepth}{" "}
            {maximumDepth === 1 ? "hop" : "hops"}.
          </p>
        </div>

        <div className="space-y-6 p-5">
          <ImpactSection
            icon={<Truck className="h-4 w-4" />}
            title="Supplier"
          >
            <ImpactCard
              name={impact.supplier.name}
              description={`Reliability score: ${Math.round(
                impact.supplier.reliabilityScore * 100
              )}%`}
              root
            />
          </ImpactSection>

          <div className="flex justify-center">
            <ArrowDown className="h-5 w-5 text-muted-foreground" />
          </div>

          <ImpactSection
            icon={<Boxes className="h-4 w-4" />}
            title="Supplied materials"
          >
            <div className="space-y-3">
              {impact.materials.map((material) => (
                <ImpactCard
                  key={material.id}
                  name={material.name}
                  description={`${material.category} · ${material.unit}`}
                />
              ))}
            </div>
          </ImpactSection>

          <div className="flex justify-center">
            <ArrowDown className="h-5 w-5 text-muted-foreground" />
          </div>

          <ImpactSection
            icon={<Search className="h-4 w-4" />}
            title="Affected construction activities"
          >
            <div className="space-y-3">
              {impact.affectedTasks.map((task) => (
                <ImpactCard
                  key={task.id}
                  name={task.name}
                  description={`Dependency depth: ${task.depth} · ${task.priority} priority`}
                />
              ))}

              {impact.affectedTasks.length === 0 && (
                <p className="py-4 text-sm text-muted-foreground">
                  No affected project activities were found.
                </p>
              )}
            </div>
          </ImpactSection>
        </div>
      </section>
    </div>
  );
}

function ImpactSection({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <div className="text-muted-foreground">
          {icon}
        </div>

        <h3 className="text-sm font-semibold">
          {title}
        </h3>
      </div>

      {children}
    </div>
  );
}

function ImpactCard({
  name,
  description,
  root = false,
}: {
  name: string;
  description: string;
  root?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-xl border p-4",
        root
          ? "border-primary/30 bg-primary/5"
          : "border-border bg-background",
      ].join(" ")}
    >
      <p className="font-medium">
        {name}
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function SupplierStat({
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

function EmptySupplierState() {
  return (
    <section className="flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-border bg-card p-6 text-center">
      <div className="max-w-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
          <Truck className="h-5 w-5 text-muted-foreground" />
        </div>

        <h2 className="mt-4 font-semibold">
          Explore supply-chain impact
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Select a supplier to trace its materials into
          construction tasks and discover downstream
          activities that may be affected.
        </p>
      </div>
    </section>
  );
}