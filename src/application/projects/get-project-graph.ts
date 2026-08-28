import type {
  ProjectRepository,
} from "@/domain/project/repositories/project.repository";

import type {
  ProjectGraph,
} from "@/domain/project/types/graph";

export class GetProjectGraph {
  constructor(
    private readonly repository: ProjectRepository
  ) {}

  async execute(
    projectId: string
  ): Promise<ProjectGraph> {
    return this.repository.getProjectGraph(
      projectId
    );
  }
}