import type {
  ProjectRepository,
  ProjectTask,
} from "@/domain/project/repositories/project.repository";

export class GetProjectTasks {
  constructor(
    private readonly repository: ProjectRepository
  ) {}

  async execute(
    projectId: string
  ): Promise<ProjectTask[]> {
    return this.repository.getProjectTasks(projectId);
  }
}