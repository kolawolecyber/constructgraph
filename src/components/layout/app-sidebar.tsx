"use client";


import {
  Activity,
  Building2,
  Network,
  PackageSearch,
  Truck,
} from "lucide-react";

type View = "overview" | "impact" | "suppliers"| "graph";

interface AppSidebarProps {
  activeView: View;
  onViewChange: (view: View) => void;
}

const navigation = [
  {
    id: "overview" as const,
    label: "Overview",
    icon: Building2,
  },
  {
    id: "impact" as const,
    label: "Task Impact",
    icon: Activity,
  },
  {
    id: "suppliers" as const,
    label: "Supply Impact",
    icon: Truck,
  },
];


export function AppSidebar({
  activeView,
  onViewChange,
}: AppSidebarProps) {
  return (
    <aside className="hidden min-h-screen w-64 border-r border-border bg-background md:flex md:flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Network className="h-5 w-5" />
        </div>

        <div>
          <p className="font-semibold tracking-tight">
            ConstructGraph
          </p>

          <p className="text-xs text-muted-foreground">
            Construction Intelligence
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onViewChange(item.id)}
              className={[
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              ].join(" ")}
            >
              <Icon className="h-4 w-4" />

              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="rounded-lg bg-muted/50 p-3">
          <div className="flex items-center gap-2">
            <PackageSearch className="h-4 w-4 text-muted-foreground" />

            <span className="text-sm font-medium">
              Graph-powered
            </span>
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            Explore construction dependencies and supply-chain impact.
          </p>
        </div>
      </div>
    </aside>
  );
}

export type { View };