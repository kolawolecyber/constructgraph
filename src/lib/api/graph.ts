import type {
  ProjectGraph,GraphNodeDetails
} from "@/types/constructgraph";

export async function getProjectGraph(
  projectId: string
): Promise<ProjectGraph> {
  const response = await fetch(
    `/api/projects/${encodeURIComponent(
      projectId
    )}/graph`
  );

  if (!response.ok) {
    throw new Error(
      "Unable to load project graph."
    );
  }

  const result = await response.json();

  return result.data;
}

export async function getGraphNodeDetails(
  nodeId: string
): Promise<GraphNodeDetails> {
  const response = await fetch(
    `/api/graph/nodes/${encodeURIComponent(
      nodeId
    )}`
  );

  if (!response.ok) {
    throw new Error(
      "Unable to load graph node details."
    );
  }

  const result = await response.json();

  return result.data;
}