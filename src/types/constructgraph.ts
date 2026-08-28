
export type GraphNodeType =
  | "task"
  | "material"
  | "supplier";

export interface GraphNode {
  id: string;
  entityId: string;
  label: string;
  type: "task" | "material" | "supplier";
  metadata?: {
    priority?: string;
    category?: string;
    depth?: number;
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
export interface Phase {
  id: string;
  name: string;
  sequence: number;
  taskCount: number;
}

export interface ProjectOverview {
  id: string;
  name: string;
  description: string;
  location: string;
  status: string;
  phases: Phase[];
}

export interface TaskImpact {
  task: {
    id: string;
    name: string;
    status: string;
    priority: string;
  };
  affectedTasks: {
    id: string;
    name: string;
    status: string;
    priority: string;
    depth: number;
  }[];
}

export interface ProjectSupplier {
  id: string;
  name: string;
  reliabilityScore: number;
}

export interface ProjectTask {
  id: string;
  name: string;
  status: string;
  priority: string;
  phaseName: string;
}

export interface SupplierImpact {
  supplier: {
    id: string;
    name: string;
    reliabilityScore: number;
  };
  materials: {
    id: string;
    name: string;
    category: string;
    unit: string;
  }[];
  affectedTasks: {
    id: string;
    name: string;
    status: string;
    priority: string;
    depth: number;
  }[];
}

export interface GraphNodeDetails {
  id: string;
  label: string;
  type: "task" | "material" | "supplier";
  properties: {
    priority?: string;
    category?: string;
    unit?: string;
    reliabilityScore?: number;
  };
  relationships: {
    id: string;
    label: string;
    direction: "incoming" | "outgoing";
    nodeId: string;
    nodeLabel: string;
    nodeType: "task" | "material" | "supplier";
  }[];
}