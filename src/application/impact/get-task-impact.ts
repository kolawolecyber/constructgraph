import type {
  ProjectRepository,
  TaskImpact,
} from "@/domain/project/repositories/project.repository";

export class GetTaskImpact {
  constructor(private readonly repository: ProjectRepository) {}

  async execute(
    projectId: string,
    taskId: string
  ): Promise<TaskImpact | null> {
    return this.repository.getTaskImpact(projectId, taskId);
  }
}