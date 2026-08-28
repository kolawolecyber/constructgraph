export type GraphNodeType =
  | "task"
  | "material"
  | "supplier";

export interface GraphNode {
  id: string;
  entityId: string;
  label: string;
  type: GraphNodeType;
  metadata?: {
    depth?: number;
    priority?: string;
    category?: string;
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}

export interface ProjectGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}