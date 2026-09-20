import { apiError, apiSuccess } from "@/lib/api/api-response";
import { projectIdSchema } from "@/lib/validation/identifiers";

import { getProjectRepository } from "@/application/projects/project-repository";
import { GetProjectSuppliers } from "@/application/projects/get-project-suppliers";

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

    const repository = getProjectRepository();

    const useCase = new GetProjectSuppliers(repository);

    const suppliers = await useCase.execute(
      parsed.data
    );

    return apiSuccess(suppliers);
  } catch (error) {
  console.error(
    "[GET /api/projects/:projectId/suppliers] Failed:",
    error
  );

  return apiError("Unable to load project suppliers.", 503);
}
}