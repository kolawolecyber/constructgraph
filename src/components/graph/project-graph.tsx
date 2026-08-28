"use client";

import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";

import { GraphNode as CustomGraphNode } from "./graph-node";

import "@xyflow/react/dist/style.css";
import {
  useCallback,
  useState,
} from "react";

import { getGraphNodeDetails } from "@/lib/api/graph";

import { GraphNodeInspector } from "./graph-node-inspector";

import type {
  GraphNode as GraphNodeData,
  ProjectGraph, GraphNodeDetails,
} from "@/types/constructgraph";

interface ProjectGraphProps {
   projectId: string;
  graph: ProjectGraph;
}

const NODE_WIDTH = 220;
const COLUMN_GAP = 120;
const ROW_GAP = 100;

const nodeTypes = {
  default: CustomGraphNode,
};

function buildNodes(
  graphNodes: GraphNodeData[]
): Node[] {
  const grouped = {
    supplier: graphNodes.filter(
      (node) => node.type === "supplier"
    ),
    material: graphNodes.filter(
      (node) => node.type === "material"
    ),
    task: graphNodes.filter(
      (node) => node.type === "task"
    ),
  };

  const columns = [
    grouped.supplier,
    grouped.material,
    grouped.task,
  ];

  return columns.flatMap((column, columnIndex) =>
    column.map((node, rowIndex) => ({
      id: node.id,
      position: {
        x: columnIndex * (NODE_WIDTH + COLUMN_GAP),
        y: rowIndex * ROW_GAP,
      },
      data: {
        label: node.label,
         entityId: node.entityId,
  nodeType: node.type,
      },
      type: "default",
      style: {
        width: NODE_WIDTH,
        borderRadius: 14,
        padding: 12,
      },
    }))
  );
}

function buildEdges(
  graph: ProjectGraph
): Edge[] {
  return graph.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    animated: false,
  }));
}

export function ProjectGraph({
   projectId, graph,
}: ProjectGraphProps) {
  const nodes = buildNodes(graph.nodes);
  const edges = buildEdges(graph);

const [selectedNode, setSelectedNode] =
  useState<GraphNodeDetails | null>(null);

const [loadingNode, setLoadingNode] =
  useState(false);

const handleNodeClick = useCallback(
  async (
    _event: React.MouseEvent,
    node: Node
  ) => {
    const entityId =
      node.data.entityId;

    if (
      typeof entityId !== "string" ||
      entityId.length === 0
    ) {
      return;
    }

    try {
      setLoadingNode(true);

      const details =
        await getGraphNodeDetails(
          projectId,
          entityId
        );

      setSelectedNode(details);
    } catch {
      setSelectedNode(null);
    } finally {
      setLoadingNode(false);
    }
  },
  [projectId]
);

  return (
    <div className="h-[650px] w-full overflow-hidden rounded-2xl border border-border bg-card">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        minZoom={0.25}
        maxZoom={1.8}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        proOptions={{ hideAttribution: true }}
        onNodeClick={handleNodeClick}
      >
        <GraphNodeInspector
  node={selectedNode}
  loading={loadingNode}
  onClose={() => setSelectedNode(null)}
/>
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}