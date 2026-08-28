import type {
  ProjectRepository,
  ProjectSupplier,
} from "@/domain/project/repositories/project.repository";

export class GetProjectSuppliers {
  constructor(
    private readonly repository: ProjectRepository
  ) {}

  async execute(
    projectId: string
  ): Promise<ProjectSupplier[]> {
    return this.repository.getProjectSuppliers(projectId);
  }
}