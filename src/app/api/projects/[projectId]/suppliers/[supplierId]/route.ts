import { apiError, apiSuccess } from "@/lib/api/api-response";
import {
  entityIdSchema,
  projectIdSchema,
} from "@/lib/validation/identifiers";

import { getProjectRepository } from "@/application/projects/project-repository";
import { GetSupplierImpact } from "@/application/impact/get-supplier-impact";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{
      projectId: string;
      supplierId: string;
    }>;
  }
) {
  try {
    const { projectId, supplierId } = await context.params;

    const parsedProjectId = projectIdSchema.safeParse(projectId);

    const parsedSupplierId = entityIdSchema.safeParse(supplierId);

    if (!parsedProjectId.success) {
      return apiError("Invalid project identifier.", 400);
    }

    if (!parsedSupplierId.success) {
      return apiError("Invalid supplier identifier.", 400);
    }

    const useCase = new GetSupplierImpact(
      getProjectRepository()
    );

    const result = await useCase.execute(
      parsedProjectId.data,
      parsedSupplierId.data
    );

    if (!result) {
      return apiError("Supplier not found in project.", 404);
    }

    return apiSuccess(result);
  } catch {
    return apiError("Unable to calculate supplier impact.", 503);
  }
}