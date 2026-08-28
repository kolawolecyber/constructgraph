import type {
  ProjectRepository,
} from "@/domain/project/repositories/project.repository";

import type {
  GraphNodeDetails,
} from "@/domain/project/types/graph-node";

export class GetGraphNodeDetails {
  constructor(
    private readonly repository: ProjectRepository
  ) {}

  async execute(
    nodeId: string
  ): Promise<GraphNodeDetails | null> {
    return this.repository.getGraphNodeDetails(
      nodeId
    );
  }
}