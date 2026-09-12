import type { TaskImpact } from "@/types/constructgraph";

export async function getTaskImpact(
  projectId: string,
  taskId: string
): Promise<TaskImpact> {
  const response = await fetch(
    `/api/projects/${encodeURIComponent(
      projectId
    )}/tasks/${encodeURIComponent(taskId)}`
  );

  if (!response.ok) {
    throw new Error("Unable to analyze task impact.");
  }

  const result = await response.json();

  return result.data;
}