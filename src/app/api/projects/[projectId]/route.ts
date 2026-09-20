import { apiError, apiSuccess } from "@/lib/api/api-response";
import { projectIdSchema } from "@/lib/validation/identifiers";

import { getProjectRepository } from "@/application/projects/project-repository";
import { GetProjectOverview } from "@/application/projects/get-project-overview";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ projectId: string }>;
  }
) {
  try {
    const { projectId } = await context.params;

    const parsed = projectIdSchema.safeParse(projectId);

    if (!parsed.success) {
      return apiError("Invalid project identifier.", 400);
    }

    const useCase = new GetProjectOverview(
      getProjectRepository()
    );

    const project = await useCase.execute(parsed.data);

    if (!project) {
      return apiError("Project not found.", 404);
    }

    return apiSuccess(project);
  } catch {
    return apiError("Unable to retrieve project.", 503);
  }
}