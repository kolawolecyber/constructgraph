"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  Boxes,
  CircleDot,
  Loader2,
  Truck,
  X,
} from "lucide-react";

import type {
  GraphNodeDetails,
} from "@/types/constructgraph";

interface GraphNodeInspectorProps {
  node: GraphNodeDetails | null;
  loading: boolean;
  onClose: () => void;
}

const icons = {
  task: CircleDot,
  material: Boxes,
  supplier: Truck,
};

export function GraphNodeInspector({
  node,
  loading,
  onClose,
}: GraphNodeInspectorProps) {
  return (
    <aside className="absolute right-4 top-4 z-20 w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-border bg-card/95 p-5 shadow-xl backdrop-blur-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {node && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
              {(() => {
                const Icon =
                  icons[node.type];

                return (
                  <Icon className="h-5 w-5 text-muted-foreground" />
                );
              })()}
            </div>
          )}

          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {node?.type ?? "Graph node"}
            </p>

            <h2 className="mt-1 truncate font-semibold">
              {node?.label ?? "Loading"}
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close node inspector"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex min-h-40 items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-5 w-5 animate-spin" />

            <p className="mt-3 text-sm text-muted-foreground">
              Loading node details...
            </p>
          </div>
        </div>
      ) : node ? (
        <div className="mt-6 space-y-6">
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Properties
            </h3>

            <div className="mt-3 divide-y divide-border rounded-xl border border-border">
              {Object.entries(node.properties)
                .filter(
                  ([, value]) =>
                    value !== undefined &&
                    value !== null
                )
                .map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-4 p-3"
                  >
                    <span className="text-sm capitalize text-muted-foreground">
                      {key.replace(
                        /([A-Z])/g,
                        " $1"
                      )}
                    </span>

                    <span className="max-w-[60%] truncate text-right text-sm font-medium">
                      {typeof value === "number" &&
                      key ===
                        "reliabilityScore"
                        ? `${Math.round(
                            value * 100
                          )}%`
                        : String(value)}
                    </span>
                  </div>
                ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Relationships
              </h3>

              <span className="text-xs text-muted-foreground">
                {node.relationships.length}
              </span>
            </div>

            {node.relationships.length === 0 ? (
              <p className="mt-3 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                No connected entities found.
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                {node.relationships.map(
                  (relationship) => (
                    <div
                      key={relationship.id}
                      className="rounded-xl border border-border p-3"
                    >
                      <div className="flex items-center gap-2">
                        {relationship.direction ===
                        "outgoing" ? (
                          <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ArrowDownLeft className="h-4 w-4 text-muted-foreground" />
                        )}

                        <span className="text-xs font-medium text-muted-foreground">
                          {relationship.label}
                        </span>
                      </div>

                      <p className="mt-2 text-sm font-medium">
                        {relationship.nodeLabel}
                      </p>

                      <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                        {relationship.nodeType}
                      </p>
                    </div>
                  )
                )}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </aside>
  );
}