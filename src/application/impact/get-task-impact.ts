import type {
  ProjectRepository,
  TaskImpact,
} from "@/domain/project/repositories/project.repository";



export class GetTaskImpact {
  constructor(private readonly repository: ProjectRepository) {}

  async execute(taskId: string, projectId: string,): Promise<TaskImpact | null> {
    return this.repository.getTaskImpact(
      taskId, projectId,
      
    );
  }
}
