"use client";

import {
  Activity,
  Building2,
  Truck,
} from "lucide-react";

import type { View } from "./app-sidebar";

interface MobileNavProps {
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
    label: "Impact",
    icon: Activity,
  },
  {
    id: "suppliers" as const,
    label: "Suppliers",
    icon: Truck,
  },
];

export function MobileNav({
  activeView,
  onViewChange,
}: MobileNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 px-3 py-2 backdrop-blur md:hidden">
      <div className="grid grid-cols-3 gap-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onViewChange(item.id)}
              className={[
                "flex flex-col items-center gap-1 rounded-lg py-2 text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground",
              ].join(" ")}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}