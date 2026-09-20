import { apiError, apiSuccess } from "@/lib/api/api-response";
import { projectIdSchema } from "@/lib/validation/identifiers";

import { getProjectRepository } from "@/application/projects/project-repository";
import { GetProjectGraph } from "@/application/projects/get-project-graph";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ projectId: string }>;
  }
) {
  try {
    const { projectId } =
      await context.params;

    const parsed =
      projectIdSchema.safeParse(projectId);

    if (!parsed.success) {
      return apiError("Invalid project identifier.", 400);
    }

    const repository =
      getProjectRepository();

    const useCase =
      new GetProjectGraph(repository);

    const graph =
      await useCase.execute(parsed.data);

    return apiSuccess(graph);
  } catch {
    return apiError("Unable to load project graph.", 503);
  }
}