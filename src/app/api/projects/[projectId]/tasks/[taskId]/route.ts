import { apiError, apiSuccess } from "@/lib/api/api-response";
import {
  entityIdSchema,
  projectIdSchema,
} from "@/lib/validation/identifiers";

import { getProjectRepository } from "@/application/projects/project-repository";
import { GetTaskImpact } from "@/application/impact/get-task-impact";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{
      projectId: string;
      taskId: string;
    }>;
  }
) {
  try {
    const { projectId, taskId } = await context.params;

    const parsedProjectId = projectIdSchema.safeParse(projectId);

    const parsedTaskId = entityIdSchema.safeParse(taskId);

    if (!parsedProjectId.success) {
      return apiError("Invalid project identifier.", 400);
    }

    if (!parsedTaskId.success) {
      return apiError("Invalid task identifier.", 400);
    }

    const useCase = new GetTaskImpact(
      getProjectRepository()
    );

    const result = await useCase.execute(
      parsedProjectId.data,
      parsedTaskId.data
    );

    if (!result) {
      return apiError("Task not found in project.", 404);
    }

    return apiSuccess(result);
  } catch {
    return apiError("Unable to calculate task impact.", 503);
  }
}