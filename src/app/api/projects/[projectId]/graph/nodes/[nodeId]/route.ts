import { apiError, apiSuccess } from "@/lib/api/api-response";
import { projectIdSchema, entityIdSchema } from "@/lib/validation/identifiers";

import { getProjectRepository } from "@/application/projects/project-repository";
import { GetGraphNodeDetails } from "@/application/projects/get-graph-node-details";

interface RouteContext {
  params: Promise<{
    projectId: string;
    nodeId: string;
  }>;
}

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { projectId, nodeId } = await params;

    const parsedProjectId =
      projectIdSchema.safeParse(projectId);

    if (!parsedProjectId.success) {
      return apiError(
        "Invalid project identifier.",
        400
      );
    }

    const parsedNodeId =
      entityIdSchema.safeParse(nodeId);

    if (!parsedNodeId.success) {
      return apiError(
        "Invalid node identifier.",
        400
      );
    }

    const repository =
      getProjectRepository();

    const useCase =
      new GetGraphNodeDetails(repository);

    const node = await useCase.execute(
      parsedProjectId.data,
      parsedNodeId.data
    );

    if (!node) {
      return apiError(
        "Graph node not found.",
        404
      );
    }

    return apiSuccess(node);
  } catch {
    return apiError(
      "Unable to load graph node details.",
      503
    );
  }
}