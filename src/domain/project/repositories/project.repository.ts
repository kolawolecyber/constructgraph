
import type { ProjectGraph } from "@/domain/project/types/graph";
import type { GraphNodeDetails } from "@/domain/project/types/graph-node";

export interface ProjectRepository {
  getProjectOverview(projectId: string): Promise<ProjectOverview | null>;

   getTaskImpact(
    projectId: string,
    taskId: string
  ): Promise<TaskImpact | null>;
  
   getSupplierImpact(
    projectId: string,
    supplierId: string
  ): Promise<SupplierImpact | null>;

getProjectTasks(
  projectId: string
): Promise<ProjectTask[]>;

getProjectSuppliers(
  projectId: string
): Promise<ProjectSupplier[]>;

getProjectGraph(
  projectId: string
): Promise<ProjectGraph>;

getGraphNodeDetails(
   projectId: string,
  nodeId: string
): Promise<GraphNodeDetails | null>;
}

export interface ProjectOverview {
  id: string;
  name: string;
  description: string;
  location: string;
  status: string;
  phases: {
    id: string;
    name: string;
    sequence: number;
    taskCount: number;
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
export interface TaskImpact {
  task: {
    id: string;
    name: string;
    status: string;
     projectId: string,
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
export interface SupplierImpact {
  supplier: {
    id: string;
    name: string;
    projectId: string,
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