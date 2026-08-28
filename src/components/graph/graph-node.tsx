"use client";

import {
  Boxes,
  CircleDot,
  Truck,
} from "lucide-react";

import {
  Handle,
  Position,
  type Node,
  type NodeProps,
} from "@xyflow/react";

type GraphNodeData = {
  label: string;
  nodeType: "task" | "material" | "supplier";
};

type GraphNode = Node<GraphNodeData, "custom">;

const icons = {
  task: CircleDot,
  material: Boxes,
  supplier: Truck,
} as const;

export function GraphNode({
  data,
}: NodeProps<GraphNode>) {
  const Icon = icons[data.nodeType];

  return (
    <div className="min-w-[200px] rounded-xl border border-border bg-card p-3 shadow-sm">
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-muted-foreground"
      />

      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {data.label}
          </p>

          <p className="mt-0.5 text-xs capitalize text-muted-foreground">
            {data.nodeType}
          </p>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-muted-foreground"
      />
    </div>
  );
}