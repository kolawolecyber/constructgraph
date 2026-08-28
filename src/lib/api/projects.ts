import type {
  ProjectOverview,
  ProjectTask,
} from "@/types/constructgraph";

export async function getProjectOverview(
  projectId: string
): Promise<ProjectOverview> {
  const response = await fetch(
    `/api/projects/${encodeURIComponent(projectId)}`
  );

  if (!response.ok) {
    throw new Error("Unable to load project.");
  }

  const result = await response.json();

  return result.data;
}

export async function getProjectTasks(
  projectId: string
): Promise<ProjectTask[]> {
  const response = await fetch(
    `/api/projects/${encodeURIComponent(projectId)}/tasks`
  );

  if (!response.ok) {
    throw new Error("Unable to load project tasks.");
  }

  const result = await response.json();

  return result.data;
}