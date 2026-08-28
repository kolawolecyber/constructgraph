import type {
  ProjectOverview,
  ProjectRepository,
} from "@/domain/project/repositories/project.repository";

export class GetProjectOverview {
  constructor(private readonly repository: ProjectRepository) {}

  async execute(projectId: string): Promise<ProjectOverview | null> {
    return this.repository.getProjectOverview(projectId);
  }
}