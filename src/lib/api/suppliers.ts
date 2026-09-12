import type {
  ProjectSupplier,
  SupplierImpact,
} from "@/types/constructgraph";

export async function getProjectSuppliers(
  projectId: string
): Promise<ProjectSupplier[]> {
  const response = await fetch(
    `/api/projects/${encodeURIComponent(projectId)}/suppliers`
  );

  if (!response.ok) {
    throw new Error("Unable to load project suppliers.");
  }

  const result = await response.json();

  return result.data;
}

export async function getSupplierImpact(
  projectId: string,
  supplierId: string
): Promise<SupplierImpact> {
  const response = await fetch(
    `/api/projects/${encodeURIComponent(
      projectId
    )}/suppliers/${encodeURIComponent(supplierId)}`
  );

  if (!response.ok) {
    throw new Error("Unable to analyze supplier impact.");
  }

  const result = await response.json();

  return result.data;
}